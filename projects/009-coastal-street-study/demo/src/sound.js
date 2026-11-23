import { MathUtils, Vector3 } from 'three';

const { clamp, lerp, smoothstep } = MathUtils;
const clips = [
  'waves', 'door-open', 'door-close', 'engine-start', 'engine-idle', 'engine-stop',
  'step-l1', 'step-l2', 'step-r1', 'step-r2', 'tire-roll', 'brake-friction',
];

function setPosition(node, { x, y, z }) {
  node.positionX.value = x;
  node.positionY.value = y;
  node.positionZ.value = z;
}

export function createSceneSound(onState) {
  const buffers = new Map();
  const forward = new Vector3();
  const up = new Vector3();
  const wheelPoint = new Vector3();
  const variants = [0, 0];
  let context;
  let master;
  let waves;
  let engine;
  let tires;
  let brakes;
  let loading;
  let ready = false;
  let needsRetry = false;
  let muted = false;
  let engineRunning = false;
  let enginePosition = { x: 0, y: 0, z: 0 };
  let idleAfter = 0;

  function target(param, value, time = .09) {
    param.setTargetAtTime(value, context.currentTime, time);
  }

  function syncMute() {
    if (master) target(master.gain, muted || document.hidden ? 0 : .85, .04);
  }

  function voice(name, { loop = false, position, level = 0, rate = 1, cutoff = 18000 } = {}) {
    const buffer = buffers.get(name);
    if (!buffer) return;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const pan = position ? context.createPanner() : context.createStereoPanner();
    source.buffer = buffer;
    source.loop = loop;
    source.playbackRate.value = rate;
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    gain.gain.value = level;
    if (position) {
      pan.refDistance = 2.6;
      pan.rolloffFactor = .8;
      setPosition(pan, position);
    }
    source.connect(filter).connect(gain).connect(pan).connect(master);
    source.onended = () => {
      for (const node of [source, filter, gain, pan]) node.disconnect();
    };
    source.start();
    return { source, filter, gain, pan };
  }

  async function load() {
    await Promise.all(clips.map(async (name) => {
      try {
        const response = await fetch(import.meta.env.BASE_URL + `audio/${name}.ogg`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        buffers.set(name, await context.decodeAudioData(await response.arrayBuffer()));
      } catch (error) {
        console.warn(`场景声音无法加载 ${name}`, error);
      }
    }));
    waves = voice('waves', { loop: true, cutoff: 3300 });
    engine = voice('engine-idle', { loop: true, position: enginePosition, cutoff: 1700 });
    tires = voice('tire-roll', { loop: true, position: wheelPoint, cutoff: 1900 });
    brakes = voice('brake-friction', { loop: true, position: wheelPoint, cutoff: 2400 });
    ready = buffers.size > 0;
    needsRetry = !ready;
    onState(ready ? 'on' : 'retry');
  }

  async function unlock(retry = false) {
    if (muted || loading || (needsRetry && !retry) || (ready && context?.state === 'running')) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) {
      onState('unavailable');
      return;
    }
    try {
      if (!context) {
        context = new Audio();
        master = context.createGain();
        master.gain.value = 0;
        master.connect(context.destination);
      }
      const resume = context.resume();
      onState(ready ? 'on' : 'loading');
      loading = resume.then(() => {
        syncMute();
        if (!ready) return load();
      });
      await loading;
    } catch (error) {
      console.warn('场景声音无法启动', error);
      onState('off');
    } finally {
      loading = undefined;
    }
  }

  document.addEventListener('visibilitychange', syncMute);

  return {
    unlock,
    toggle() {
      if (ready) {
        muted = !muted;
        syncMute();
        onState(muted ? 'muted' : 'on');
      }
      if (!muted) void unlock(true);
    },
    door(cue, position) {
      if (ready && !muted) voice(cue, { position, level: cue === 'door-close' ? .72 : .76 });
    },
    footstep(side, position, weight = 1, inside = false) {
      if (!ready || muted) return;
      const variation = variants[side]++ % 2;
      const name = `step-${side === 0 ? 'l' : 'r'}${variation + 1}`;
      voice(name, {
        position, level: .72 * weight, rate: variation === 0 ? .97 : 1.04,
        cutoff: inside ? 1000 : 6300,
      });
    },
    setEngine(running, position, playEffect = true) {
      if (running === engineRunning) return;
      engineRunning = running;
      enginePosition = position;
      idleAfter = context ? context.currentTime + (running && playEffect ? .30 : 0) : 0;
      if (ready && playEffect && !muted) {
        voice(running ? 'engine-start' : 'engine-stop', { position, level: running ? .56 : .48, cutoff: 3900 });
      }
    },
    update(camera, position, vehicle, { throttle, brake } = {}, inCar) {
      if (!ready || context.state !== 'running') return;
      const speed = vehicle.speed;
      const roadSpeed = Math.abs(speed);
      const listener = context.listener;
      setPosition(listener, camera.position);
      forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
      up.set(0, 1, 0).applyQuaternion(camera.quaternion);
      listener.forwardX.value = forward.x;
      listener.forwardY.value = forward.y;
      listener.forwardZ.value = forward.z;
      listener.upX.value = up.x;
      listener.upY.value = up.y;
      listener.upZ.value = up.z;

      if (waves) {
        const nearSea = smoothstep(camera.position.x, 1, 8);
        target(waves.gain.gain, lerp(.16, .30, nearSea) * (inCar ? .43 : 1), .38);
        target(waves.filter.frequency, inCar ? 1150 : lerp(2600, 4200, nearSea), .32);
        target(waves.pan.pan, -forward.z * .34, .26);
      }
      if (engine) {
        setPosition(engine.pan, position);
        const active = engineRunning && context.currentTime >= idleAfter;
        const rolling = clamp(roadSpeed / 6.25, 0, 1);
        const pulling = !brake && throttle && (roadSpeed < .19 || Math.sign(speed) === throttle);
        const load = pulling ? smoothstep(rolling, 0, .28) * .65 + .35 : 0;
        target(engine.source.playbackRate, active ? 1 + .61 * rolling + .25 * load : .87, load ? .16 : .25);
        target(engine.gain.gain, active ? .33 + .20 * rolling + .12 * load : 0, active ? .17 : .11);
        target(engine.filter.frequency, 1550 + 900 * rolling + 1100 * load, .20);
      }
      if (tires) {
        const roll = inCar ? smoothstep(roadSpeed, .08, 6.25) : 0;
        setPosition(tires.pan, vehicle.root.localToWorld(wheelPoint.set(0, .16, .76)));
        target(tires.gain.gain, .59 * roll ** .66, .075);
        target(tires.source.playbackRate, lerp(.64, 1.20, roll), .12);
        target(tires.filter.frequency, lerp(1050, 3650, roll), .12);
      }
      if (brakes) {
        const pressure = inCar ? smoothstep(vehicle.brakeDeceleration, .65, 7.2) : 0;
        const motion = smoothstep(roadSpeed, .08, 2.8);
        setPosition(brakes.pan, vehicle.root.localToWorld(wheelPoint.set(0, .23, -1.32)));
        target(brakes.gain.gain, .58 * pressure * motion, .055);
        target(brakes.source.playbackRate, lerp(.70, 1.12, motion), .08);
        target(brakes.filter.frequency, lerp(900, 2800, motion), .08);
      }
    },
  };
}

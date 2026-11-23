import * as THREE from 'three';
import './style.css';
import { boardingDuration, doorOpening, entrySoundCues, exitDoorLatched, exitDuration, exitSoundCues } from './boarding.js';
import { createChaseCamera } from './chase-camera.js';
import { canSitAtLookout, lookoutSeat, onLookout } from './coast-loop.js';
import { createDriving } from './driving.js';
import { lightPresets } from './lighting.js';
import { loadMaterials } from './materials.js';
import { addPeople } from './people.js';
import { addSky } from './overcast-sky.js';
import { addShore, reefMark } from './shore.js';
import { createSceneSound } from './sound.js';
import { addVehicles, addStreet, cameraIsClear, canWalk, carStart, chaseCameraIsClear, drivingGuide, fixedViews, harbourArchive, limits, startView, walkHeight, walkLimitX } from './street.js';
import { addLookoutTelescope, createTelescopeView, telescopeSite } from './telescope.js';

const canvas = document.querySelector('#view');
const loading = document.querySelector('#loading');
const hud = document.querySelector('#hud');
const perspective = document.querySelector('#perspective');
const reset = document.querySelector('#reset');
const views = document.querySelector('#views');
const lightingMenu = document.querySelector('#lighting');
const lightingLabel = lightingMenu.querySelector('summary');
const lightingButtons = lightingMenu.querySelectorAll('button[data-light]');
const visitorView = views.querySelector('[data-view="lookout-visitor"]');
const walkthrough = document.querySelector('#walkthrough');
const record = document.querySelector('#record');
const status = document.querySelector('#status');
const walkControls = document.querySelector('#walk-controls');
const driveControls = document.querySelector('#drive-controls');
const interaction = document.querySelector('#vehicle-interaction');
const interactionLabel = interaction.querySelector('span');
const benchAction = document.querySelector('#bench-action');
const benchLabel = benchAction.querySelector('span');
const archiveAction = document.querySelector('#archive-action');
const archiveDialog = document.querySelector('#archive');
const archivePhoto = document.querySelector('#archive-photo');
const telescopeAction = document.querySelector('#telescope-action');
const telescopeOverlay = document.querySelector('#telescope-overlay');
const telescopeControls = document.querySelector('#telescope-controls');
const telescopeExit = document.querySelector('#telescope-exit');
const telescopeWider = document.querySelector('#telescope-wider');
const telescopeCloser = document.querySelector('#telescope-closer');
const telescopeZoom = document.querySelector('#telescope-zoom');
const speedReadout = document.querySelector('#speed');
const routeGuide = document.querySelector('#route-guide');
const soundToggle = document.querySelector('#sound');
const recordingSupported = Boolean(window.MediaRecorder && canvas.captureStream);
const soundLabels = { off: '开启声音', loading: '声音加载中', on: '声音已开', muted: '声音已静音', retry: '重试声音', unavailable: '声音不可用' };
const sound = createSceneSound((mode) => {
  soundToggle.textContent = soundLabels[mode];
  soundToggle.setAttribute('aria-pressed', String(mode === 'on'));
  soundToggle.disabled = mode === 'loading' || mode === 'unavailable';
});

const eyeHeight = 1.65;
const walkingSpeed = 1.58;
const followDistance = 3.52;
const reviewDuration = 20_000;
const route = new THREE.CatmullRomCurve3([
  [startView.x, startView.z], [1.09, -1.35], [1.38, -5.38], [1.18, -10.1],
  [1.25, -15.55], [3.07, -16.36], [4.58, -16.23], [5.28, -18.76],
  [5.69, -21.46], [6.0, -22.64],
].map(([x, z]) => new THREE.Vector3(x, 0, z)));

const looks = [
  [0, startView.yaw, startView.pitch], [.18, .16, -.075], [.37, .21, -.115],
  [.50, -.11, -.053], [.66, -.49, -.080], [.83, -.45, -.082], [1, -.74, -.102],
];

const keyCodes = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);
const keys = new Set();
const state = { ...startView, ground: 0, facing: Math.PI + startView.yaw, speed: 0 };
const order = new THREE.Euler(0, 0, 0, 'YXZ');
const aim = new THREE.Vector3();
const boardingCameraPosition = new THREE.Vector3();
const boardingCameraRotation = new THREE.Quaternion();
const boardingCameraFocus = new THREE.Vector3();
const soundPoint = new THREE.Vector3();
const enginePoint = new THREE.Vector3();
const benchCamera = new THREE.Vector3(lookoutSeat.x - 1.72, 1.97, lookoutSeat.z + 2.37);
const benchFocus = new THREE.Vector3(lookoutSeat.x + 1.30, 1.10, lookoutSeat.z - .46);
const benchSeaFocus = new THREE.Vector3(reefMark.x, .6, reefMark.z);
const visitorFocus = new THREE.Vector3();
const visitorCamera = new THREE.Vector3();
const chaseCamera = createChaseCamera(chaseCameraIsClear);

let camera;
let renderer;
let people;
let vehicle;
let telescope;
let walkingFov = 51;
let driving = false;
let lastCollision = '';
let boarding;
let bench;
let displayedSpeed = 0;
let review;
let capturing = false;
let pointer;
let noticeTimer;
let worldTime = 0;
let reachedBoundary = false;
let thirdPerson = true;
let inspecting = false;
let observingVisitor = false;
let cameraDistance = followDistance;
let previousTime = performance.now();

function showStatus(message, timeout) {
  window.clearTimeout(noticeTimer);
  status.value = message;
  if (timeout) noticeTimer = window.setTimeout(() => { status.value = ''; }, timeout);
}

function setInspection(value) {
  if (observingVisitor && !value) showStatus('');
  if (!value) observingVisitor = false;
  inspecting = value;
  const third = thirdPerson && !inspecting;
  perspective.textContent = observingVisitor ? '跟拍行人' : third ? '第三人称' : '第一人称';
  perspective.setAttribute('aria-pressed', String(third));
}

function placeWalker(view, inspection = false) {
  setInspection(inspection);
  Object.assign(state, view, {
    ground: walkHeight(view.x, view.z), facing: view.facing ?? Math.PI + view.yaw, speed: 0,
  });
  cameraDistance = followDistance;
}

function setView(view, inspection = false) {
  if (observingVisitor) setInspection(false);
  placeWalker(view, inspection);
  syncCamera(0);
}

function clearCameraDistance(x, y, z, dx, dy, dz, distance, obstacle) {
  const step = distance / 16;
  const clearAt = (t) => cameraIsClear(x + t * dx, y + t * dy, z + t * dz, obstacle);
  for (let t = step; t <= distance + .001; t += step) {
    if (clearAt(t)) continue;
    let safe = t - step;
    let blocked = t;
    for (let i = 0; i < 5; i++) {
      const candidate = (safe + blocked) / 2;
      if (clearAt(candidate)) safe = candidate;
      else blocked = candidate;
    }
    return Math.max(.18, safe - .015 * distance);
  }
  return distance;
}

function followPlayer(dt) {
  const { x, z, ground, yaw, pitch } = state;
  const shoulder = .29;
  const pivotX = Math.max(walkLimitX(z) - .04, x + Math.cos(yaw) * shoulder);
  const pivotZ = z - Math.sin(yaw) * shoulder;
  const pivotY = ground + 1.31;
  const rise = THREE.MathUtils.clamp(.25 - pitch, -.12, 1.24);
  const backX = Math.sin(yaw) * Math.cos(rise);
  const backZ = Math.cos(yaw) * Math.cos(rise);
  const backY = Math.sin(rise);
  const clearDistance = clearCameraDistance(pivotX, pivotY, pivotZ, backX, backY, backZ, followDistance, vehicle.pose);
  cameraDistance = Math.min(clearDistance, THREE.MathUtils.damp(cameraDistance, clearDistance, 9, dt));
  camera.position.set(pivotX + cameraDistance * backX, pivotY + cameraDistance * backY, pivotZ + cameraDistance * backZ);
  aim.set(pivotX, pivotY + Math.max(0, pitch - .14) * 2.5, pivotZ);
  camera.lookAt(aim);
}

function followCar(dt) {
  const { position, target } = chaseCamera.update(vehicle.pose, vehicle.speed, dt);
  camera.position.copy(position);
  camera.lookAt(aim.copy(target));
}

function walkingCamera(dt) {
  if (thirdPerson && !inspecting) {
    followPlayer(dt);
  } else {
    camera.position.set(state.x, state.ground + state.eye, state.z);
    order.set(state.pitch, state.yaw, 0);
    camera.quaternion.setFromEuler(order);
  }
}

function followBoarding(dt) {
  const { elapsed, approach, entering, duration, startCamera, startFocus, startRotation } = boarding;
  const { lerp, smoothstep } = THREE.MathUtils;
  const actionTime = Math.max(0, elapsed - approach);
  const seated = entering ? smoothstep(actionTime, 1.10, 2.35) : 1 - smoothstep(actionTime, 1.89, 2.57);
  const outside = vehicle.localPoint(lerp(entering ? 3.70 : 3.82, 3.48, seated), lerp(2.08, 1.93, seated));
  const focus = vehicle.localPoint(lerp(1.06, .78, seated), entering ? -.22 : lerp(-.14, -.30, seated));
  const focusY = lerp(.99, .90, seated);
  const dx = outside.x - focus.x;
  const dy = lerp(2.04, 2.14, seated) - focusY;
  const dz = outside.z - focus.z;
  const clear = clearCameraDistance(focus.x, focusY, focus.z, dx, dy, dz, 1);
  camera.position.set(focus.x + clear * dx, focusY + clear * dy, focus.z + clear * dz);
  camera.lookAt(aim.set(focus.x, focusY, focus.z));
  const intoShot = smoothstep(elapsed, 0, .53);
  if (intoShot < 1) {
    camera.position.lerp(startCamera, 1 - intoShot);
    if (Math.abs(camera.quaternion.dot(startRotation)) < .62) {
      // Interpolating targets for nearly opposite views can pass through the lens.
      camera.quaternion.slerp(startRotation, 1 - intoShot);
    } else {
      camera.lookAt(aim.lerp(startFocus, 1 - intoShot));
    }
  }

  const blendOut = smoothstep(actionTime, entering ? duration - .53 : exitDoorLatched, duration);
  if (blendOut) {
    boardingCameraPosition.copy(camera.position);
    boardingCameraRotation.copy(camera.quaternion);
    boardingCameraFocus.copy(aim);
    if (entering) followCar(dt);
    else walkingCamera(dt);
    camera.position.lerp(boardingCameraPosition, 1 - blendOut);
    if (entering || thirdPerson) {
      camera.lookAt(aim.lerp(boardingCameraFocus, 1 - blendOut));
    } else {
      camera.quaternion.slerp(boardingCameraRotation, 1 - blendOut);
    }
  }
}

function followVisitor(dt) {
  const { position, phase } = people.visitor;
  const blend = dt ? 1 - Math.exp(-5 * dt) : 1;
  visitorCamera.set(position.x - 2.7, position.y + 2.35, position.z + 4.2);
  camera.position.lerp(visitorCamera, blend);
  visitorCamera.set(position.x + .35, position.y + .94, position.z - .34);
  visitorFocus.lerp(visitorCamera, blend);
  camera.lookAt(visitorFocus);
  if (status.value !== phase) showStatus(phase);
}

function syncCamera(dt) {
  let lensOpacity = 0;
  if (boarding) followBoarding(dt);
  else if (driving) followCar(dt);
  else if (bench) followBench();
  else if (telescope.active) lensOpacity = followTelescope(dt);
  else if (observingVisitor) followVisitor(dt);
  else walkingCamera(dt);
  const cameraAtWalker = Math.hypot(camera.position.x - state.x, camera.position.z - state.z) < .65;
  if (boarding && !boarding.entering && !thirdPerson && cameraAtWalker && people.driver) {
    people.driver.root.visible = false;
  }
  const walkingVisible = bench ? thirdPerson : boarding
    ? boarding.entering && boarding.elapsed < boarding.approach && !cameraAtWalker
    : thirdPerson && !inspecting && !driving && cameraDistance > .80
      && (!telescope.active || (!cameraAtWalker && lensOpacity < .5));
  people.updatePlayer({ ...state, seatBlend: bench?.blend, visible: walkingVisible, dt });
}

function switchPerspective() {
  if (driving || boarding || bench || telescope.active) return;
  thirdPerson = !(thirdPerson && !inspecting);
  setInspection(false);
  cameraDistance = followDistance;
  syncCamera(0);
  canvas.focus();
}

function updateVehicleControls() {
  const locked = Boolean(boarding || bench || telescope.active);
  routeGuide.hidden = !driving || locked;
  if (!driving || locked) routeGuide.textContent = '';
  driveControls.hidden = !driving || locked;
  speedReadout.hidden = !driving || locked;
  walkControls.hidden = driving || locked;
  perspective.hidden = driving || locked;
  views.hidden = driving || locked;
  views.open = false;
  lightingMenu.open = false;
  walkthrough.hidden = driving || locked;
  record.hidden = driving || locked || !recordingSupported;
  interactionLabel.textContent = driving ? '下车' : '上车';
  interaction.hidden = locked || !driving;
}

function setDriving(value) {
  driving = value;
  sound.setEngine(value, getEnginePoint(), value);
  if (people.driver) people.driver.root.visible = value;
  updateVehicleControls();
  lastCollision = '';
  keys.clear();
}

function getEnginePoint() {
  return vehicle.root.localToWorld(enginePoint.set(0, .56, -1.45));
}

function toggleVehicle() {
  if (capturing || review || boarding || inspecting || bench || telescope.active) return;
  if (driving && Math.abs(vehicle.speed) > .24) {
    showStatus('请刹停后再下车', 1600);
    return;
  }
  if (!driving && !vehicle.canEnter(state.x, state.z)) {
    showStatus('走到蓝灰色车的右前门旁，按 E 上车', 2300);
    return;
  }
  const access = vehicle.doorAccess(people.blocks);
  if (!access) {
    showStatus(driving ? '右侧车门空间不足，请挪动车辆' : '右侧车门没有足够的开启空间', 2200);
    return;
  }
  vehicle.park();
  if (!driving) chaseCamera.reset(vehicle.pose);
  keys.clear();
  pointer = undefined;
  const distance = Math.hypot(access.point.x - state.x, access.point.z - state.z);
  const focusDistance = THREE.MathUtils.clamp(camera.position.distanceTo(vehicle.root.position), 2.9, 6.5);
  const startFocus = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(focusDistance).add(camera.position);
  boarding = {
    entering: !driving, access, elapsed: 0,
    soundCues: driving ? exitSoundCues : entrySoundCues, nextSound: 0,
    duration: driving ? exitDuration : boardingDuration,
    approach: driving ? 0 : Math.max(thirdPerson ? .18 : .46, distance / 1.42 + .12),
    fromX: state.x, fromZ: state.z, facing: vehicle.pose.rotation - Math.PI / 2,
    startCamera: camera.position.clone(), startFocus, startRotation: camera.quaternion.clone(),
  };
  if (driving) {
    sound.setEngine(false, getEnginePoint());
    placeWalker({ ...startView, ...access.point, yaw: vehicle.pose.rotation, facing: boarding.facing });
  }
  updateVehicleControls();
  showStatus(driving ? '正在下车' : '正在上车');
  canvas.focus();
}

function tickBoarding(dt) {
  const clip = boarding;
  clip.elapsed += dt;
  vehicle.settle(dt);
  if (clip.elapsed < clip.approach) {
    const phase = THREE.MathUtils.smoothstep(clip.elapsed, 0, clip.approach);
    const { x, z } = state;
    state.x = THREE.MathUtils.lerp(clip.fromX, clip.access.point.x, phase);
    state.z = THREE.MathUtils.lerp(clip.fromZ, clip.access.point.z, phase);
    settleGround(dt);
    updateMotion(x, z, dt);
    const turn = clip.facing - state.facing;
    state.facing += Math.atan2(Math.sin(turn), Math.cos(turn)) * THREE.MathUtils.smoothstep(phase, .46, 1);
    return;
  }
  state.speed = 0;
  const time = Math.min(clip.elapsed - clip.approach, clip.duration);
  vehicle.driverDoor.setAngle(clip.access.angle * doorOpening(time, clip.entering));
  if (people.driver) {
    people.driver.root.visible = true;
    people.driver.sample(time, vehicle, clip.access.stand.y, clip.entering);
  }
  let cue = clip.soundCues[clip.nextSound];
  while (cue && cue.time <= time) {
    if (cue.door) {
      vehicle.driverDoor.outerGrip.getWorldPosition(soundPoint);
      sound.door(cue.door, soundPoint);
    } else {
      const point = people.driver?.footPosition(cue.foot, soundPoint)
        ?? soundPoint.set(clip.access.point.x, vehicle.root.position.y + clip.access.stand.y, clip.access.point.z);
      sound.footstep(cue.foot, point, cue.weight, cue.inside);
    }
    cue = clip.soundCues[++clip.nextSound];
  }
  if (time < clip.duration) return;
  boarding = undefined;
  setDriving(clip.entering);
  showStatus('');
  if (driving) updateSpeed();
}

function resetScene() {
  boarding = undefined;
  bench = undefined;
  stopWalk();
  setDriving(false);
  vehicle.reset();
  setView(startView);
  canvas.focus();
}

function updateSpeed() {
  const current = Math.round(Math.abs(vehicle.speed) * 3.6);
  if (current === displayedSpeed) return;
  displayedSpeed = current;
  speedReadout.firstChild.nodeValue = current + ' ';
}

function drivingInput() {
  const throttle = Number(keys.has('KeyW') || keys.has('ArrowUp'))
    - Number(keys.has('KeyS') || keys.has('ArrowDown'));
  const turn = Number(keys.has('KeyA') || keys.has('ArrowLeft'))
    - Number(keys.has('KeyD') || keys.has('ArrowRight'));
  return { throttle, turn, brake: keys.has('Space') };
}

function tickDriving(dt) {
  const input = drivingInput();
  const blocked = vehicle.update(input, dt);
  const guide = drivingGuide(vehicle.pose);
  if (routeGuide.textContent !== guide) routeGuide.textContent = guide;
  const hit = blocked ? vehicle.obstruction : undefined;
  let collision = '';
  if (hit?.kind === 'street-end') collision = '已到街尾，可在回车区掉头';
  if (hit?.kind === 'street-start') collision = '已到主街起点，可掉头返回';
  if (hit?.kind === 'curb') collision = hit.side + '碰到路缘';
  if (hit?.kind === 'parked') collision = hit.side + '碰到停放车辆';
  if (hit?.kind === 'pedestrian') collision = hit.side + '有行人，车辆已停下';
  if (collision && collision !== lastCollision) showStatus(collision, 2400);
  lastCollision = collision;
  updateSpeed();
  return input;
}

function updateBenchAction() {
  const near = !interaction.hidden ? false : canSitAtLookout(state.x, state.z);
  benchAction.hidden = driving || Boolean(boarding || review) || capturing || inspecting
    || telescope.active || !people.canSit || (bench ? bench.direction !== 0 : !near);
  const label = bench ? '起身' : '坐下看海';
  if (benchLabel.textContent !== label) benchLabel.textContent = label;
}

function toggleBench() {
  if (driving || boarding || capturing || review || inspecting || telescope.active) return;
  if (bench) {
    if (!bench.direction) bench.direction = -1;
  } else {
    if (!people.canSit || !canSitAtLookout(state.x, state.z)) return;
    const turn = Math.PI / 2 - state.facing;
    bench = {
      from: { ...state }, progress: 0, blend: 0, direction: 1,
      turn: Math.atan2(Math.sin(turn), Math.cos(turn)),
      position: camera.position.clone(),
      orientation: camera.quaternion.clone(),
      destination: thirdPerson ? benchCamera : new THREE.Vector3(lookoutSeat.x + .09, 1.24, lookoutSeat.z),
    };
  }
  keys.clear();
  pointer = undefined;
  updateVehicleControls();
  updateBenchAction();
  canvas.focus();
}

function tickBench(dt) {
  const { clamp, lerp, smoothstep } = THREE.MathUtils;
  const seat = bench;
  seat.progress = clamp(seat.progress + seat.direction * dt / 1.22, 0, 1);
  seat.blend = smoothstep(seat.progress, .32, 1);
  const align = smoothstep(seat.progress, 0, .38);
  state.x = lerp(lerp(seat.from.x, lookoutSeat.standX, align), lookoutSeat.x - .025, seat.blend);
  state.z = lerp(seat.from.z, lookoutSeat.z, align);
  state.facing = seat.from.facing + seat.turn * align;
  state.ground = walkHeight(state.x, state.z);
  state.speed = 0;
  if (seat.direction > 0 && seat.progress === 1) seat.direction = 0;
  if (seat.direction < 0 && seat.progress === 0) {
    Object.assign(state, seat.from, { speed: 0 });
    bench = undefined;
    updateVehicleControls();
  }
}

function followBench() {
  const blend = THREE.MathUtils.smoothstep(bench.progress, 0, .94);
  camera.position.lerpVectors(bench.position, bench.destination, blend);
  camera.lookAt(thirdPerson ? benchFocus : benchSeaFocus);
  camera.quaternion.slerp(bench.orientation, 1 - blend);
}

function canUseTelescope() {
  return !driving && !boarding && !bench && !telescope.active && !review && !capturing
    && !inspecting && !archiveDialog.open && onLookout(state.x, state.z)
    && Math.hypot(state.x - telescopeSite.x, state.z - telescopeSite.z) <= 1.52;
}

function useTelescope() {
  if (!canUseTelescope()) return;
  keys.clear();
  pointer = undefined;
  state.speed = 0;
  showStatus('');
  telescope.enter();
  telescopeAction.hidden = true;
  telescopeOverlay.hidden = false;
  hud.classList.add('viewing-through-telescope');
  updateVehicleControls();
  canvas.focus();
}

function leaveTelescope() {
  keys.clear();
  pointer = undefined;
  telescope.exit();
  telescopeControls.hidden = true;
  canvas.focus();
}

function followTelescope(dt) {
  const { forward, side } = directionInput();
  telescope.pan(-side * dt * 1.65, forward * dt * 1.15);
  const opacity = telescope.update(dt, walkingFov);
  telescopeOverlay.style.opacity = opacity;
  if (!telescope.active) {
    telescopeOverlay.hidden = true;
    hud.classList.remove('viewing-through-telescope');
    updateVehicleControls();
  }
  telescopeControls.hidden = !telescope.ready;
  if (telescope.ready) {
    const value = telescope.zoom.toFixed(1) + '×';
    if (telescopeZoom.value !== value) telescopeZoom.value = value;
    telescopeWider.disabled = !telescope.canZoomOut;
    telescopeCloser.disabled = !telescope.canZoomIn;
  }
  return opacity;
}

function canReadArchive() {
  return !driving && !boarding && !bench && !telescope.active && !review && !capturing && !observingVisitor && !archiveDialog.open
    && state.x < -5.28 && Math.abs(state.z - harbourArchive.z) < 1.12;
}

function openArchive() {
  if (!canReadArchive()) return;
  keys.clear();
  pointer = undefined;
  if (!archivePhoto.src) archivePhoto.src = import.meta.env.BASE_URL + harbourArchive.photo;
  archiveDialog.showModal();
}

function settleGround(dt) {
  const height = walkHeight(state.x, state.z);
  state.ground = Math.max(height, THREE.MathUtils.damp(state.ground, height, 18, dt));
}

function updateMotion(x, z, dt) {
  const dx = state.x - x;
  const dz = state.z - z;
  state.speed = dt ? Math.min(walkingSpeed * 1.15, Math.hypot(dx, dz) / dt) : 0;
  if (state.speed < .12) return;
  const angle = Math.atan2(dx, dz) - state.facing;
  state.facing += Math.atan2(Math.sin(angle), Math.cos(angle)) * (1 - Math.exp(-15 * dt));
}

function stopWalk(message = '') {
  review = undefined;
  walkthrough.textContent = '自动走一遍';
  walkthrough.setAttribute('aria-pressed', 'false');
  if (message) showStatus(message, 2600);
  else if (!capturing) showStatus('');
}

function startWalk() {
  keys.clear();
  views.open = false;
  vehicle.reset();
  setView(startView);
  worldTime = 0;
  review = { started: performance.now() };
  walkthrough.textContent = '停止导览';
  walkthrough.setAttribute('aria-pressed', 'true');
  showStatus(capturing ? '正在录制 20 秒步行预览' : '正在沿街走向海堤');
}

function reviewLook(progress) {
  const upper = looks.findIndex(([at]) => at >= progress);
  if (upper < 1) return looks[upper === 0 ? 0 : looks.length - 1].slice(1);
  const [from, yawFrom, pitchFrom] = looks[upper - 1];
  const [to, yawTo, pitchTo] = looks[upper];
  const blend = THREE.MathUtils.smoothstep(progress, from, to);
  return [THREE.MathUtils.lerp(yawFrom, yawTo, blend), THREE.MathUtils.lerp(pitchFrom, pitchTo, blend)];
}

function tickReview(time, dt) {
  const progress = Math.min(1, (time - review.started) / reviewDuration);
  const next = route.getPointAt(Math.max(0, progress));
  if (canWalk(next.x, next.z, vehicle.pose)) {
    state.x = next.x;
    state.z = next.z;
  }
  [state.yaw, state.pitch] = reviewLook(progress);
  settleGround(dt);
  if (progress === 1) stopWalk(capturing ? '' : '已走到海堤，拖动画面继续查看');
}

function directionInput() {
  return {
    forward: Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown')),
    side: Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')),
  };
}

function tickWalking(dt) {
  const { forward, side } = directionInput();
  if (forward || side) {
    const stride = walkingSpeed * dt / Math.max(1, Math.hypot(forward, side));
    const dx = (side * Math.cos(state.yaw) - forward * Math.sin(state.yaw)) * stride;
    const dz = (-forward * Math.cos(state.yaw) - side * Math.sin(state.yaw)) * stride;
    if (canWalk(state.x + dx, state.z, vehicle.pose) && !people.blocks(state.x + dx, state.z)) state.x += dx;
    const nextZ = state.z + dz;
    if (canWalk(state.x, nextZ, vehicle.pose) && !people.blocks(state.x, nextZ)) state.z = nextZ;
    const atEnd = nextZ < limits.minZ || nextZ > limits.maxZ;
    if (atEnd && !reachedBoundary) showStatus('已到街道边缘，按 R 回到起点', 2100);
    reachedBoundary = atEnd;
    state.eye = THREE.MathUtils.damp(state.eye, eyeHeight, 9, dt);
  } else {
    reachedBoundary = false;
  }
  settleGround(dt);
}

function downloadRecording(blob, extension) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'coastal-street-walkthrough.' + extension;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function recordWalk() {
  if (capturing || driving || boarding || bench || telescope.active || !recordingSupported) return;
  const stream = canvas.captureStream(30);
  const mimeType = ['video/webm;codecs=vp8', 'video/webm', 'video/mp4']
    .find((type) => MediaRecorder.isTypeSupported(type));
  let movie;
  try {
    movie = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: 4_000_000 });
  } catch {
    stream.getTracks().forEach((track) => track.stop());
    showStatus('当前浏览器无法录制画面', 4200);
    return;
  }
  const chunks = [];
  movie.ondataavailable = ({ data }) => { if (data.size) chunks.push(data); };
  movie.onstop = () => {
    capturing = false;
    record.disabled = false;
    perspective.disabled = false;
    reset.disabled = false;
    walkthrough.disabled = false;
    stream.getTracks().forEach((track) => track.stop());
    const type = movie.mimeType || 'video/webm';
    if (!chunks.length) {
      showStatus('录制没有收到画面，请在前台重试', 4200);
      return;
    }
    downloadRecording(new Blob(chunks, { type }), type.includes('mp4') ? 'mp4' : 'webm');
    showStatus('步行实录已生成', 3000);
  };
  movie.onerror = () => {
    if (movie.state !== 'inactive') movie.stop();
    showStatus('录制中断', 4200);
  };
  capturing = true;
  record.disabled = true;
  perspective.disabled = true;
  reset.disabled = true;
  walkthrough.disabled = true;
  startWalk();
  movie.start(250);
  window.setTimeout(() => { if (movie.state !== 'inactive') movie.stop(); }, reviewDuration + 500);
}

function inspectionView(name) {
  const view = fixedViews[name];
  if (name !== 'curb' && name !== 'cabin') return view;
  const angle = vehicle.pose.rotation - carStart.rotation;
  const dx = view.x - carStart.x;
  const dz = view.z - carStart.z;
  return {
    ...view,
    x: vehicle.pose.x + dx * Math.cos(angle) + dz * Math.sin(angle),
    z: vehicle.pose.z - dx * Math.sin(angle) + dz * Math.cos(angle),
    yaw: view.yaw + angle,
  };
}

function connectControls(changeLighting) {
  visitorView.hidden = !people.visitor;
  soundToggle.addEventListener('click', () => {
    sound.toggle();
    canvas.focus();
  });
  hud.addEventListener('click', (event) => {
    if (event.target !== soundToggle) void sound.unlock();
  });
  perspective.addEventListener('click', switchPerspective);
  reset.addEventListener('click', resetScene);
  interaction.addEventListener('click', toggleVehicle);
  benchAction.addEventListener('click', toggleBench);
  telescopeAction.addEventListener('click', useTelescope);
  telescopeExit.addEventListener('click', leaveTelescope);
  for (const [button, steps] of [[telescopeWider, -1], [telescopeCloser, 1]]) {
    button.addEventListener('click', () => {
      telescope.changeZoom(steps);
      canvas.focus();
    });
  }
  archiveAction.addEventListener('click', openArchive);
  archiveDialog.addEventListener('close', () => canvas.focus());
  lightingMenu.addEventListener('toggle', () => {
    if (lightingMenu.open) views.open = false;
  });
  views.addEventListener('toggle', () => {
    if (views.open) lightingMenu.open = false;
  });
  for (const button of lightingButtons) {
    button.addEventListener('click', () => {
      changeLighting(button.dataset.light);
      lightingLabel.textContent = button.textContent;
      for (const option of lightingButtons) option.setAttribute('aria-pressed', String(option === button));
      lightingMenu.open = false;
      canvas.focus();
    });
  }
  views.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-view]');
    if (target && !capturing && !driving && !boarding && !bench && !telescope.active) {
      stopWalk();
      keys.clear();
      views.open = false;
      if (target === visitorView) {
        people.visitor.restart();
        observingVisitor = true;
        setInspection(true);
        syncCamera(0);
      } else {
        setView(inspectionView(target.dataset.view), true);
        showStatus(target.textContent, 1600);
      }
      canvas.focus();
    }
  });
  walkthrough.addEventListener('click', () => {
    if (driving || boarding || bench || telescope.active) return;
    if (review) stopWalk();
    else startWalk();
    canvas.focus();
  });
  record.addEventListener('click', recordWalk);
  record.hidden = !recordingSupported;
  window.addEventListener('keydown', (event) => {
    if (capturing || archiveDialog.open || event.ctrlKey || event.metaKey || event.altKey) return;
    if (telescope.active) {
      if (event.code === 'Escape' || event.code === 'KeyT') {
        event.preventDefault();
        if (!event.repeat) leaveTelescope();
      } else if (keyCodes.has(event.code)) {
        event.preventDefault();
        keys.add(event.code);
      } else if (['Equal', 'NumpadAdd', 'Minus', 'NumpadSubtract'].includes(event.code)) {
        event.preventDefault();
        telescope.changeZoom(event.code === 'Equal' || event.code === 'NumpadAdd' ? 1 : -1);
      }
      return;
    }
    if (keyCodes.has(event.code) || event.code === 'KeyE') void sound.unlock();
    if (event.code === 'KeyR' && !event.repeat) {
      resetScene();
      return;
    }
    if (event.code === 'KeyF' && !event.repeat && !benchAction.hidden) {
      event.preventDefault();
      toggleBench();
      return;
    }
    if (event.code === 'KeyG' && !event.repeat && !archiveAction.hidden) {
      event.preventDefault();
      openArchive();
      return;
    }
    if (event.code === 'KeyT' && !event.repeat && !telescopeAction.hidden) {
      event.preventDefault();
      void sound.unlock();
      useTelescope();
      return;
    }
    if (boarding || bench) {
      if (keyCodes.has(event.code) || event.code === 'Space') event.preventDefault();
      return;
    }
    if (event.code === 'KeyE' && !event.repeat) {
      event.preventDefault();
      toggleVehicle();
      return;
    }
    if (event.code === 'KeyC' && !event.repeat) {
      event.preventDefault();
      switchPerspective();
      return;
    }
    if ((driving && event.code === 'Space') || keyCodes.has(event.code)) {
      event.preventDefault();
      if (review) stopWalk();
      views.open = false;
      lightingMenu.open = false;
      if (inspecting) setInspection(false);
      keys.add(event.code);
    }
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => { keys.clear(); pointer = undefined; });
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || capturing || driving || boarding || bench) return;
    void sound.unlock();
    if (review) stopWalk();
    if (observingVisitor) setInspection(false);
    views.open = false;
    lightingMenu.open = false;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.focus();
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (pointer?.id !== event.pointerId) return;
    const yaw = (pointer.x - event.clientX) * .0035;
    const pitch = (pointer.y - event.clientY) * .0035;
    if (telescope.active) telescope.pan(yaw, pitch);
    else {
      state.yaw += yaw;
      state.pitch = THREE.MathUtils.clamp(state.pitch + pitch, -1.12, 1.05);
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  canvas.addEventListener('wheel', (event) => {
    if (!telescope.active) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 3 : event.deltaMode === 2 ? 1 : 100;
    telescope.changeZoom(THREE.MathUtils.clamp(-event.deltaY / unit, -2, 2));
  }, { passive: false });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(name, (event) => {
      if (event.pointerId === pointer?.id) pointer = undefined;
    });
  }
}

function addLight(scene) {
  const ambient = new THREE.HemisphereLight();
  scene.add(ambient);
  const skyDirection = new THREE.DirectionalLight();
  skyDirection.target.position.set(-1, 0, -12);
  skyDirection.castShadow = true;
  skyDirection.shadow.mapSize.set(1024, 1024);
  Object.assign(skyDirection.shadow.camera, {
    near: .9, far: 86, left: -22, right: 22, top: 23, bottom: -23,
  });
  skyDirection.shadow.normalBias = .032;
  skyDirection.shadow.bias = -.00012;
  skyDirection.shadow.radius = 3;
  scene.add(skyDirection, skyDirection.target);
  let shadowCenter = -12;
  const offset = new THREE.Vector3();
  function positionLight() {
    skyDirection.target.position.z = shadowCenter;
    skyDirection.position.copy(skyDirection.target.position).add(offset);
    renderer.shadowMap.needsUpdate = true;
  }
  return {
    setLight(preset, sun) {
      ambient.color.set(preset.light.sky);
      ambient.groundColor.set(preset.light.ground);
      ambient.intensity = preset.light.ambient;
      skyDirection.color.set(preset.light.sunColor);
      skyDirection.intensity = preset.light.direct;
      if (preset.sky.clearing > 0) offset.copy(sun).multiplyScalar(48);
      else offset.set(12, 34, 30);
      positionLight();
    },
    track(viewZ) {
      const next = THREE.MathUtils.clamp(Math.round(viewZ / 12) * 12, limits.minZ + 12, -12);
      if (next === shadowCenter) return;
      shadowCenter = next;
      positionLight();
    },
  };
}

function captureStreetReflection(scene) {
  const generator = new THREE.PMREMGenerator(renderer);
  const reflection = generator.fromScene(scene, .035, .08, 940, {
    size: 128, position: new THREE.Vector3(carStart.x, 1.32, carStart.z),
  });
  generator.dispose();
  return reflection.texture;
}

function useStreetReflection(scene, materials, texture) {
  const previous = materials.streetReflection;
  if (previous) {
    scene.traverse((object) => {
      for (const surface of Array.isArray(object.material) ? object.material : [object.material]) {
        if (surface?.envMap === previous) surface.envMap = texture;
      }
    });
  }
  materials.streetReflection = texture;
  for (const surface of [materials.glass, materials.paleGlass]) {
    surface.envMap = texture;
    surface.envMapIntensity = .8;
    surface.needsUpdate = true;
  }
}

async function boot() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  camera = new THREE.PerspectiveCamera(51, 1, .06, 1260);
  const scene = new THREE.Scene();
  const sky = addSky(scene);
  const lighting = addLight(scene);
  const materials = await loadMaterials(renderer);
  const shore = addShore(scene, materials, sky);
  addStreet(scene, materials);
  const { x, z } = telescopeSite;
  const heading = Math.atan2(x - reefMark.x, z - reefMark.z);
  telescope = createTelescopeView(camera, addLookoutTelescope(scene, materials, walkHeight(x, z), heading));
  function applyLighting(preset) {
    sky.setLight(preset.sky);
    shore.setLight(preset.sea);
    lighting.setLight(preset, sky.sun);
    scene.environmentIntensity = preset.environment;
    renderer.toneMappingExposure = preset.exposure;
  }
  const reflections = {};
  for (const key of ['overcast', 'afternoon']) {
    applyLighting(lightPresets[key]);
    reflections[key] = captureStreetReflection(scene);
  }
  let lightingKey = 'afternoon';
  useStreetReflection(scene, materials, reflections[lightingKey]);
  function changeLighting(key) {
    if (key === lightingKey) return;
    applyLighting(lightPresets[key]);
    useStreetReflection(scene, materials, reflections[key]);
    lightingKey = key;
  }
  const carModels = addVehicles(scene, materials);
  people = await addPeople(scene, materials, sound.footstep);
  vehicle = createDriving(carModels, people.pedestrians);
  if (people.driver) vehicle.cabin.add(people.driver.root);
  renderer.shadowMap.needsUpdate = true;

  const fit = () => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.55));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
    const horizontalAngle = THREE.MathUtils.degToRad(62);
    const matchingFov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(horizontalAngle / 2) / camera.aspect));
    walkingFov = THREE.MathUtils.clamp(matchingFov, 51, 69);
    if (!telescope.active) camera.fov = walkingFov;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', fit);
  fit();
  connectControls(changeLighting);
  setView(startView);
  renderer.render(scene, camera);
  loading.hidden = true;
  hud.hidden = false;
  previousTime = performance.now();
  function frame(time) {
    const dt = Math.min(.065, Math.max(0, (time - previousTime) / 1000));
    previousTime = time;
    if (review) worldTime = Math.min(reviewDuration, Math.max(0, time - review.started)) / 1000;
    else worldTime += dt;
    people.update(worldTime);
    let input;
    if (boarding) {
      tickBoarding(dt);
    } else if (driving) {
      input = tickDriving(dt);
    } else if (bench) {
      tickBench(dt);
    } else if (!telescope.active) {
      const { x, z } = state;
      if (review) tickReview(time, dt);
      else if (!capturing) tickWalking(dt);
      updateMotion(x, z, dt);
      interaction.hidden = Boolean(review || capturing || inspecting || !vehicle.canEnter(state.x, state.z));
    }
    people.visitor?.update(dt, vehicle.pose);
    updateBenchAction();
    archiveAction.hidden = !canReadArchive();
    telescopeAction.hidden = !canUseTelescope();
    syncCamera(dt);
    lighting.track(camera.position.z);
    sound.update(camera, getEnginePoint(), vehicle, input, driving && !boarding);
    sky.update(worldTime);
    shore.update(worldTime, dt);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

hud.hidden = true;
boot().catch((error) => {
  console.error(error);
  loading.textContent = '街景暂时无法加载。' + error.message;
});

import { CatmullRomCurve3, MathUtils, Vector3 } from 'three';

const path = new CatmullRomCurve3([
  [5.13, -29.3], [5.13, -32.6], [5.45, -36.0], [6.45, -39.45], [8.02, -42.15],
  [10.22, -45.2], [12.37, -48.4], [14.25, -51.65], [15.9, -55.05],
  [17.75, -58.55], [18.9, -61.55], [19.55, -63.16], [20.07, -63.45], [22.32, -63.98],
].map(([x, z]) => new Vector3(x, 0, z)));
path.arcLengthDivisions = 400;

const distance = path.getLength();
const pace = 1.42;
const startEase = .84;
const stopEase = 1.16;
const walkTime = distance / pace + (startEase + stopEase) / 2;
const startTime = .65;
const arriveTime = startTime + walkTime;
const lookTime = arriveTime + .86;
const turnTime = lookTime + 6.4;
const returnTime = turnTime + 1.42;
const endTime = returnTime + walkTime;
const repeatTime = endTime + 8;
const seaYaw = Math.PI / 2 - .16;

function pathYaw(fraction, tangent) {
  path.getTangentAt(fraction, tangent);
  return Math.atan2(tangent.x, tangent.z);
}

export function createLookoutWalk() {
  const point = new Vector3();
  const tangent = new Vector3();
  const firstYaw = pathYaw(0, tangent);
  const lastYaw = pathYaw(1, tangent);
  function blendYaw(from, to, fraction) {
    const delta = MathUtils.euclideanModulo(to - from + Math.PI, Math.PI * 2) - Math.PI;
    return from + delta * fraction;
  }

  function walk(time, back) {
    const starting = MathUtils.clamp(time / startEase, 0, 1);
    const stopping = MathUtils.clamp((walkTime - time) / stopEase, 0, 1);
    // Integrate the linear acceleration and braking so the gait follows distance along the curve.
    const covered = time < startEase ? pace * time * starting / 2
      : time > walkTime - stopEase ? distance - pace * (walkTime - time) * stopping / 2
        : pace * (time - startEase / 2);
    const fraction = MathUtils.clamp((back ? distance - covered : covered) / distance, 0, 1);
    path.getPointAt(fraction, point);
    return { x: point.x, z: point.z, yaw: pathYaw(fraction, tangent) + (back ? Math.PI : 0),
      speed: pace * starting * stopping, phase: back ? '沿原路返回' : '走向观景台' };
  }

  function settle(fraction, yaw, phase, turn = 0, gaze = 0) {
    path.getPointAt(fraction, point);
    return { x: point.x, z: point.z, yaw, speed: 0, phase, turn, gaze };
  }

  return (elapsed) => {
    const time = elapsed % repeatTime;
    if (time < startTime) return settle(0, firstYaw, '走向观景台');
    if (time < arriveTime) return walk(time - startTime, false);
    if (time < lookTime) {
      const t = MathUtils.smoothstep(time, arriveTime, lookTime);
      return settle(1, blendYaw(lastYaw, seaYaw, t), '停下看海', Math.sin(Math.PI * t) * .40);
    }
    if (time < turnTime) {
      const progress = (time - lookTime) / (turnTime - lookTime);
      return settle(1, seaYaw, '停下看海', 0, Math.sin(Math.PI * progress) * (.56 + .44 * Math.sin(progress * Math.PI * 2)));
    }
    if (time < returnTime) {
      const t = MathUtils.smoothstep(time, turnTime, returnTime);
      return settle(1, blendYaw(seaYaw, lastYaw + Math.PI, t), '沿原路返回', Math.sin(Math.PI * t) * .67);
    }
    if (time < endTime) return walk(time - returnTime, true);
    const t = MathUtils.smoothstep(time, endTime + 2, endTime + 3.4);
    return settle(0, blendYaw(firstYaw + Math.PI, firstYaw, t), '已回到主街', Math.sin(Math.PI * t) * .54);
  };
}

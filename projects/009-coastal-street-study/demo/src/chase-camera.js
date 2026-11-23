import { MathUtils, Vector3 } from 'three';

const followDistance = 5.37;
const eyeHeight = 3.07;
const aimHeight = 1.27;
const clearance = .15;
const comfortMargin = .42;

function dampAngle(from, to, response, dt) {
  const turn = to - from;
  return from + Math.atan2(Math.sin(turn), Math.cos(turn)) * (1 - Math.exp(-response * dt));
}

export function createChaseCamera(isClear) {
  const anchor = new Vector3();
  const position = new Vector3();
  const target = new Vector3();
  let heading = 0;
  let turnTarget = 0;
  let distance = followDistance;
  let lookAhead = 1.25;

  function reset({ x, z, rotation }) {
    anchor.set(x, eyeHeight, z);
    heading = turnTarget = rotation;
    distance = followDistance;
    lookAhead = 1.25;
  }

  function clearArm(backX, backZ) {
    const limit = followDistance + comfortMargin;
    const step = limit / 20;
    for (let i = 1; i <= 20; i++) {
      let far = i * step;
      if (isClear(anchor.x + far * backX, eyeHeight, anchor.z + far * backZ)) continue;
      let near = far - step;
      for (let refine = 0; refine < 6; refine++) {
        const mid = (near + far) / 2;
        if (isClear(anchor.x + mid * backX, eyeHeight, anchor.z + mid * backZ)) near = mid;
        else far = mid;
      }
      return near;
    }
    return limit;
  }

  function update(pose, speed, dt) {
    const response = 12;
    anchor.x = MathUtils.damp(anchor.x, pose.x, response, dt);
    anchor.z = MathUtils.damp(anchor.z, pose.z, response, dt);
    turnTarget = dampAngle(turnTarget, pose.rotation, 10, dt);
    heading = dampAngle(heading, turnTarget, 8.2, dt);
    lookAhead = MathUtils.damp(lookAhead, 1.25 + Math.max(0, speed) * .10, 5, dt);

    const sin = Math.sin(heading);
    const cos = Math.cos(heading);
    const clear = clearArm(sin, cos);
    const limit = MathUtils.clamp(clear - clearance, .25, followDistance);
    const desired = MathUtils.clamp(clear - comfortMargin, .25, followDistance);
    distance = Math.min(limit, MathUtils.damp(distance, desired, desired > distance ? 4.2 : 14, dt));
    position.set(anchor.x + distance * sin, eyeHeight, anchor.z + distance * cos);
    target.set(anchor.x - lookAhead * sin, aimHeight, anchor.z - lookAhead * cos);
    return { position, target };
  }

  return { reset, update };
}

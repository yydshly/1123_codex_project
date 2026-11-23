import { MathUtils } from 'three';
import { boardingStand } from './boarding.js';
import { canWalk, carStart, drivingObstruction, walkHeight, walkPointIsClear } from './street.js';

const wheelbase = 2.70;
const rearAxle = 1.31;
const forwardLimit = 6.25;
const reverseLimit = 2.5;

const coasting = { throttle: 0, turn: 0, brake: false };

function spring(value, target, rate, damping, dt) {
  value.velocity += (rate ** 2 * (target - value.angle) - 2 * damping * rate * value.velocity) * dt;
  value.angle += value.velocity * dt;
}

export function createDriving({ root, cabin, animate, driverDoor }, pedestrians) {
  const pose = { ...carStart };
  const pitch = { angle: 0, velocity: 0 };
  const roll = { angle: 0, velocity: 0 };
  let speed = 0;
  let acceleration = 0;
  let steering = 0;
  let brakeDeceleration = 0;
  let obstruction;

  function render(distance, braking, resetWheels = false) {
    root.position.set(pose.x, .001, pose.z);
    root.rotation.y = pose.rotation;
    animate({ distance, steering, curvature: Math.tan(steering) / wheelbase,
      pitch: pitch.angle, roll: roll.angle, braking, resetWheels });
  }

  function reset() {
    Object.assign(pose, carStart);
    speed = 0;
    acceleration = 0;
    brakeDeceleration = 0;
    obstruction = undefined;
    steering = 0;
    pitch.angle = pitch.velocity = 0;
    roll.angle = roll.velocity = 0;
    driverDoor.setAngle(0);
    render(0, false, true);
  }

  function integrateSpeed(throttle, brake, dt) {
    const magnitude = Math.abs(speed);
    const direction = Math.sign(speed);
    const opposing = throttle * speed < 0;
    const limit = throttle < 0 ? reverseLimit : forwardLimit;
    let demand;
    let response;
    if (brake || opposing) {
      const effort = brake ? 7.2 : 5.0;
      demand = -direction * Math.min(effort, 1.1 + magnitude * 7);
      response = brake ? 15 : 11;
    } else if (throttle) {
      const power = 1 - .82 * MathUtils.smoothstep(magnitude, limit * .47, limit);
      demand = throttle * (throttle > 0 ? 3.65 : 2.65) * power;
      response = 6.8;
    } else {
      demand = -direction * (1.04 + .096 * magnitude + .014 * magnitude ** 2);
      response = 5.6;
    }
    acceleration = MathUtils.damp(acceleration, demand, response, dt);
    const next = MathUtils.clamp(speed + acceleration * dt, -reverseLimit, forwardLimit);
    if ((brake || opposing || !throttle) && next * direction < .018) {
      acceleration = 0;
      return 0;
    }
    return next;
  }

  function move(distance, curvature) {
    if (!distance) return;
    const change = distance * curvature;
    const rotation = pose.rotation + change;
    const midpoint = pose.rotation + change / 2;
    const x = pose.x + rearAxle * (Math.sin(pose.rotation) - Math.sin(rotation)) - distance * Math.sin(midpoint);
    const z = pose.z + rearAxle * (Math.cos(pose.rotation) - Math.cos(rotation)) - distance * Math.cos(midpoint);
    const contact = drivingObstruction({ x, z, rotation, scale: pose.scale }, pedestrians);
    if (contact) return contact;
    Object.assign(pose, { x, z, rotation });
  }

  function update({ throttle, turn, brake }, dt) {
    if (!dt) return false;
    const steps = Math.ceil(dt / (1 / 120));
    const step = dt / steps;
    const braking = brake || throttle * speed < 0;
    let travelled = 0;
    obstruction = undefined;
    for (let i = 0; i < steps; i++) {
      const before = speed;
      const limit = MathUtils.lerp(.59, .32, MathUtils.smoothstep(Math.abs(speed), .75, forwardLimit));
      steering = MathUtils.damp(steering, turn * limit, turn ? 7.0 : 5.7, step);
      const curvature = Math.tan(steering) / wheelbase;
      speed = integrateSpeed(throttle, brake, step);
      const distance = (before + speed) * .5 * step;
      let longitudinal = (speed - before) / step;
      const contact = move(distance, curvature);
      if (!contact) {
        travelled += distance;
      } else {
        obstruction = contact;
        longitudinal = Math.abs(before) > .18 ? -Math.sign(before) * 8 : 0;
        speed = acceleration = 0;
      }
      const lateral = speed ** 2 * curvature;
      spring(pitch, MathUtils.clamp(longitudinal * .0068, -.047, .029), 13, .84, step);
      spring(roll, MathUtils.clamp(-lateral * .0105, -.042, .042), 11, .91, step);
      if (contact?.kind === 'pedestrian') break;
    }
    brakeDeceleration = braking && !obstruction ? Math.max(0, -Math.sign(speed) * acceleration) : 0;
    render(travelled, braking || Boolean(obstruction));
    return Boolean(obstruction);
  }

  function localPoint(x, z) {
    const sin = Math.sin(pose.rotation);
    const cos = Math.cos(pose.rotation);
    return { x: pose.x + x * cos + z * sin, z: pose.z - x * sin + z * cos };
  }

  function toLocal(x, z) {
    const dx = x - pose.x;
    const dz = z - pose.z;
    const sin = Math.sin(pose.rotation);
    const cos = Math.cos(pose.rotation);
    return { x: dx * cos - dz * sin, z: dx * sin + dz * cos };
  }

  function canEnter(x, z) {
    const local = toLocal(x, z);
    return local.x >= 1.13 && local.x <= 2.18 && local.z >= -1.53 && local.z <= 1.02;
  }

  function doorAccess(blockedByPerson) {
    const stand = boardingStand;
    const point = localPoint(stand.x, stand.z);
    if (!canWalk(point.x, point.z, pose) || blockedByPerson(point.x, point.z)) return undefined;
    let angle = 0;
    for (const candidate of [.24, .43, .63, .81, .94, 1.05]) {
      const clear = [.44, .73, 1].every((span) => {
        const edge = driverDoor.outerEdge(candidate, span);
        const point = localPoint(edge.x, edge.z);
        return walkPointIsClear(point.x, point.z) && !blockedByPerson(point.x, point.z);
      });
      if (!clear) break;
      angle = candidate;
    }
    if (angle < .81) return undefined;
    return { angle, stand: { ...stand, y: walkHeight(point.x, point.z) - root.position.y }, point };
  }

  reset();
  return {
    root, cabin, pose, driverDoor, update, reset, canEnter, doorAccess, localPoint,
    get speed() { return speed; },
    get brakeDeceleration() { return brakeDeceleration; },
    get obstruction() { return obstruction; },
    park() {
      speed = acceleration = brakeDeceleration = 0;
      obstruction = undefined;
      render(0, false);
    },
    settle(dt) { update(coasting, dt); },
  };
}

import * as THREE from 'three';
import { groundPlane } from './geometry.js';
import { walkHeight } from './street.js';

const { clamp, lerp, smoothstep } = THREE.MathUtils;
export const boardingDuration = 3.38;
export const exitDuration = 4.28;
export const exitDoorLatched = 3.84;
export const boardingStand = { x: 1.43, z: .18 };
const entryDoorStart = .26;
const entryDoorLatched = 3.24;
const exitDoorStart = .24;
const entryFootPlant = [1.51, 1.19];
const cabinFootPlant = [2.63, 2.81];
const exitFootPlant = [1.78, 1.42];
const turnFootPlant = [3.22, 3.38];

export const entrySoundCues = [
  { time: entryDoorStart, door: 'door-open' },
  { time: entryFootPlant[1], foot: 1, weight: .87 },
  { time: entryFootPlant[0], foot: 0, weight: .93 },
  { time: cabinFootPlant[0], foot: 0, weight: .32, inside: true },
  { time: cabinFootPlant[1], foot: 1, weight: .36, inside: true },
  { time: entryDoorLatched, door: 'door-close' },
];
export const exitSoundCues = [
  { time: exitDoorStart, door: 'door-open' },
  { time: exitFootPlant[1], foot: 1, weight: 1 },
  { time: exitFootPlant[0], foot: 0, weight: .90 },
  { time: turnFootPlant[0], foot: 0, weight: .71 },
  { time: turnFootPlant[1], foot: 1, weight: .76 },
  { time: exitDoorLatched, door: 'door-close' },
];

// Coordinates are in vehicle space. +X is the driver's doorway and -Z is forward.
// Hip keyframes contain time, x, y, z, heading, forward lean and outward lean.
const seatedHip = [.365, .510, -.247, -Math.PI, -.55, 0];
const body = [
  [0, boardingStand.x, .868, boardingStand.z, -Math.PI / 2, 0, 0],
  [.30, 1.43, .857, .16, -1.59, .09, 0],
  [.76, 1.47, .853, .13, -1.67, .09, 0],
  [1.09, 1.32, .834, -.035, -2.49, .13, .04],
  [1.36, 1.10, .745, -.155, -3.39, .21, .04],
  [1.56, .83, .625, -.227, -3.89, .32, .05],
  [1.80, .567, .510, -.259, -4.05, .32, .17],
  [1.97, .531, .510, -.259, -4.05, .29, .25],
  [2.20, .491, .510, -.253, -3.78, .09, .50],
  [2.43, .442, .510, -.249, -3.44, -.21, .55],
  [2.58, .405, .510, -.247, -3.32, -.42, .41],
  [2.76, .371, .510, -.247, -3.18, -.56, .17],
  [3.02, .365, .510, -.247, -Math.PI, -.55, .065],
  [boardingDuration, ...seatedHip],
];
// Ankle keyframes keep each foot planted before the pelvis settles on the seat.
const seatedFeet = [[.275, .402, -.897, -Math.PI], [.456, .402, -.897, -Math.PI]];
const leftFoot = [
  [0, 1.448, .101, .275, -1.57], [.98, 1.448, .101, .275, -1.87],
  [1.26, 1.257, .186, -.021, -3.02], [entryFootPlant[0], 1.008, .115, -.208, -3.90],
  [1.91, 1.008, .115, -.208, -4.04], [2.08, .971, .404, -.263, -3.90],
  [2.24, .822, .565, -.449, -3.64], [2.45, .487, .516, -.718, -3.34],
  [cabinFootPlant[0], ...seatedFeet[0]], [boardingDuration, ...seatedFeet[0]],
];
const rightFoot = [
  [0, 1.392, .101, .041, -1.57], [.73, 1.392, .101, .041, -1.70],
  [.95, 1.235, .199, -.174, -2.65], [entryFootPlant[1], 1.145, .115, -.372, -3.53],
  [1.50, 1.145, .115, -.372, -3.99], [2.25, 1.145, .115, -.372, -3.87],
  [2.40, 1.074, .397, -.453, -3.74], [2.57, .849, .561, -.579, -3.42],
  [cabinFootPlant[1], ...seatedFeet[1]], [boardingDuration, ...seatedFeet[1]],
];

const exitBody = [
  [0, ...seatedHip], [.24, ...seatedHip],
  [.57, .431, .510, -.250, -3.29, -.49, .24],
  [.88, .510, .510, -.262, -3.62, -.29, .52],
  [1.16, .551, .510, -.263, -3.93, .14, .43],
  [1.56, .562, .510, -.259, -4.07, .28, .31],
  [1.91, .575, .510, -.251, -4.10, .38, .28],
  [2.07, .725, .554, -.246, -4.13, .48, .20],
  [2.26, .982, .695, -.238, -4.15, .32, .11],
  [2.49, 1.191, .851, -.234, -4.13, .07, .02],
  [2.66, 1.199, .851, -.232, -4.13, .035, 0],
  [2.90, 1.241, .825, -.186, -3.45, .075, 0],
  [3.12, 1.345, .826, -.097, -2.59, .09, 0],
  [3.36, 1.422, .853, .069, -1.80, .10, 0],
  [3.58, 1.43, .859, .175, -1.57, .055, 0],
  [exitDuration, boardingStand.x, .868, boardingStand.z, -Math.PI / 2, 0, 0],
];
const exitLeftFoot = [
  [0, ...seatedFeet[0]], [1.00, ...seatedFeet[0]],
  [1.21, .528, .523, -.683, -3.34], [1.46, .841, .559, -.435, -3.80],
  [1.62, 1.004, .331, -.246, -4.02], [exitFootPlant[0], 1.008, .115, -.208, -4.08],
  [2.67, 1.008, .115, -.208, -4.08], [2.89, 1.158, .197, -.030, -3.39],
  [3.08, 1.357, .170, .186, -2.29], [turnFootPlant[0], 1.448, .101, .275, -Math.PI / 2],
  [exitDuration, 1.448, .101, .275, -Math.PI / 2],
];
const exitRightFoot = [
  [0, ...seatedFeet[1]], [.64, ...seatedFeet[1]],
  [.89, .688, .537, -.684, -3.42], [1.07, .904, .547, -.492, -3.79],
  [1.22, 1.092, .319, -.403, -4.00], [exitFootPlant[1], 1.145, .115, -.372, -4.08],
  [2.71, 1.145, .115, -.372, -4.08], [2.98, 1.145, .115, -.372, -3.14],
  [3.15, 1.218, .187, -.207, -2.48], [turnFootPlant[1], 1.392, .101, .041, -Math.PI / 2],
  [exitDuration, 1.392, .101, .041, -Math.PI / 2],
];

// The head picks up the next contact point just before the body moves.
const entryGaze = [
  [0, 0, 0], [.28, -.13, .21], [.72, -.14, .13], [1.15, -.18, .14],
  [1.63, .20, .24], [2.18, .29, .29], [2.62, .17, .18], [boardingDuration, 0, 0],
];
const exitGaze = [
  [0, 0, 0], [.46, -.27, .14], [1.03, -.28, .32], [1.82, -.11, .35],
  [2.18, -.10, .17], [2.53, -.21, .02], [2.69, .18, .05],
  [2.94, .37, .12], [3.33, .17, .16], [3.75, -.025, .14], [exitDuration, 0, 0],
];

function joinedVelocity(before, after) {
  return before * after > 0 ? 2 * before * after / (before + after) : 0;
}

function keyframe(frames, time) {
  const next = frames.findIndex(([at]) => at > time);
  if (next < 1) return frames[next === 0 ? 0 : frames.length - 1].slice(1);
  const [start, ...from] = frames[next - 1];
  const [end, ...to] = frames[next];
  const previous = frames[next - 2];
  const following = frames[next + 1];
  const span = end - start;
  const u = (time - start) / span;
  const blend = u * u * (3 - 2 * u);
  return from.map((value, index) => {
    const offset = index + 1;
    const rate = (to[index] - value) / span;
    const fromRate = previous ? joinedVelocity((value - previous[offset]) / (start - previous[0]), rate) : 0;
    const toRate = following ? joinedVelocity(rate, (following[offset] - to[index]) / (following[0] - end)) : 0;
    return lerp(value, to[index], blend) + span * u * (1 - u) * ((1 - u) * fromRate - u * toRate);
  });
}

export function aimBone(bone, child, direction) {
  const inverseParent = bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  const target = direction.clone().applyQuaternion(inverseParent).normalize();
  const current = child.position.clone().normalize().applyQuaternion(bone.quaternion);
  bone.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(current, target));
}

function rotateBone(bone, axis, radians) {
  if (!radians) return;
  const parent = bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis.clone().applyQuaternion(parent), radians));
}

export function reach(upper, lower, end, target, pole) {
  const origin = upper.getWorldPosition(new THREE.Vector3());
  const elbow = lower.getWorldPosition(new THREE.Vector3());
  const lengthA = origin.distanceTo(elbow);
  const lengthB = elbow.distanceTo(end.getWorldPosition(new THREE.Vector3()));
  const axis = target.clone().sub(origin);
  const distance = clamp(axis.length(), Math.abs(lengthA - lengthB) + .001, lengthA + lengthB - .001);
  axis.normalize();
  const along = (lengthA ** 2 - lengthB ** 2 + distance ** 2) / (2 * distance);
  const bend = pole.clone().addScaledVector(axis, -pole.dot(axis)).normalize();
  const first = axis.clone().multiplyScalar(along)
    .addScaledVector(bend, Math.sqrt(Math.max(0, lengthA ** 2 - along ** 2)));
  aimBone(upper, lower, first);
  aimBone(lower, end, axis.multiplyScalar(distance).sub(first));
}

function blendChain(chain, weight, apply) {
  if (!weight) return;
  const from = chain.map((bone) => bone.quaternion.clone());
  apply();
  chain.forEach((bone, index) => bone.quaternion.slerp(from[index], 1 - weight));
}

export function doorOpening(time, entering = true) {
  if (!entering) {
    const push = .66 * smoothstep(time, exitDoorStart, .90) + .20 * smoothstep(time, 1.98, 2.46);
    return push * (1 - smoothstep(time, 3.28, exitDoorLatched));
  }
  const swing = smoothstep(time, entryDoorStart, .86);
  const withinReach = 1 - .27 * smoothstep(time, 1.57, 1.90);
  return swing * withinReach * (1 - smoothstep(time, 2.64, entryDoorLatched));
}

export function createBoardingActor(model, idleClip, contact) {
  const root = new THREE.Group();
  root.add(model);
  const shadow = groundPlane(root, contact.clone(), 0, .012, 0, .64, .68);
  shadow.renderOrder = 2;
  const bones = new Map();
  model.traverse((bone) => {
    if (bone.isBone) bones.set(bone.name.replaceAll('_', ' '), bone);
  });
  const skeleton = [...bones.values()];
  const mixer = new THREE.AnimationMixer(model);
  mixer.clipAction(idleClip).play();
  mixer.update(.23);
  const standing = skeleton.map((bone) => [bone.position.clone(), bone.quaternion.clone()]);
  const pelvis = bones.get('Bip01 Pelvis');
  const standHipHeight = pelvis.getWorldPosition(new THREE.Vector3()).y;
  mixer.stopAllAction();
  const spine = bones.get('Bip01 Spine');
  const chest = bones.get('Bip01 Spine1');
  const neck = bones.get('Bip01 Neck');
  const head = bones.get('Bip01 Head');
  const limbs = ['L', 'R'].map((side) => {
    const bone = (name) => bones.get('Bip01 ' + side + ' ' + name);
    return {
      leg: ['Thigh', 'Calf', 'Foot', 'Toe0'].map(bone),
      arm: ['UpperArm', 'Forearm', 'Hand', 'Finger2'].map(bone),
      fingers: ['0', '1', '2', '3', '4'].map((digit) => ['', '1', '2']
        .map((joint) => bone('Finger' + digit + joint))),
      shoeShadow: groundPlane(root, contact.clone(), 0, 0, 0, .29, .22),
    };
  });
  for (const { shoeShadow } of limbs) shoeShadow.renderOrder = 3;

  root.visible = false;

  function sample(time, vehicle, ground, entering = true) {
    const [x, hipY, z, yaw, lean, outward] = keyframe(entering ? body : exitBody, time);
    const standAmount = entering ? 1 - smoothstep(time, 1.32, 1.8) : smoothstep(time, 1.94, 2.49);
    root.position.set(x, hipY - standHipHeight + ground * standAmount, z);
    root.rotation.y = yaw;
    shadow.position.y = ground + .012 - root.position.y;
    shadow.material.opacity = contact.opacity * standAmount;
    shadow.visible = standAmount > 0;
    skeleton.forEach((bone, index) => {
      bone.position.copy(standing[index][0]);
      bone.quaternion.copy(standing[index][1]);
    });
    const cabinRotation = vehicle.cabin.getWorldQuaternion(new THREE.Quaternion());
    const direction = (dx, dy, dz) => new THREE.Vector3(dx, dy, dz).applyQuaternion(cabinRotation);
    const worldPoint = (dx, dy, dz) => vehicle.cabin.localToWorld(new THREE.Vector3(dx, dy, dz));
    if (lean || outward) aimBone(spine, chest, direction(Math.sin(yaw) * lean + outward, 1, Math.cos(yaw) * lean));

    const [turnHead, lookDown] = keyframe(entering ? entryGaze : exitGaze, time);
    const up = direction(0, 1, 0);
    const lookYaw = yaw + turnHead;
    const tiltAxis = direction(Math.cos(lookYaw), 0, -Math.sin(lookYaw));
    rotateBone(neck, up, turnHead * .32);
    rotateBone(neck, tiltAxis, lookDown * .23);
    rotateBone(head, up, turnHead * .68);
    rotateBone(head, tiltAxis, lookDown * .77);

    const trackFoot = entering ? smoothstep(time, .06, .26) : 1 - smoothstep(time, 3.91, exitDuration);
    for (const [index, { leg, shoeShadow }] of limbs.entries()) {
      const [thigh, calf, foot, toe] = leg;
      const track = entering ? [leftFoot, rightFoot][index] : [exitLeftFoot, exitRightFoot][index];
      const [fx, fy, fz, shoeYaw] = keyframe(track, time);
      const contactTime = entering ? (index ? 2.25 : 1.91) : exitFootPlant[index];
      const onRoad = entering ? 1 - smoothstep(time, contactTime, contactTime + .20) : smoothstep(time, contactTime - .24, contactTime);
      const pivotGrip = !entering && index === 1 && time >= 2.71 ? 1 - smoothstep(time, 3.02, 3.18) : 0;
      const heel = smoothstep(time, 2.71, 2.98) * pivotGrip;
      const heelLift = .028 * heel;
      const toeReach = lerp(.112, .093, heel);
      const outX = pivotGrip * (.112 * Math.sin(-4.08) - toeReach * Math.sin(shoeYaw));
      const outZ = pivotGrip * (.112 * Math.cos(-4.08) - toeReach * Math.cos(shoeYaw));
      const target = worldPoint(fx + outX, fy + heelLift, fz + outZ);
      target.y += (walkHeight(target.x, target.z) - vehicle.root.position.y) * onRoad;
      const supported = entering
        ? smoothstep(time, 1.32, 1.70) * (1 - smoothstep(time, contactTime, contactTime + .24))
        : onRoad * (1 - smoothstep(time, 2.19, 2.47));
      const knee = direction(lerp(Math.sin(yaw), .85, supported), lerp(.05, .90, supported),
        lerp(Math.cos(yaw), -.10, supported));
      blendChain([thigh, calf, foot], trackFoot, () => {
        reach(thigh, calf, foot, target, knee);
        const alongSole = lerp(.82, .67, heel);
        aimBone(foot, toe, direction(Math.sin(shoeYaw) * alongSole, lerp(-.59, -.74, heel), Math.cos(shoeYaw) * alongSole));
      });

      const underShoe = foot.getWorldPosition(new THREE.Vector3());
      underShoe.addScaledVector(direction(Math.sin(shoeYaw), 0, Math.cos(shoeYaw)), .055 + heel * .041);
      const surface = walkHeight(underShoe.x, underShoe.z);
      const pressure = onRoad * (1 - smoothstep(underShoe.y - surface - heelLift, .105, .215));
      shoeShadow.visible = pressure > .03;
      if (shoeShadow.visible) {
        underShoe.y = surface + .015;
        shoeShadow.position.copy(root.worldToLocal(underShoe));
        shoeShadow.rotation.set(-Math.PI / 2, 0, shoeYaw - yaw);
        shoeShadow.material.opacity = contact.opacity * pressure * .55;
      }
    }

    function hold(index, grip, wrist, weight, grasp = .62) {
      const { arm: [upper, lower, hand, finger], fingers } = limbs[index];
      blendChain([upper, lower, hand], weight, () => {
        reach(upper, lower, hand, wrist, direction(index ? .58 : -.58, -1, .10));
        aimBone(hand, finger, grip.clone().sub(hand.getWorldPosition(new THREE.Vector3())));
      });
      const gripPressure = grasp * smoothstep(weight, .20, .90);
      fingers.forEach((digit, number) => {
        const flex = number === 0 ? [.20, .15, .11] : [.30, .55, .25];
        digit.forEach((joint, index) => joint?.rotateZ(flex[index] * gripPressure));
      });
    }

    if (!entering) {
      const { innerGrip, frameGrip } = vehicle.driverDoor;
      const leftToPillar = smoothstep(time, .57, 1.13);
      hold(0, worldPoint(.239, 1.01, -.657).lerp(worldPoint(.84, .947, .070), leftToPillar),
        worldPoint(.248, 1.016, -.576).lerp(worldPoint(.913, .965, .13), leftToPillar),
        1 - smoothstep(time, 1.98, 2.46), lerp(.62, .24, leftToPillar));
      const rightToDoor = smoothstep(time, 0, .25);
      const braceHigher = smoothstep(time, 2.05, 2.48);
      const aroundFrame = smoothstep(time, 2.64, 3.06);
      const grip = innerGrip.getWorldPosition(new THREE.Vector3()).lerp(frameGrip.getWorldPosition(new THREE.Vector3()), braceHigher);
      const wrist = innerGrip.localToWorld(new THREE.Vector3(-.074, .017, .028))
        .lerp(frameGrip.localToWorld(new THREE.Vector3(lerp(-.058, .057, aroundFrame), .024,
          .051 + Math.sin(aroundFrame * Math.PI) * .058)), braceHigher);
      hold(1, worldPoint(.49, 1.01, -.657).lerp(grip, rightToDoor),
        worldPoint(.478, 1.016, -.576).lerp(wrist, rightToDoor),
        1 - smoothstep(time, exitDoorLatched, exitDuration - .10), lerp(.62, .92, rightToDoor));
      return;
    }

    const leftToWheel = smoothstep(time, 1.91, 2.42);
    hold(0, worldPoint(.84, .947, .070).lerp(worldPoint(.239, 1.01, -.657), leftToWheel),
      worldPoint(.913, .965, .13).lerp(worldPoint(.248, 1.016, -.576), leftToWheel),
      smoothstep(time, 1.16, 1.56), lerp(.24, .62, leftToWheel));

    const outside = smoothstep(time, .06, .30) * (1 - smoothstep(time, .64, 1.01));
    if (outside) {
      const grip = vehicle.driverDoor.outerGrip;
      hold(1, grip.getWorldPosition(new THREE.Vector3()), grip.localToWorld(new THREE.Vector3(.079, .012, .012)), outside, .92);
    }
    const inside = smoothstep(time, 1.43, 1.76);
    if (inside) {
      const grip = vehicle.driverDoor.innerGrip;
      const rightToWheel = smoothstep(time, 3.12, boardingDuration);
      hold(1, grip.getWorldPosition(new THREE.Vector3()).lerp(worldPoint(.49, 1.01, -.657), rightToWheel),
        grip.localToWorld(new THREE.Vector3(-.074, .017, .028)).lerp(worldPoint(.478, 1.016, -.576), rightToWheel),
        inside, lerp(.92, .62, rightToWheel));
    }
  }

  return {
    root, sample,
    footPosition(side, target) {
      return limbs[side].leg[2].getWorldPosition(target);
    },
  };
}

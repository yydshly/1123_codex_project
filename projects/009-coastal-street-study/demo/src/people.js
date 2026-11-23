import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { aimBone, createBoardingActor, reach } from './boarding.js';
import { lookoutSeat } from './coast-loop.js';
import { groundPlane, group } from './geometry.js';
import { createLookoutWalk } from './lookout-walk.js';
import { shadowTexture } from './materials.js';
import { addPerson } from './props.js';
import { canWalk, carTouchesPedestrian, walkHeight, walkSurfaceHeight } from './street.js';

const walkSpeed = 1.19;
const sourceWalkSpeed = 1.3106;
const turnRadius = .29;
const nearEnd = -5.2;
const farEnd = -24.4;
const walkwayCenter = 6.80;
const straightDistance = nearEnd - farEnd;
const bendDistance = turnRadius * Math.PI;
const lap = 2 * straightDistance + 2 * bendDistance;
const playerJacket = { gain: [.87, 1.04, 1.14], base: [0, 5, 9] };
const visitorJacket = { gain: [1.22, 1.32, 1.08], base: [32, 35, 21] };

function walkerPose(distance) {
  const position = THREE.MathUtils.euclideanModulo(distance, lap);
  if (position < straightDistance) {
    return [walkwayCenter - turnRadius, farEnd + position, 0];
  }
  if (position < straightDistance + bendDistance) {
    const turn = (position - straightDistance) / turnRadius;
    return [walkwayCenter - Math.cos(turn) * turnRadius, nearEnd + Math.sin(turn) * turnRadius, turn];
  }
  if (position < straightDistance * 2 + bendDistance) {
    return [walkwayCenter + turnRadius, nearEnd - (position - straightDistance - bendDistance), Math.PI];
  }
  const turn = (position - straightDistance * 2 - bendDistance) / turnRadius;
  return [walkwayCenter + Math.cos(turn) * turnRadius, farEnd - Math.sin(turn) * turnRadius, Math.PI + turn];
}

function recolorJacket(map, { gain, base }) {
  const image = map.image;
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const colors = pixels.data;
  for (let i = 0; i < colors.length; i += 4) {
    const red = colors[i];
    const green = colors[i + 1];
    const blue = colors[i + 2];
    const jacket = THREE.MathUtils.smoothstep((red - Math.max(green, blue)) / Math.max(red, 1), .20, .42);
    if (!jacket) continue;
    const value = red * .20 + green * .62 + blue * .18;
    colors[i] = THREE.MathUtils.lerp(red, value * gain[0] + base[0], jacket);
    colors[i + 1] = THREE.MathUtils.lerp(green, value * gain[1] + base[1], jacket);
    colors[i + 2] = THREE.MathUtils.lerp(blue, value * gain[2] + base[2], jacket);
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas, map.mapping, map.wrapS, map.wrapT, map.magFilter, map.minFilter);
  texture.flipY = map.flipY;
  texture.colorSpace = map.colorSpace;
  return texture;
}

function personModel(scene, gltf, contact, initialAction, tint, jacket) {
  const person = group(scene, 0, 0, 0);
  const model = clone(gltf.scene);
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.receiveShadow = true;
    if (object.isSkinnedMesh) object.frustumCulled = false;
    const prepare = (material) => {
      const copy = material.clone();
      if (copy.name === 'm024_body') {
        if (tint) copy.color.set(tint);
        if (jacket && copy.map) copy.map = recolorJacket(copy.map, jacket);
      }
      if (copy.map) copy.map.anisotropy = 4;
      if (copy.normalMap) copy.normalMap.anisotropy = 4;
      return copy;
    };
    object.material = Array.isArray(object.material) ? object.material.map(prepare) : prepare(object.material);
  });
  person.add(model);
  groundPlane(person, contact, 0, .012, 0, .64, .68).renderOrder = 2;
  const mixer = new THREE.AnimationMixer(model);
  const actions = Object.fromEntries(gltf.animations.map((clip) => [clip.name, mixer.clipAction(clip)]));
  actions[initialAction].play();
  return { person, model, mixer, actions };
}

function soleContact({ person, model }) {
  const samples = new Map();
  const point = new THREE.Vector3();
  person.updateMatrixWorld(true);
  model.traverse((mesh) => {
    if (!mesh.isSkinnedMesh) return;
    const size = mesh.geometry.attributes.position.count;
    for (let index = 0; index < size; index++) {
      mesh.getVertexPosition(index, point).applyMatrix4(mesh.matrixWorld);
      if (point.y > .042) continue;
      const cell = Math.floor(point.x / .045) + ':' + Math.floor(point.z / .045);
      if (!samples.has(cell) || point.y < samples.get(cell).height) {
        samples.set(cell, { mesh, index, height: point.y });
      }
    }
  });
  let lift = 0;
  return ({ visible, dt }) => {
    model.position.y = 0;
    if (!visible) {
      lift = 0;
      return;
    }
    person.updateMatrixWorld(true);
    let required = 0;
    for (const { mesh, index } of samples.values()) {
      mesh.getVertexPosition(index, point).applyMatrix4(mesh.matrixWorld);
      const surface = walkSurfaceHeight(point.x, point.z);
      if (surface !== undefined) required = Math.max(required, surface - point.y);
    }
    lift = dt ? Math.max(required, THREE.MathUtils.damp(lift, required, 22, dt)) : required;
    model.position.y = lift;
  };
}

function lookoutVisitor(scene, gltf, contact) {
  const visitor = personModel(scene, gltf, contact, 'Idle', undefined, visitorJacket);
  const { person, model, mixer, actions } = visitor;
  const walk = actions.Walk.setEffectiveWeight(0).play();
  const groundSoles = soleContact(visitor);
  const sample = createLookoutWalk();
  const head = model.getObjectByName('Bip01_Head');
  const headRotation = head?.quaternion.clone();
  const viewpoint = new THREE.Quaternion();
  const axis = new THREE.Vector3();
  let time = 0;
  let weight = 0;
  let pose = sample(time);

  function update(dt, car) {
    const next = sample(time + dt);
    const ahead = next.speed > 0 && car ? sample(time + dt + .48) : next;
    const waiting = next.speed > 0 && (!canWalk(next.x, next.z) || !canWalk(ahead.x, ahead.z)
      || (car && (carTouchesPedestrian(car, next) || carTouchesPedestrian(car, ahead))));
    if (!waiting) {
      time += dt;
      pose = next;
    }
    const speed = waiting ? 0 : pose.speed;
    const targetWeight = Math.max(THREE.MathUtils.smoothstep(speed, .02, .58), pose.turn ?? 0);
    weight = THREE.MathUtils.damp(weight, targetWeight, 14, dt);
    walk.setEffectiveWeight(weight).setEffectiveTimeScale(Math.max(.46, speed / sourceWalkSpeed));
    actions.Idle.setEffectiveWeight(1 - weight);

    person.position.set(pose.x, walkHeight(pose.x, pose.z), pose.z);
    person.rotation.y = pose.yaw;
    if (head) head.quaternion.copy(headRotation);
    mixer.update(dt);
    if (head) {
      headRotation.copy(head.quaternion);
      if (pose.gaze) {
        head.getWorldQuaternion(viewpoint).invert();
        head.rotateOnAxis(axis.set(0, 1, 0).applyQuaternion(viewpoint), .17 * pose.gaze);
        head.rotateOnAxis(axis.set(Math.cos(pose.yaw), 0, -Math.sin(pose.yaw)).applyQuaternion(viewpoint), .07 * pose.gaze);
      }
    }
    groundSoles({ visible: true, dt });
  }

  update(0);
  return {
    update,
    position: person.position,
    get phase() { return pose.phase; },
    restart() {
      time = 0;
      weight = 0;
      update(0);
    },
  };
}

function benchPose(model) {
  const bone = (name) => model.getObjectByName('Bip01_' + name);
  const pelvis = bone('Pelvis');
  const spine = bone('Spine');
  const chest = bone('Spine1');
  const limbs = ['L', 'R'].map((side) => ({
    leg: ['Thigh', 'Calf', 'Foot'].map((joint) => bone(side + '_' + joint)),
    arm: ['UpperArm', 'Forearm', 'Hand'].map((joint) => bone(side + '_' + joint)),
  }));
  const joints = [pelvis, spine, ...limbs.flatMap(({ leg, arm }) => [...leg, ...arm])];
  if (!chest || joints.some((joint) => !joint)) return;
  const saved = joints.map((joint) => ({ joint, position: new THREE.Vector3(), rotation: new THREE.Quaternion() }));
  let applied = false;
  return {
    restore() {
      if (!applied) return;
      for (const { joint, position, rotation } of saved) {
        joint.position.copy(position);
        joint.quaternion.copy(rotation);
      }
      applied = false;
    },
    apply({ ground, seatBlend: blend }) {
      applied = true;
      for (const { joint, position, rotation } of saved) {
        position.copy(joint.position);
        rotation.copy(joint.quaternion);
      }
      const standing = limbs.map(({ leg, arm }) => ({
        foot: leg[2].getWorldPosition(new THREE.Vector3()),
        shoe: leg[2].getWorldQuaternion(new THREE.Quaternion()),
        hand: arm[2].getWorldPosition(new THREE.Vector3()),
      }));
      const seatY = ground + lookoutSeat.height;
      const hip = pelvis.getWorldPosition(new THREE.Vector3());
      hip.y = THREE.MathUtils.lerp(hip.y, seatY + .105, blend);
      pelvis.position.copy(pelvis.parent.worldToLocal(hip));
      aimBone(spine, chest, new THREE.Vector3(.10 * blend, 1, 0));
      for (const [index, { leg, arm }] of limbs.entries()) {
        const side = index === 0 ? 1 : -1;
        const footTarget = standing[index].foot.lerp(new THREE.Vector3(
          lookoutSeat.x + .46, ground + .105, lookoutSeat.z + side * .13), blend);
        reach(...leg, footTarget, new THREE.Vector3(1, .08, 0));
        const ankle = leg[2];
        const parent = ankle.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
        ankle.quaternion.copy(parent.multiply(standing[index].shoe));
        const handTarget = standing[index].hand.lerp(new THREE.Vector3(
          lookoutSeat.x + .32, seatY + .16, lookoutSeat.z + side * .15), blend);
        reach(...arm, handTarget, new THREE.Vector3(-.20, -.8, side * .68));
      }
    },
  };
}

export async function addPeople(scene, materials, onFootstep) {
  const contact = new THREE.MeshBasicMaterial({
    map: shadowTexture(), transparent: true, depthWrite: false, opacity: .41,
  });
  let gltf;
  try {
    gltf = await new GLTFLoader().loadAsync(import.meta.env.BASE_URL + 'people/promenade-walker.glb');
    if (!['Idle', 'Walk'].every((name) => gltf.animations.some((animation) => animation.name === name))) {
      throw new Error('未找到街道行人动作');
    }
  } catch (error) {
    console.warn('街道行人模型未加载，使用比例人物', error);
    const passerby = addPerson(scene, materials, contact, 6.38, .24, -21.05, .37, '#77645a');
    const player = addPerson(scene, materials, contact, 0, 0, 0, Math.PI, '#435761');
    return {
      update() {}, blocks() { return false; }, pedestrians: [passerby.position],
      updatePlayer: (pose) => placePlayer(player, pose),
    };
  }

  const walker = personModel(scene, gltf, contact, 'Walk', '#d3d6cc');
  const viewer = personModel(scene, gltf, contact, 'Idle', '#74857c');
  const visitor = lookoutVisitor(scene, gltf, contact);
  const player = personModel(scene, gltf, contact, 'Idle', undefined, playerJacket);
  const keepSolesAboveGround = soleContact(player);
  const sitting = benchPose(player.model);
  const driver = createBoardingActor(clone(player.model), player.actions.Idle.getClip(), contact);
  const walk = player.actions.Walk;
  const walkDuration = walk.getClip().duration;
  // Heel contacts in the Rocketbox Walk clip, expressed as fractions of a cycle.
  const footContacts = [.33, .83];
  const feet = ['L', 'R'].map((side) =>
    player.model.getObjectByName('Bip01_' + side + '_Foot'));
  const footPoint = new THREE.Vector3();
  let playerAction = player.actions.Idle;
  viewer.person.position.set(7.00, .24, -28.8);
  viewer.person.rotation.y = Math.PI * .56;

  function update(time) {
    const distance = time * walkSpeed + 2.1;
    const [x, z, yaw] = walkerPose(distance);
    walker.person.position.set(x, .24, z);
    walker.person.rotation.y = yaw;
    walker.mixer.setTime(distance / sourceWalkSpeed);
    viewer.mixer.setTime(time * .91 + .61);
  }
  update(0);
  return {
    update,
    driver,
    visitor,
    pedestrians: [walker.person.position, viewer.person.position, visitor.position],
    canSit: Boolean(sitting),
    updatePlayer(pose) {
      sitting?.restore();
      placePlayer(player.person, pose);
      walk.setEffectiveTimeScale(Math.max(.45, pose.speed / sourceWalkSpeed));
      const next = pose.speed > .12 ? walk : player.actions.Idle;
      if (next !== playerAction) {
        playerAction.fadeOut(.14);
        next.reset().fadeIn(.14).play();
        playerAction = next;
      }
      const before = walk.time / walkDuration;
      player.mixer.update(pose.dt);
      if (sitting && pose.seatBlend > 0) {
        player.model.position.y = 0;
        sitting.apply(pose);
        return;
      }
      keepSolesAboveGround(pose);
      if (next !== walk || !pose.dt) return;
      const after = walk.time / walkDuration;
      for (const [side, phase] of footContacts.entries()) {
        const crossed = after < before ? phase > before || phase <= after : phase > before && phase <= after;
        if (crossed) {
          const point = feet[side]?.getWorldPosition(footPoint) ?? footPoint.set(pose.x, pose.ground, pose.z);
          onFootstep(side, point, THREE.MathUtils.clamp(pose.speed / sourceWalkSpeed, .45, 1));
        }
      }
    },
    blocks(x, z) {
      return Math.hypot(x - walker.person.position.x, z - walker.person.position.z) < .49
        || Math.hypot(x - visitor.position.x, z - visitor.position.z) < .49;
    },
  };
}

function placePlayer(player, { x, z, ground, facing, visible }) {
  player.position.set(x, ground, z);
  player.rotation.y = facing;
  player.visible = visible;
}

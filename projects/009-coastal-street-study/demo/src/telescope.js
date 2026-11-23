import * as THREE from 'three';
import { bar, batchOpaque, box, group } from './geometry.js';

export const telescopeSite = { x: 22.86, z: -60.90, radius: .21 };
const pivotHeight = 1.43;
const minZoom = 1.5;
const maxZoom = 8;
const transitionTime = .82;
const { clamp, damp, degToRad, lerp, radToDeg, smoothstep } = THREE.MathUtils;

export function addLookoutTelescope(parent, m, ground, initialYaw) {
  const { x, z, radius } = telescopeSite;
  const pedestal = group(parent, x, ground, z);
  const enamel = m.plain('#678380', .46, .38);
  const rim = m.plain('#9ba6a0', .37, .74);
  const dark = m.plain('#252f30', .62, .18);
  const glass = m.plain('#1c3c47', .17, .34);
  bar(pedestal, dark, [0, 0, 0], [0, .047, 0], radius, .193, 24);
  bar(pedestal, rim, [0, .047, 0], [0, .097, 0], .151, .135, 24);
  bar(pedestal, enamel, [0, .097, 0], [0, 1.19, 0], .103, .073, 24);
  bar(pedestal, rim, [0, 1.19, 0], [0, 1.27, 0], .109, .109, 24);
  for (let bolt = 0; bolt < 4; bolt++) {
    const angle = Math.PI * (.25 + bolt / 2);
    const dx = .164 * Math.cos(angle);
    const dz = .164 * Math.sin(angle);
    bar(pedestal, rim, [dx, .045, dz], [dx, .060, dz], .013, .013, 6);
  }
  batchOpaque(pedestal);

  const fork = group(pedestal, 0, pivotHeight, 0, initialYaw);
  box(fork, enamel, 0, -.142, 0, .31, .052, .125);
  for (const side of [-1, 1]) {
    const dx = side * .148;
    bar(fork, enamel, [dx, -.148, 0], [dx, 0, 0], .041, .047, 16);
    bar(fork, rim, [side * .165, 0, 0], [side * .191, 0, 0], .036, .028, 16);
  }
  batchOpaque(fork);

  const barrel = group(fork, 0, 0, 0);
  bar(barrel, enamel, [0, 0, .14], [0, 0, -.21], .087, .127, 24);
  bar(barrel, dark, [0, 0, .14], [0, 0, .247], .063, .047, 20);
  bar(barrel, dark, [0, 0, .239], [0, 0, .266], .048, .051, 20);
  bar(barrel, glass, [0, 0, .261], [0, 0, .267], .030, .030, 20);
  bar(barrel, rim, [0, 0, -.209], [0, 0, -.258], .131, .131, 24);
  bar(barrel, dark, [0, 0, -.255], [0, 0, -.290], .124, .122, 24);
  bar(barrel, glass, [0, 0, -.289], [0, 0, -.294], .106, .106, 24);
  addHandle(-1);
  addHandle(1);
  batchOpaque(barrel);

  function addHandle(side) {
    bar(barrel, rim, [side * .080, -.020, .08], [side * .158, -.059, .11], .015);
    bar(barrel, dark, [side * .158, -.059, .11], [side * .170, -.058, .235], .023, .022, 14);
  }
  return { fork, barrel };
}

export function createTelescopeView(camera, { fork, barrel }) {
  const startPosition = new THREE.Vector3();
  const startRotation = new THREE.Quaternion();
  const sight = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const pivot = new THREE.Vector3();
  let progress = 0;
  let direction = 0;
  let zoom = 2;
  let targetZoom = zoom;
  let targetYaw = fork.rotation.y;
  let targetPitch = barrel.rotation.x;

  return {
    get active() { return direction !== 0; },
    get ready() { return direction > 0 && progress === 1; },
    get zoom() { return zoom; },
    get canZoomIn() { return targetZoom < maxZoom; },
    get canZoomOut() { return targetZoom > minZoom; },
    enter() {
      startPosition.copy(camera.position);
      startRotation.copy(camera.quaternion);
      zoom = targetZoom = 2;
      direction = 1;
    },
    exit() {
      direction = -1;
      targetYaw = fork.rotation.y;
      targetPitch = barrel.rotation.x;
    },
    pan(dx, dy) {
      if (direction < 0) return;
      targetYaw = clamp(targetYaw + dx / targetZoom, -2.82, -.16);
      targetPitch = clamp(targetPitch + dy / targetZoom, -.40, .43);
    },
    changeZoom(steps) {
      if (direction < 0) return;
      targetZoom = clamp(targetZoom * 1.25 ** steps, minZoom, maxZoom);
    },
    update(dt, walkingFov) {
      progress = clamp(progress + direction * dt / transitionTime, 0, 1);
      fork.rotation.y = damp(fork.rotation.y, targetYaw, 13, dt);
      barrel.rotation.x = damp(barrel.rotation.x, targetPitch, 13, dt);
      if (direction > 0) zoom = damp(zoom, targetZoom, 10, dt);

      const blend = smoothstep(progress, 0, 1);
      barrel.localToWorld(sight.set(0, 0, -.385));
      barrel.getWorldQuaternion(rotation);
      camera.position.lerpVectors(startPosition, sight, blend);
      camera.quaternion.copy(startRotation).slerp(rotation, blend);
      const sightFov = radToDeg(2 * Math.atan(Math.tan(degToRad(walkingFov) / 2) / zoom));
      camera.fov = lerp(walkingFov, sightFov, smoothstep(progress, .28, 1));
      camera.updateProjectionMatrix();

      // Keep the barrel out of the lens as the camera passes from the eyepiece to the objective.
      barrel.getWorldPosition(pivot);
      barrel.visible = progress < .52 || camera.position.distanceToSquared(pivot) > .50 ** 2;
      if (progress === 0 && direction < 0) direction = 0;
      return smoothstep(progress, .40, .95);
    },
  };
}

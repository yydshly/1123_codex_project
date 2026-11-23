import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function mesh(parent, geometry, material, x = 0, y = 0, z = 0, cast = true) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.castShadow = cast;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

export function box(parent, material, x, y, z, sx, sy, sz, tile = 0, cast = true) {
  const geometry = new THREE.BoxGeometry(sx, sy, sz);
  if (tile) {
    const uv = geometry.attributes.uv;
    const sizes = [[sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy]];
    for (let face = 0; face < 6; face++) {
      const [width, height] = sizes[face];
      for (let corner = 0; corner < 4; corner++) {
        const i = face * 4 + corner;
        uv.setXY(i, uv.getX(i) * width / tile + z * 0.013, uv.getY(i) * height / tile + x * 0.033);
      }
    }
  }
  return mesh(parent, geometry, material, x, y, z, cast);
}

export function shape(parent, material, points, indices, uv, cast = true) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv.flat(), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return mesh(parent, geometry, material, 0, 0, 0, cast);
}

export function bar(parent, material, a, b, radius, topRadius = radius, sides = 10) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const delta = end.clone().sub(start);
  const center = start.addScaledVector(delta, 0.5);
  const segment = mesh(parent, new THREE.CylinderGeometry(topRadius, radius, delta.length(), sides),
    material, center.x, center.y, center.z);
  segment.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return segment;
}

export function curvedBar(parent, material, points, radius, steps = 12) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  return mesh(parent, new THREE.TubeGeometry(curve, steps, radius, 7, false), material);
}

export function group(parent, x, y, z, rotation = 0) {
  const object = new THREE.Group();
  object.position.set(x, y, z);
  object.rotation.y = rotation;
  parent.add(object);
  return object;
}

export function groundPlane(parent, material, x, y, z, width, length) {
  const surface = mesh(parent, new THREE.PlaneGeometry(width, length), material, x, y, z, false);
  surface.rotation.x = -Math.PI / 2;
  return surface;
}

export function batchOpaque(root) {
  const buckets = new Map();
  root.updateMatrixWorld(true);
  const worldToRoot = root.matrixWorld.clone().invert();
  const toRoot = new THREE.Matrix4();
  root.traverse((object) => {
    if (!object.isMesh || object.material.transparent || Array.isArray(object.material)) return;
    const key = object.material.uuid + ':' + object.castShadow;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(object);
  });

  for (const objects of buckets.values()) {
    if (objects.length < 2) continue;
    const geometries = objects.map((object) => {
      const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
      return geometry.applyMatrix4(toRoot.multiplyMatrices(worldToRoot, object.matrixWorld));
    });
    const combined = mergeGeometries(geometries);
    for (const geometry of geometries) geometry.dispose();
    if (!combined) continue;
    mesh(root, combined, objects[0].material, 0, 0, 0, objects[0].castShadow);
    for (const object of objects) {
      object.removeFromParent();
      object.geometry.dispose();
    }
  }
}

export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

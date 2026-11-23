import * as THREE from 'three';
import { bar, batchOpaque, box, group, mesh, shape } from './geometry.js';

const stations = [
  [-5.35, .035, 1.28], [-4.64, .71, 1.11], [-3.24, 1.22, .93],
  [-1.32, 1.48, .85], [.91, 1.52, .82], [3.36, 1.43, .79], [4.58, 1.13, .84],
];
const waterSections = [
  [.03, -.77], [.61, -.53], [.89, -.17], [.99, .10], [1, .57], [1.02, 1],
];
const wakeInterval = 1.6;
const sternOffset = 4.56;

function hullPoint(station, line, side) {
  const [z, width, top] = station;
  const [beam, level] = waterSections[line];
  const lift = THREE.MathUtils.smoothstep(-z, 3.2, 5.35);
  return [side * width * beam, line === 5 ? top : level + lift * .34, z];
}

function addHull(parent, paints, deck) {
  for (let line = 0; line < paints.length; line++) {
    const points = [], triangles = [];
    for (const side of [-1, 1]) {
      for (let i = 1; i < stations.length; i++) {
        const base = points.length;
        points.push(hullPoint(stations[i - 1], line, side), hullPoint(stations[i], line, side),
          hullPoint(stations[i], line + 1, side), hullPoint(stations[i - 1], line + 1, side));
        if (side === 1) triangles.push(base, base + 3, base + 2, base, base + 2, base + 1);
        else triangles.push(base, base + 1, base + 2, base, base + 2, base + 3);
      }
    }
    const at = points.length;
    const aft = stations.at(-1);
    points.push(hullPoint(aft, line, -1), hullPoint(aft, line, 1),
      hullPoint(aft, line + 1, 1), hullPoint(aft, line + 1, -1));
    triangles.push(at, at + 1, at + 2, at, at + 2, at + 3);
    shape(parent, paints[line], points, triangles, points.map(([x, , z]) => [x, z]), false);
  }
  const surface = [], faces = [];
  stations.forEach((station, i) => {
    surface.push(hullPoint(station, 5, -1), hullPoint(station, 5, 1));
    const n = i * 2;
    if (i) faces.push(n - 2, n, n - 1, n - 1, n, n + 1);
  });
  shape(parent, deck, surface, faces, surface.map(([x, , z]) => [x, z]), false);
}

function addWheelhouse(parent, m, paint) {
  const glass = m.plain('#40575e', .24, .16);
  const trim = m.plain('#bfc3b2', .8);
  box(parent, paint, 0, 1.36, -1.09, 1.98, 1.34, 2.69, 0, false);
  box(parent, glass, 0, 2.09, -1.14, 1.94, .64, 2.49, 0, false);
  box(parent, trim, 0, 2.445, -1.14, 2.13, .14, 2.77, 0, false);
  box(parent, paint, 0, 1.72, -1.12, 2.015, .10, 2.64, 0, false);
  const face = -2.395;
  for (const x of [-.89, -.30, .30, .89]) {
    box(parent, paint, x, 2.09, face, .09, .59, .048, 0, false);
  }
  for (const side of [-1, 1]) {
    for (const z of [-2.35, -1.64, -.74, .07]) {
      box(parent, paint, side * .976, 2.09, z, .057, .63, .083, 0, false);
    }
    const buoy = mesh(parent, new THREE.TorusGeometry(.21, .052, 8, 24),
      m.plain('#af5940', .86), side * 1.021, 1.35, -.24, false);
    buoy.rotation.y = Math.PI / 2;
  }
  box(parent, trim, 0, 2.58, -.85, .50, .17, .49, 0, false);
  bar(parent, m.iron, [0, 2.60, -.79], [0, 3.89, -.79], .052);
  bar(parent, paint, [-.62, 3.42, -.79], [.62, 3.42, -.79], .041);
  bar(parent, paint, [.10, 3.7, -.86], [.10, 4.25, -.87], .024);
}

export function addFishingBoat(scene, m, seaLevel) {
  const boat = group(scene, 0, 0, 0);
  boat.name = 'Fishing boat';
  const hull = m.plain('#33595b', .83);
  const underside = m.plain('#344341', .91);
  const bootLine = m.plain('#824c41', .89);
  const paint = m.plain('#d7d6c2', .74);
  const deck = m.plain('#827a63', .94);
  addHull(boat, [underside, underside, bootLine, hull, paint], deck);
  addWheelhouse(boat, m, paint);

  const locker = m.plain('#828574', .95);
  box(boat, locker, .58, 1.03, 1.43, .84, .45, 1.09, 0, false);
  box(boat, deck, -.67, .99, 2.11, .62, .35, .70, 0, false);
  box(boat, locker, -.55, 1.15, 3.24, .84, .58, .78, 0, false);
  for (const side of [-1, 1]) {
    const edge = side * 1.17;
    for (const z of [.89, 2.40, 4.15]) {
      bar(boat, m.iron, [edge, .81, z], [edge, 1.53, z], .04);
    }
    bar(boat, m.iron, [edge, 1.50, .89], [edge, 1.50, 4.15], .043);
    bar(boat, m.iron, [side * .97, .88, 3.08], [side * .32, 2.53, 2.97], .066);
  }
  bar(boat, m.iron, [-.32, 2.53, 2.97], [.32, 2.53, 2.97], .065);
  batchOpaque(boat);

  const wakePath = Array.from({ length: 6 }, () => new THREE.Vector2());
  const heading = new THREE.Vector2();
  let elapsed = 0;
  function update(dt = 0) {
    elapsed += dt;
    for (let i = 0; i < wakePath.length; i++) {
      const phase = 2.04 + (elapsed - i * wakeInterval) * .072;
      const x = 106 + Math.cos(phase) * 24;
      const z = -153 + Math.sin(phase) * 40;
      const dx = -Math.sin(phase) * 24;
      const dz = Math.cos(phase) * 40;
      const speed = Math.hypot(dx, dz);
      const forwardX = dx / speed;
      const forwardZ = dz / speed;
      wakePath[i].set(x - forwardX * sternOffset, z - forwardZ * sternOffset);
      if (i) continue;
      heading.set(forwardX, forwardZ);
      boat.position.set(x, seaLevel + Math.sin(elapsed * 1.39) * .034, z);
      boat.rotation.set(.012 * Math.sin(elapsed * 1.23), Math.atan2(-dx, -dz),
        .022 * Math.sin(elapsed * 1.06 + .8), 'YXZ');
    }
  }
  update();
  return { update, wakePath, heading, position: boat.position };
}

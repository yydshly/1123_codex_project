import * as THREE from 'three';
import { group, mesh, shape } from './geometry.js';

const { damp, lerp, smoothstep, euclideanModulo } = THREE.MathUtils;

function shorelineFlight() {
  const points = [
    [-18, 1.30, 10.4], [-9.5, 1.02, 10.8], [1.5, .90, 10.4],
    [8.2, 1.02, 7.30], [11.5, 1.07, 2.57],
  ];
  // Circle once, then leave from the same tangent and continue along the shore.
  for (let i = 0; i <= 12; i++) {
    const phase = i / 12;
    const angle = Math.PI / 2 - Math.PI * 2 * phase;
    points.push([15.8 + 6.80 * Math.cos(angle), 1.21 + .85 * Math.sin(Math.PI * phase) ** 2,
      -5.50 + 6.80 * Math.sin(angle)]);
  }
  points.push([21.2, 1.07, 1.65], [26.5, .92, .68], [30.5, 1.42, -1.1],
    [27.7, 1.59, -3.60], [17.7, 1.28, -9.6], [2.8, .99, -11.9],
    [-11, 1.29, -11.2], [-19.4, 1.61, -5.5], [-21.2, 1.40, 3.9]);
  const route = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), true);
  route.arcLengthDivisions = 720;
  return route;
}

function wingPlane(pivot, material, side, points, indices) {
  const silhouette = points.map(([x, y, z]) => [x * side, y, z]);
  shape(pivot, material, silhouette, indices, silhouette.map(([x, , z]) => [x, z]), false);
}

function addGull(parent, materials, size, sphere, billGeometry) {
  const root = group(parent, 0, 0, 0);
  root.name = 'Seagull';
  root.scale.setScalar(size);
  const { plumage, wing, tips, bill } = materials;
  mesh(root, sphere, plumage, 0, 0, -.01, false).scale.set(.105, .118, .269);
  mesh(root, sphere, plumage, 0, .061, -.219, false).scale.set(.072, .083, .106);
  mesh(root, sphere, wing, 0, .045, .025, false).scale.set(.099, .061, .19);
  mesh(root, billGeometry, bill, 0, .044, -.340, false).rotation.x = -Math.PI / 2;
  wingPlane(root, plumage, 1,
    [[-.069, .008, .19], [-.112, .016, .368], [0, .035, .327], [.112, .016, .368], [.069, .008, .19]],
    [0, 1, 2, 0, 2, 4, 2, 3, 4]);

  const wings = [-1, 1].map((side) => {
    const shoulder = group(root, side * .071, .035, .013);
    wingPlane(shoulder, wing, side,
      [[0, 0, -.102], [.21, .015, -.135], [.40, .022, -.113], [.415, .01, .049],
        [.27, -.014, .133], [.025, -.022, .155]],
      [0, 1, 5, 1, 4, 5, 1, 2, 4, 2, 3, 4]);
    const outer = group(shoulder, side * .379, .020, -.007);
    wingPlane(outer, wing, side,
      [[0, 0, -.11], [.155, .007, -.119], [.273, .003, -.072],
        [.262, -.013, .048], [.151, -.020, .091], [0, -.013, .075]],
      [0, 1, 5, 1, 4, 5, 1, 2, 4, 2, 3, 4]);
    wingPlane(outer, tips, side,
      [[.248, .003, -.084], [.337, -.008, -.055], [.415, -.021, -.006],
        [.355, -.020, .010], [.405, -.023, .027], [.329, -.021, .042],
        [.292, -.018, .065], [.249, -.014, .063]],
      [0, 1, 7, 1, 2, 3, 1, 3, 7, 3, 4, 5, 3, 5, 7, 5, 6, 7]);
    return { side, shoulder, outer };
  });
  return { root, wings };
}

export function addSeagulls(scene, reef, boatPosition, seaLevel) {
  const materials = {
    plumage: new THREE.MeshStandardMaterial({ color: '#ede9dd', roughness: .84, side: THREE.DoubleSide }),
    wing: new THREE.MeshStandardMaterial({ color: '#bfc4c2', roughness: .91, side: THREE.DoubleSide }),
    tips: new THREE.MeshStandardMaterial({ color: '#333b40', roughness: .90, side: THREE.DoubleSide }),
    bill: new THREE.MeshStandardMaterial({ color: '#ae8950', roughness: .78 }),
  };
  const sphere = new THREE.SphereGeometry(1, 10, 8);
  const bill = new THREE.ConeGeometry(.025, .100, 7);
  const route = shorelineFlight();
  const length = route.getLength();
  const flock = [
    { size: 1.07, spread: 1, speed: 5.35, distance: .65, seed: 5.2, cadence: 6.25, height: .08, farSide: false },
    { size: .92, spread: 1.11, speed: 5.02, distance: 68, seed: 2.5, cadence: 7.10, height: .39, farSide: true },
    { size: .96, spread: .86, speed: 5.46, distance: 28, seed: 4.2, cadence: 6.80, height: .32, followsBoat: true },
  ].map((spec) => ({ ...spec, ...addGull(scene, materials, spec.size), bank: 0 }));
  const here = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  const point = new THREE.Vector3();
  let time = 0;

  function locate(bird, distance, result) {
    route.getPointAt(euclideanModulo(distance / length, 1), point);
    const across = point.x * bird.spread;
    const along = point.z * bird.spread;
    const height = seaLevel + point.y + bird.height + .046 * Math.sin(time * 2.15 + bird.seed * 3.5);
    if (bird.followsBoat) {
      return result.set(boatPosition.x + 20 + across * .58, height, boatPosition.z + along);
    }
    return result.set(reef.x + across, height,
      reef.z + along * (bird.farSide ? -1 : 1) - (bird.farSide ? 28.8 : 0));
  }

  function update(dt = 0) {
    time += dt;
    for (const bird of flock) {
      bird.distance += dt * bird.speed / bird.spread;
      locate(bird, bird.distance, here);
      locate(bird, bird.distance + .32, ahead);
      const dx = dt ? here.x - bird.root.position.x : ahead.x - here.x;
      const dz = dt ? here.z - bird.root.position.z : ahead.z - here.z;
      const dy = dt ? here.y - bird.root.position.y : ahead.y - here.y;
      const yaw = Math.atan2(-dx, -dz);
      const delta = yaw - bird.root.rotation.y;
      const turn = dt ? Math.atan2(Math.sin(delta), Math.cos(delta)) / dt : 0;
      const bank = THREE.MathUtils.clamp(turn * .36, -.58, .58);
      bird.bank = damp(bird.bank, bank, 7.6, dt);
      const pitch = THREE.MathUtils.clamp(Math.atan2(dy, Math.hypot(dx, dz)) * .67, -.17, .27);
      bird.root.rotation.set(dt ? damp(bird.root.rotation.x, pitch, 9.5, dt) : pitch, yaw, bird.bank, 'YXZ');
      bird.root.position.copy(here);

      const cycle = (time + bird.seed) % bird.cadence;
      const burst = smoothstep(cycle, 0, .22) * (1 - smoothstep(cycle, 1.23, 1.78));
      const stroke = burst * (1 - Math.abs(bird.bank) * .62);
      const phase = time * 16.4 + bird.seed;
      for (const { side, shoulder, outer } of bird.wings) {
        shoulder.rotation.z = side * lerp(.168 + .035 * Math.sin(phase * .15), .082 + .53 * Math.sin(phase), stroke);
        outer.rotation.z = side * lerp(-.046, -.018 + .39 * Math.sin(phase - .58), stroke);
        outer.rotation.y = side * (.069 + .14 * stroke * Math.sin(phase - .3));
      }
    }
  }
  update();
  return update;
}

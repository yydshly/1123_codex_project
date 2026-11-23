import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { bar, batchOpaque, box, curvedBar, group, groundPlane, mesh, shape } from './geometry.js';

export function addStreetLamp(parent, m, x, y, z) {
  const lamp = group(parent, x, y, z);
  bar(lamp, m.iron, [0, 0, 0], [0, 0.58, 0], 0.095, 0.066, 12);
  bar(lamp, m.iron, [0, 0.55, 0], [0, 4.52, 0], 0.058, 0.027, 12);
  bar(lamp, m.iron, [0, 4.48, 0], [0, 4.74, 0], 0.043, 0.003, 9);
  for (const side of [-1, 1]) {
    curvedBar(lamp, m.iron, [[0, 4.2, 0], [0.24 * side, 4.27, 0], [0.55 * side, 4.22, 0],
      [0.77 * side, 4.31, 0], [0.86 * side, 4.18, 0], [0.86 * side, 4.08, 0]], 0.022);
    curvedBar(lamp, m.iron, [[0, 4.09, 0], [0.27 * side, 4.01, 0], [0.46 * side, 4.16, 0]], 0.012);
    const lx = 0.86 * side;
    mesh(lamp, new THREE.CylinderGeometry(0.128, 0.084, 0.23, 6), m.paleGlass, lx, 3.89, 0);
    bar(lamp, m.iron, [lx, 3.99, 0], [lx, 4.09, 0], 0.147, 0.018, 6);
    bar(lamp, m.iron, [lx, 3.745, 0], [lx, 3.777, 0], 0.055, 0.091, 6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      bar(lamp, m.iron, [lx + Math.sin(a) * 0.084, 3.78, Math.cos(a) * 0.084],
        [lx + Math.sin(a) * 0.128, 4.0, Math.cos(a) * 0.128], 0.007, 0.007, 5);
    }
  }
}

export function addBench(parent, m, x, y, z) {
  const bench = group(parent, x, y, z);
  const wood = m.plain('#756b52');
  for (const side of [-1, 1]) {
    const a = side * 0.67;
    bar(bench, m.iron, [-0.18, 0.02, a], [-0.13, 0.45, a], 0.027);
    bar(bench, m.iron, [0.24, 0.02, a], [0.19, 0.45, a], 0.027);
    bar(bench, m.iron, [-0.22, 0.41, a], [-0.25, 0.87, a], 0.023);
    curvedBar(bench, m.iron, [[0.18, 0.45, a], [0.13, 0.64, a], [-0.14, 0.65, a],
      [-0.23, 0.57, a]], 0.019);
  }
  for (let slat = 0; slat < 5; slat++) {
    box(bench, wood, -0.2 + slat * 0.093, 0.458, 0, 0.073, 0.026, 1.83);
  }
  for (let slat = 0; slat < 4; slat++) {
    box(bench, wood, -0.24 - slat * 0.008, 0.565 + slat * 0.083, 0, 0.027, 0.066, 1.83);
  }
}

const driverDoorHinge = { x: .836, z: -1.106 };
const driverDoorEnd = .038;

function hull(parent, material, sections, movingDoor) {
  const points = [];
  const uv = [];
  for (const [z, width, bottom, top, cabinOpening] of sections) {
    const height = top - bottom;
    const deckEdge = cabinOpening ? .87 : .63;
    const ring = [[-.83, 0], [-1, .23], [-.995, .71], [-.93, .93], [-deckEdge, 1],
      [deckEdge, 1], [.93, .93], [.995, .71], [1, .23], [.83, 0]];
    ring.forEach(([x, y], index) => {
      points.push([x * width / 2, bottom + height * y, z]);
      uv.push([index / (ring.length - 1), z / 4 + 0.5]);
    });
  }
  const faces = [];
  const doorFaces = [];
  const ringSize = 10;
  for (let ring = 0; ring < sections.length - 1; ring++) {
    for (let i = 0; i < ringSize; i++) {
      if (i === 4 && sections[ring][4] && sections[ring + 1][4]) continue;
      const next = (i + 1) % ringSize;
      const a = ring * ringSize + i;
      const b = ring * ringSize + next;
      const c = b + ringSize;
      const d = a + ringSize;
      const isDoor = movingDoor && i >= 5 && i < 8
        && sections[ring][0] >= driverDoorHinge.z && sections[ring + 1][0] <= driverDoorEnd;
      const target = isDoor ? doorFaces : faces;
      target.push(a, d, b, b, d, c);
    }
  }
  const last = (sections.length - 1) * ringSize;
  for (let i = 1; i < ringSize - 1; i++) faces.push(0, i, i + 1, last, last + i + 1, last + i);
  shape(parent, material, points, faces, uv);
  if (movingDoor) shape(movingDoor, material, points, doorFaces, uv);
}

function hingedDoor(root, cabinY) {
  const pivot = group(root, driverDoorHinge.x, 0, driverDoorHinge.z);
  const skin = group(pivot, -pivot.position.x, 0, -pivot.position.z);
  const outerGrip = group(skin, .944, .842, -.062);
  const innerGrip = group(skin, .767, .846, -.165);
  const frameGrip = group(skin, .778, cabinY(1.115), .035);
  return {
    pivot, skin, outerGrip, innerGrip, frameGrip,
    setAngle(angle) { pivot.rotation.y = angle; },
    outerEdge(angle, span) {
      const gap = (driverDoorEnd - driverDoorHinge.z) * span;
      return { x: driverDoorHinge.x + .076 * Math.cos(angle) + gap * Math.sin(angle),
        z: driverDoorHinge.z - .076 * Math.sin(angle) + gap * Math.cos(angle) };
    },
  };
}

function panel(parent, material, corners) {
  const surface = shape(parent, material, corners, [0, 1, 2, 0, 2, 3],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  if (material.transparent) surface.renderOrder = 4;
  return surface;
}

function plateMaterial(registration) {
  const image = document.createElement('canvas');
  image.width = 256;
  image.height = 64;
  const paint = image.getContext('2d');
  paint.fillStyle = '#d2bb71';
  paint.fillRect(0, 0, 256, 64);
  paint.strokeStyle = '#817543';
  paint.strokeRect(3, 3, 250, 58);
  paint.fillStyle = '#353737';
  paint.font = '600 39px monospace';
  paint.textAlign = 'center';
  paint.textBaseline = 'middle';
  paint.fillText(registration, 128, 33);
  const map = new THREE.CanvasTexture(image);
  map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map, roughness: .67 });
}

function addWheel(car, wheelParent, m, contact, side, z) {
  const pivot = group(wheelParent, side * .797, .319, z);
  const spin = group(pivot, 0, 0, 0);
  const profile = [[.203, -.109], [.273, -.109], [.298, -.102], [.314, -.076], [.319, -.053],
    [.319, .053], [.314, .076], [.298, .102], [.273, .109], [.203, .109]];
  const tire = mesh(spin, new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 36), m.tire);
  tire.rotation.z = Math.PI / 2;
  const rim = mesh(spin, new THREE.CylinderGeometry(.207, .207, .018, 30), m.rim, side * .115);
  rim.rotation.z = Math.PI / 2;
  const hub = mesh(spin, new THREE.CylinderGeometry(.179, .179, .018, 30), m.rubber, side * .124);
  hub.rotation.z = Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    bar(spin, m.rim, [side * .14, 0, 0],
      [side * .14, Math.cos(angle) * .191, Math.sin(angle) * .191], .015, .021, 7);
  }
  const badge = mesh(spin, new THREE.CylinderGeometry(.061, .061, .028, 20), m.rim, side * .146);
  badge.rotation.z = Math.PI / 2;
  const archHeight = car === wheelParent ? .354 : .381;
  const arch = Array.from({ length: 11 }, (_, index) => {
    const angle = index * Math.PI / 10;
    return [side * .905, .314 + Math.sin(angle) * archHeight, z + Math.cos(angle) * .366];
  });
  curvedBar(car, m.rubber, arch.slice(2, -2), .010, 16);
  groundPlane(wheelParent, contact, side * .791, .015, z, .39, .49).renderOrder = 3;
  return { pivot, spin, front: z < 0 };
}

function addInterior(car, steeringParent, m, driverDoor, cabinY) {
  const carpet = m.plain('#202326', .98);
  const fabric = m.plain('#3b4144', .94);
  const trim = m.plain('#303638', .83);
  const insert = m.plain('#484d4e', .98);
  const liner = m.plain('#494b48', .96);
  const padded = (material, x, y, z, width, height, depth, radius, parent = car) => mesh(parent,
    new RoundedBoxGeometry(width, height, depth, 2, radius), material, x, y, z, false);

  if (driverDoor) {
    box(car, carpet, 0, .274, -.520, 1.57, .043, 1.18, 0, false);
    box(car, carpet, 0, .354, .788, 1.6, .043, 1.443, 0, false);
  } else {
    box(car, carpet, 0, .354, .25, 1.6, .043, 2.66, 0, false);
  }
  box(car, trim, 0, .625, -1.024, 1.55, .54, .082, 0, false);
  box(car, carpet, 0, .611, 1.28, 1.48, .531, .088, 0, false);
  padded(trim, 0, .917, -.921, 1.46, .135, .27, .045);
  padded(trim, .37, .991, -.843, .34, .056, .17, .023);
  padded(m.rubber, 0, .60, -.51, .205, .31, .68, .042);
  bar(car, m.iron, [0, .747, -.491], [0, .818, -.496], .012, .013, 8);
  padded(trim, 0, .821, -.497, .039, .038, .044, .013);
  padded(liner, 0, cabinY(1.344), .27, 1.19, .031, 1.27, .013);
  padded(carpet, 0, .88, 1.408, 1.37, .043, .60, .016);
  for (const side of [-1, 1]) {
    if (driverDoor && side === 1) {
      box(car, carpet, .771, .360, .19, .14, .085, 2.47, 0, false);
      box(car, carpet, .76, .59, .705, .138, .44, 1.34, 0, false);
      padded(trim, .858, .669, -.53, .102, .471, 1.05, .04, driverDoor.skin);
      padded(m.rubber, .790, .824, -.422, .09, .047, .52, .019, driverDoor.skin);
      padded(insert, .774, .846, -.170, .032, .031, .115, .013, driverDoor.skin);
    } else {
      box(car, carpet, side * .76, .58, .19, .138, .48, 2.47, 0, false);
      padded(trim, side * .744, .801, -.517, .11, .20, 1.07, .031);
      padded(m.rubber, side * .687, .85, -.402, .10, .036, .36, .014);
    }
    padded(trim, side * .737, .801, .638, .113, .20, 1.14, .031);

    const x = side * .365;
    const seatY = driverDoor ? .365 : .421;
    const backZ = driverDoor ? .085 : -.020;
    const backY = driverDoor ? .818 : .858;
    const backHeight = driverDoor ? .794 : .704;
    const recline = driverDoor ? .29 : .16;
    const restZ = driverDoor ? .242 : .052;
    padded(fabric, x, seatY, -.255, .451, .128, .474, .041);
    padded(insert, x, seatY + .059, -.268, .301, .022, .37, .010).rotation.x = -.07;
    padded(fabric, x, backY, backZ, .448, backHeight, .138, .056).rotation.x = recline;
    padded(trim, x, backY - .004, backZ + .053, .379, backHeight - .014, .071, .032).rotation.x = recline;
    for (const spread of [-.062, .062]) {
      bar(car, m.iron, [x + spread, 1.175, restZ - .022], [x + spread, 1.243, restZ], .008, .008, 8);
    }
    padded(fabric, x, 1.256, restZ, .238, .111, .117, .034).rotation.x = .11;

    padded(fabric, x, .543, .741, .453, .126, .47, .035);
    padded(trim, x, .806, .978, .453, .512, .144, .035).rotation.x = .22;
    padded(fabric, x, 1.092, 1.033, .203, .107, .111, .029).rotation.x = .20;
  }
  padded(fabric, 0, .541, .741, .278, .12, .446, .03);
  padded(trim, 0, .796, .978, .268, .48, .132, .027).rotation.x = .22;

  const steering = group(steeringParent, .365, 1.021, -.674);
  steering.rotation.x = -.40;
  const wheel = group(steering, 0, 0, 0);
  mesh(wheel, new THREE.TorusGeometry(.135, .015, 9, 30), m.rubber, 0, 0, 0, false);
  for (const angle of [-1.72, 1.72, Math.PI]) {
    bar(wheel, trim, [0, 0, 0], [Math.sin(angle) * .13, Math.cos(angle) * .13, 0], .011, .012, 8);
  }
  padded(trim, .365, 1.021, -.668, .112, .063, .041, .019).rotation.x = steering.rotation.x;
  return wheel;
}

export function addCar(parent, m, contact, { x, z, paint: color, rotation, scale, registration }, movable = false) {
  const root = group(parent, x, 0, z, rotation);
  root.scale.set(...scale);
  const suspension = movable ? group(root, 0, .55, 0) : undefined;
  const cabin = movable ? group(suspension, 0, -.55, 0) : root;
  const car = movable ? group(cabin, 0, 0, 0) : root;
  const wheels = [];
  const cabinY = (height) => height + (movable ? Math.max(0, height - .92) * .157 : 0);
  const driverDoor = movable ? hingedDoor(cabin, cabinY) : undefined;
  const glazing = (parent, material, corners) => panel(parent, material,
    corners.map(([x, y, z]) => [x, cabinY(y), z]));
  const paint = new THREE.MeshPhysicalMaterial({
    color, roughness: 0.36, metalness: 0.22, clearcoat: 0.48, clearcoatRoughness: 0.28,
    envMap: m.streetReflection, envMapIntensity: .86,
  });
  const window = new THREE.MeshPhysicalMaterial({
    color: '#a1b2b1', side: THREE.DoubleSide, roughness: .19, metalness: .32,
    transparent: true, opacity: .40, depthWrite: false,
    envMap: m.streetReflection, envMapIntensity: 1.07,
  });
  const glassRear = window.clone();
  glassRear.color.set('#899e99');
  glassRear.opacity = .48;
  for (const material of [window, glassRear]) {
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', [
        'float grazing = 1.0 - abs(dot(normal, normalize(vViewPosition)));',
        'diffuseColor.a *= 0.65 + 0.65 * grazing * grazing;',
        '#include <opaque_fragment>',
      ].join('\n'));
    };
  }
  const red = m.plain('#7d292c', 0.48);
  red.side = THREE.DoubleSide;
  const redStrip = m.plain('#b56a62', 0.43);
  const pale = m.plain('#c5c4b4', 0.45);
  const plastic = m.plain('#4a5252', 0.7);
  const contactPatch = groundPlane(root, contact, 0, 0.012, 0, 2.8, 5.05);
  contactPatch.renderOrder = 2;
  hull(car, paint, [
    [-2.18, 1.41, .30, .62], [-2.09, 1.67, .26, .77], [-1.87, 1.77, .31, .83],
    [-1.38, 1.81, .32, .86], [-1.13, 1.81, movable ? .265 : .31, .893, true],
    [driverDoorHinge.z, 1.81, movable ? .263 : .31, .895, true], [-.73, 1.82, movable ? .261 : .29, .92, true],
    [driverDoorEnd, 1.82, movable ? .264 : .29, .926, true], [.74, 1.82, .29, .93, true],
    [1.35, 1.80, .32, .91, true], [1.76, 1.76, .30, .893, true],
    [1.91, 1.73, .29, .87], [2.07, 1.54, .31, .76],
  ], driverDoor?.skin);
  hull(car, paint, [[-.67, 1.34, 1.31, 1.395], [-.49, 1.41, 1.36, 1.426],
    [.70, 1.37, 1.354, 1.421], [1.0, 1.26, 1.32, 1.37]]
    .map(([z, width, bottom, top]) => [z, width, cabinY(bottom), cabinY(top)]));
  const steering = addInterior(car, cabin, m, driverDoor, cabinY);
  if (movable) redStrip.emissive.set('#e12e1c');
  redStrip.emissiveIntensity = 0;
  glazing(car, window, [[-.78, .915, -1.14], [.78, .915, -1.14],
    [.65, 1.373, -.61], [-.65, 1.373, -.61]]);
  glazing(car, glassRear, [[.747, .907, 1.78], [-.747, .907, 1.78],
    [-.61, 1.336, .92], [.61, 1.336, .92]]);
  const defroster = m.plain('#625c52', .67);
  for (let line = 1; line <= 6; line++) {
    const t = line / 8;
    const width = .692 - t * .11;
    const y = cabinY(.907 + .429 * t) + .002;
    const z = 1.78 - .86 * t + .006;
    bar(car, defroster, [-width, y, z - .012], [width, y, z - .012], .0018, .0018, 5);
  }
  for (const side of [-1, 1]) {
    const s = side;
    const frontDoor = s === 1 && driverDoor ? driverDoor.skin : car;
    glazing(frontDoor, window, [[s * .834, .92, -1.1], [s * .84, .92, .03],
      [s * .676, 1.36, .02], [s * .67, 1.36, -.60]]);
    glazing(car, glassRear, [[s * .839, .92, .09], [s * .776, .918, 1.73],
      [s * .62, 1.338, .91], [s * .676, 1.36, .09]]);
    bar(car, paint, [s * .836, .927, .055], [s * .68, cabinY(1.366), .066], .032, .025, 6);
    bar(car, paint, [s * .788, .929, -1.15], [s * .657, cabinY(1.39), -.59], .025, .022, 7);
    bar(car, plastic, [s * .75, .928, 1.775], [s * .613, cabinY(1.352), .921], .019, .015, 7);
    bar(frontDoor, m.rubber, [s * .848, .915, -1.09], [s * .846, .922, .031], .014, .014, 7);
    bar(car, m.rubber, [s * .846, .922, .055], [s * .8, .915, 1.65], .013, .013, 7);
    box(frontDoor, plastic, s * .916, .842, -.062, .018, .029, .126);
    box(car, plastic, s * .913, .84, .99, .012, .022, .10);
    if (frontDoor !== car) {
      bar(frontDoor, m.rubber, [.838, .925, .031], [.675, cabinY(1.361), .023], .014, .014, 7);
      bar(frontDoor, m.rubber, [.675, cabinY(1.361), .023], [.67, cabinY(1.36), -.60], .013, .013, 7);
      bar(frontDoor, m.rubber, [.837, .918, -1.081], [.673, cabinY(1.36), -.595], .016, .013, 7);
      bar(frontDoor, m.rubber, [.91, .454, .037], [.87, .909, .038], .009, .008, 6);
      bar(car, plastic, [.874, .454, .055], [.817, .926, .055], .016, .013, 7);
    }
    bar(frontDoor, paint, [s * .8, 1.004, -.80], [s * 1.018, 1.013, -.77], .034, .048);
    const mirror = mesh(frontDoor, new THREE.SphereGeometry(1, 12, 8), paint, s * 1.01, 1.018, -.775);
    mirror.scale.set(.118, .055, .08);
    panel(car, red, [[s * .38, .65, 2.073], [s * .69, .64, 2.075],
      [s * .709, .719, 2.073], [s * .393, .72, 2.073]]);
    box(car, redStrip, s * .535, .691, 2.077, .276, .018, .006);
    box(car, pale, s * .637, .723, -2.103, .369, .101, .043);
    for (const wheelZ of [-1.39, 1.31]) wheels.push(addWheel(car, root, m, contact, s, wheelZ));
  }
  box(car, plastic, 0, .383, 2.066, 1.33, .052, .025);
  box(car, plastic, 0, .447, -2.123, 1.43, .104, .124);
  box(car, m.rubber, 0, .582, -2.191, .61, .09, .026);
  panel(car, plateMaterial(registration), [[-.202, .532, 2.081], [.202, .532, 2.081],
    [.202, .634, 2.081], [-.202, .634, 2.081]]);
  box(car, plastic, 0, .671, 2.078, .162, .021, .012);
  bar(car, m.iron, [0.38, cabinY(1.39), .6], [.41, cabinY(1.54), .80], .009, .004, 6);
  if (movable) {
    root.traverse((object) => { if (object.isMesh) object.castShadow = false; });
    batchOpaque(car);
    batchOpaque(driverDoor.pivot);
    batchOpaque(steering);
    for (const { spin } of wheels) batchOpaque(spin);
  }
  function animate({ distance, steering: turn, curvature, pitch, roll, braking, resetWheels }) {
    if (suspension) {
      suspension.rotation.x = pitch;
      suspension.rotation.z = roll;
    }
    const tangent = Math.tan(turn);
    for (const wheel of wheels) {
      const radius = 1 + curvature * wheel.pivot.position.x;
      const travel = distance * Math.hypot(radius, wheel.front ? tangent : 0);
      wheel.spin.rotation.x = resetWheels ? 0 : (wheel.spin.rotation.x - travel / .319) % (2 * Math.PI);
      if (wheel.front) wheel.pivot.rotation.y = Math.atan2(tangent, radius);
    }
    steering.rotation.z = turn * 2.1;
    redStrip.emissiveIntensity = braking ? 1.27 : 0;
  }
  return { root, cabin, animate, driverDoor };
}

export function addPerson(parent, m, contact, x, y, z, rotation, coatColor) {
  const person = group(parent, x, y, z, rotation);
  const clothes = m.plain(coatColor, .94);
  const trousers = m.plain('#444949', .88);
  const skin = m.plain('#ae8f76', .79);
  const hair = m.plain('#463c35', .93);
  groundPlane(person, contact, 0, .009, 0, .78, .75).renderOrder = 2;
  const torso = mesh(person, new THREE.CapsuleGeometry(.17, .3, 5, 12), clothes, 0, 1.22, 0);
  torso.scale.set(1.1, 1, .65);
  const head = mesh(person, new THREE.SphereGeometry(1, 14, 10), skin, 0, 1.596, .015);
  head.scale.set(.099, .133, .087);
  const top = mesh(person, new THREE.SphereGeometry(1, 12, 8), hair, 0, 1.648, -.007);
  top.scale.set(.101, .089, .084);
  for (const side of [-1, 1]) {
    const sx = .09 * side;
    bar(person, trousers, [sx, .86, 0], [sx, .505, .1 * side], .074, .082);
    bar(person, trousers, [sx, .19, .177 * side], [sx, .505, .1 * side], .048, .068);
    const shoe = mesh(person, new THREE.SphereGeometry(1, 12, 8), m.tire, sx, .07, .045 + .178 * side);
    shoe.scale.set(.059, .064, .113);
    bar(person, clothes, [.26 * side, 1.105, -.08 * side], [.153 * side, 1.37, 0], .054, .073);
    bar(person, clothes, [.245 * side, .882, -.146 * side], [.26 * side, 1.105, -.08 * side], .036, .052);
    const hand = mesh(person, new THREE.SphereGeometry(1, 8, 6), skin,
      .243 * side, .854, -.15 * side);
    hand.scale.set(.038, .06, .031);
  }
  return person;
}

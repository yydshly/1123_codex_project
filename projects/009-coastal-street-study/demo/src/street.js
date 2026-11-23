import * as THREE from 'three';
import { addBench, addCar, addStreetLamp } from './props.js';
import { bar, batchOpaque, box, curvedBar, group, mesh, seededRandom, shape } from './geometry.js';
import { shade, shadowTexture } from './materials.js';
import { addCoastLoop, atLookoutBench, createCoastLoop, lookout, lookoutPavingHeight, onLookout } from './coast-loop.js';
import { telescopeSite } from './telescope.js';

export const streetEnd = -128;
const streetStart = 10.5;
const turnaround = { entrance: -109, edge: -13.7, wallWidth: .38 };
const endWallFace = streetEnd + turnaround.wallWidth;
export const limits = { minX: -6.38, maxX: 7.37, minZ: endWallFace + .24, maxZ: 6 };
export const startView = { x: 0.48, z: 5.55, yaw: -0.035, pitch: -0.038, eye: 1.65 };
export const carStart = {
  x: -.58, z: -5.02, paint: '#788b93', rotation: 0, scale: [1, 1, 1], registration: 'MC 307',
};
export const harbourArchive = { x: -6.96, z: -38.05, photo: 'photos/harbour-archive.jpg' };
export const fixedViews = {
  street: startView,
  curb: { x: carStart.x + 1.47, z: -1.54, yaw: 0.64, pitch: -0.40, eye: 1.18 },
  cabin: { x: carStart.x + 2.40, z: -3.73, yaw: 1.09, pitch: -.17, eye: 1.48 },
  shore: { x: 6.75, z: -19.2, yaw: -0.78, pitch: -0.11, eye: 1.65 },
  archive: { x: -5.32, z: harbourArchive.z + .08, yaw: Math.PI / 2 - .04, pitch: -.015, eye: 1.50 },
  lookout: { x: 22.26, z: -66.18, yaw: -.65, pitch: -.076, eye: 1.67 },
};

const parked = [
  { x: -3.00, z: -18.72, paint: '#657067', rotation: -0.025, scale: [.95, 1.07, .88], registration: 'LO 482' },
  { x: -2.89, z: -33.1, paint: '#a6a49e', rotation: 0.017, scale: [1.02, .92, 1.08], registration: 'HT 095' },
  { x: -2.96, z: -52.8, paint: '#a58c77', rotation: -0.008, scale: [.97, 1.03, .95], registration: 'SE 825' },
  { x: -2.91, z: -63.7, paint: '#777f82', rotation: 0.022, scale: [1.03, .92, 1.07], registration: 'GV 416' },
];

const planters = [{ x: -6.12, z: -10.12 }, { x: -6.13, z: -12.16 }];
const landCurb = { x: -3.985, width: .19 };
const promenadeWall = { x: 3.805, width: .395, capWidth: .447 };
const rampStart = 3.58;
const promenadeRoadEdge = Math.min(rampStart, promenadeWall.x - promenadeWall.capWidth / 2);
const coastLoop = createCoastLoop(promenadeRoadEdge, streetEnd, streetStart);
export function seawardWalls() {
  const walls = coastLoop.spans.map(({ from, to }) => [[from.right + .09, from.z], [to.right + .09, to.z]]);
  const outerDeck = lookout.railX + .13;
  walls.push([[outerDeck, lookout.far], [outerDeck, lookout.near]]);
  for (const z of [lookout.far, lookout.near]) {
    walls.push([[lookout.edge, z], [outerDeck, z]]);
  }
  return walls;
}

const junctionRamp = { left: 4.56, right: 7.62, top: coastLoop.gaps.at(-1)[1], length: 1.3 };
const promenadeGap = { x: 5.64, width: 4.16 };
// The walking clip reaches .59 m from the root. Allow for the curb lip as well.
const coastalFootprint = Array.from({ length: 16 }, (_, index) => {
  const angle = index * Math.PI / 8;
  return [.68 * Math.cos(angle), .68 * Math.sin(angle)];
});
const rampStripWidth = .197;
const rampStrips = 5;
const rampWidth = rampStripWidth * rampStrips;
const houseBase = .14;
const doorstep = { z: .18, depth: .49, height: .076, y: .042, doorWidth: .96, extraWidth: .22 };
const promenadeLampX = 4.46;
const promenadeLamps = [-1.95, -20.4, -38.8, -57.9, -77.7, -96.6, -116.2];
const benches = [
  [5.47, -11.34], [6.3, -29.35], [6.3, -49.0], [5.51, -73.1], [6.26, -104.4], [5.58, -120.6],
];
const ramps = [[-91.7, -88.2], [-51, -47.5], [-17.95, -14.45], [4.5, 8.25]];

function rampHeight(x) {
  return .24 * THREE.MathUtils.smoothstep(x, rampStart, rampStart + rampWidth) + .009;
}

function pierOpening(z) {
  return ramps.some(([from, to]) => z > from && z < to);
}

export function walkLimitX(z) {
  return z < turnaround.entrance ? turnaround.edge + .24 : limits.minX;
}

function carContains(car, x, z, padding) {
  const dx = x - car.x;
  const dz = z - car.z;
  const cos = Math.cos(car.rotation);
  const sin = Math.sin(car.rotation);
  return Math.abs(dx * cos - dz * sin) < .95 * car.scale[0] + padding
    && Math.abs(dx * sin + dz * cos) < 2.18 * car.scale[2] + padding;
}

export function walkSurfaceHeight(x, z) {
  if (z < streetEnd || z > streetStart) return;
  if (x < -3.89) {
    if (z < turnaround.entrance) return .001;
    if (doorwaySteps.some((step) => Math.abs(x - step.x) < doorstep.depth / 2
      && Math.abs(z - step.z) < step.halfWidth)) return houseBase + doorstep.y + doorstep.height / 2;
    return x > -4.08 ? .137 : .132;
  }
  if (x < rampStart) return .001;
  if (x >= junctionRamp.left && x <= junctionRamp.right && z <= junctionRamp.top && z > junctionRamp.top - junctionRamp.length) {
    return THREE.MathUtils.lerp(.24, .003, (junctionRamp.top - z) / junctionRamp.length);
  }
  const pavingHeight = lookoutPavingHeight(x, z);
  if (pavingHeight !== undefined) return pavingHeight;
  if (coastLoop.contains(x, z) || (x <= promenadeGap.x + promenadeGap.width / 2 && coastLoop.promenadeOpen(z))) return .003;
  if (x > junctionRamp.right) return;
  if (x < rampStart + rampWidth && pierOpening(z)) {
    const a = rampStart + Math.floor((x - rampStart) / rampStripWidth) * rampStripWidth;
    return THREE.MathUtils.lerp(rampHeight(a), rampHeight(a + rampStripWidth), (x - a) / rampStripWidth);
  }
  return 0.24;
}

export function walkHeight(x, z) {
  return walkSurfaceHeight(x, z) ?? .001;
}

export function walkPointIsClear(x, z, car) {
  const radius = 0.23;
  if (x < walkLimitX(z) || z < limits.minZ || z > limits.maxZ) return false;
  if (x > limits.maxX && !coastLoop.contains(x, z) && !onLookout(x, z)) return false;
  if (x > 3.52 - radius && x < 4.03 + radius && !pierOpening(z) && !coastLoop.promenadeOpen(z)) return false;
  if (benches.some(([bx, bz]) => !coastLoop.promenadeOpen(bz) && Math.abs(x - bx) < .53 && Math.abs(z - bz) < 1.16)
    || atLookoutBench(x, z)) return false;
  if (Math.hypot(x - telescopeSite.x, z - telescopeSite.z) < radius + telescopeSite.radius) return false;
  if (planters.some((pot) => Math.hypot(x - pot.x, z - pot.z) < radius + .26)) return false;
  return !(car && carContains(car, x, z, radius))
    && !parked.some((vehicle) => carContains(vehicle, x, z, radius));
}

export function canWalk(x, z, car) {
  if (!walkPointIsClear(x, z, car)) return false;
  if (x <= limits.maxX) return true;
  return coastalFootprint.every(([dx, dz]) => {
    const footX = x + dx;
    const footZ = z + dz;
    const promenadeEdge = coastLoop.promenadeOpen(footZ) ? promenadeGap.x + promenadeGap.width / 2 : junctionRamp.right;
    return footX <= promenadeEdge || coastLoop.contains(footX, footZ)
      || (footX <= lookout.railX && lookoutPavingHeight(footX, footZ) !== undefined);
  });
}

export function cameraIsClear(x, y, z, car) {
  if (x < walkLimitX(z) - .09 || z < endWallFace || z > 9.85 || y < walkHeight(x, z) + .14) return false;
  if (y < 1.47 && x > 7.44 && !coastLoop.contains(x, z) && lookoutPavingHeight(x, z) === undefined) return false;
  if (y < .62 && x > 3.42 && x < 4.14 && !pierOpening(z) && !coastLoop.promenadeOpen(z)) return false;
  if (y < 4.8 && Math.abs(x - promenadeLampX) < .18
    && promenadeLamps.some((lampZ) => !coastLoop.promenadeOpen(lampZ) && Math.abs(z - lampZ) < .18)) return false;
  const vehicle = car && carContains(car, x, z, .12)
    ? car : parked.find((item) => carContains(item, x, z, .12));
  return !vehicle || y > 1.54 * vehicle.scale[1] + .12;
}

export function chaseCameraIsClear(x, y, z) {
  const branchEdge = (coastLoop.boundsAt(z)?.right ?? 0) + 1.5;
  return x <= Math.max(promenadeLampX - .25, branchEdge) && cameraIsClear(x, y, z);
}

function carBox({ x, z, rotation, scale }) {
  return { x, z, cos: Math.cos(rotation), sin: Math.sin(rotation), halfWidth: .95 * scale[0], halfLength: 2.18 * scale[2] };
}

function pedestrianOverlapsCar(car, person) {
  const radius = .40;
  const dx = person.x - car.x;
  const dz = person.z - car.z;
  const lateral = Math.max(0, Math.abs(dx * car.cos - dz * car.sin) - car.halfWidth);
  const longitudinal = Math.max(0, Math.abs(dx * car.sin + dz * car.cos) - car.halfLength);
  return lateral * lateral + longitudinal * longitudinal < radius * radius;
}

export function carTouchesPedestrian(pose, person) {
  return pedestrianOverlapsCar(carBox(pose), person);
}

function projectedRadius(car, x, z) {
  return car.halfWidth * Math.abs(x * car.cos - z * car.sin)
    + car.halfLength * Math.abs(x * car.sin + z * car.cos);
}

function carBoxesOverlap(a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const axes = [[a.cos, -a.sin], [a.sin, a.cos], [b.cos, -b.sin], [b.sin, b.cos]];
  return axes.every(([x, z]) => Math.abs(x * dx + z * dz) < projectedRadius(a, x, z) + projectedRadius(b, x, z));
}

const parkedBoxes = parked.map(carBox);
const landRoadEdge = landCurb.x + landCurb.width / 2;
const sidewalkBox = {
  x: (turnaround.edge + landRoadEdge) / 2,
  z: (turnaround.entrance + streetStart) / 2,
  cos: 1,
  sin: 0,
  halfWidth: (landRoadEdge - turnaround.edge) / 2,
  halfLength: (streetStart - turnaround.entrance) / 2,
};

function contactSide(car, x, z) {
  const dx = x - car.x;
  const dz = z - car.z;
  const lateral = (dx * car.cos - dz * car.sin) / car.halfWidth;
  const longitudinal = (dx * car.sin + dz * car.cos) / car.halfLength;
  if (Math.abs(lateral) >= Math.abs(longitudinal)) return lateral < 0 ? '左侧' : '右侧';
  return longitudinal < 0 ? '车头' : '车尾';
}

export function drivingObstruction(pose, pedestrians) {
  const car = carBox(pose);
  const width = projectedRadius(car, 1, 0);
  const length = projectedRadius(car, 0, 1);
  const curb = (x, z) => ({ kind: 'curb', side: contactSide(car, x, z) });
  if (car.z - length < endWallFace) return { kind: 'street-end' };
  if (car.z + length > limits.maxZ + .60) return { kind: 'street-start' };
  if (car.x - width < turnaround.edge + .05) return curb(turnaround.edge, car.z);
  if (car.x - width < landRoadEdge && car.z + length > turnaround.entrance
    && carBoxesOverlap(car, sidewalkBox)) {
    return curb(Math.min(landRoadEdge, car.x), Math.max(turnaround.entrance, car.z));
  }
  if (car.x + width > promenadeRoadEdge) {
    const edge = coastLoop.boundaries.find((section) => section.minZ < car.z + length
      && section.maxZ > car.z - length && section.minX < car.x + width
      && section.maxX > car.x - width && carBoxesOverlap(car, section));
    if (edge) {
      const along = THREE.MathUtils.clamp((car.x - edge.x) * edge.sin + (car.z - edge.z) * edge.cos,
        -edge.halfLength, edge.halfLength);
      return curb(edge.x + along * edge.sin, edge.z + along * edge.cos);
    }
    if (car.x > promenadeRoadEdge && !coastLoop.contains(car.x, car.z)) {
      const bounds = coastLoop.boundsAt(car.z);
      return curb(bounds && car.x > bounds.right ? bounds.right : promenadeRoadEdge, car.z);
    }
  }
  const parkedCar = parkedBoxes.find((other) => carBoxesOverlap(car, other));
  if (parkedCar) return { kind: 'parked', side: contactSide(car, parkedCar.x, parkedCar.z) };
  const person = pedestrians?.find((pedestrian) => pedestrianOverlapsCar(car, pedestrian));
  if (person) return { kind: 'pedestrian', side: contactSide(car, person.x, person.z) };
}

export function canDrive(pose) {
  return !drivingObstruction(pose);
}

export function drivingGuide({ x, z }) {
  if (x > 10 && z < -54 && z >= lookout.far) return '海堤观景台 · 减速靠右停车';
  if (x > 5 && z < -75) return '沿导向线汇回主街';
  if (x < 4.5 && z < -21 && z > -45) return '海堤观景台 · 沿导向线靠右';
  return '';
}

function quad(parent, material, a, b, c, d, repeatX = 1, repeatY = 1) {
  return shape(parent, material, [a, b, c, d], [0, 1, 2, 0, 2, 3],
    [[0, 0], [repeatX, 0], [repeatX, repeatY], [0, repeatY]]);
}

function addRoof(parent, m, width, depth, height, rise, facade) {
  const left = -width / 2 - .24;
  const right = width / 2 + .24;
  const front = .26;
  const back = -depth - .23;
  const ridge = -depth * .48;
  quad(parent, m.slate, [left, height, front], [right, height, front], [right, height + rise, ridge],
    [left, height + rise, ridge], width / 3, depth / 5);
  quad(parent, m.slate, [right, height, back], [left, height, back], [left, height + rise, ridge],
    [right, height + rise, ridge], width / 3, depth / 5);
  for (const dir of [-1, 1]) {
    const x = width / 2 * dir;
    const points = [[x, height - .035, 0], [x, height - .035, -depth], [x, height + rise - .04, ridge]];
    shape(parent, facade, points, dir > 0 ? [0, 1, 2] : [0, 2, 1], [[0, 0], [depth, 0], [depth / 2, rise]]);
    bar(parent, m.darkTrim, [x + dir * .09, height, front], [x + dir * .09, height + rise, ridge], .033);
    bar(parent, m.darkTrim, [x + dir * .09, height + rise, ridge], [x + dir * .09, height, back], .033);
  }
  box(parent, m.lightTrim, 0, height - .11, .028, width + .21, .12, .15);
  bar(parent, m.pipes, [left, height - .075, front], [right, height - .075, front], .045);
  bar(parent, m.darkTrim, [left, height + rise, ridge], [right, height + rise, ridge], .061);
  const chimney = shade(m.plaster, '#b3a58d');
  box(parent, chimney, -width * .27, height + rise + .11, ridge - .46, .67, 1.45, .73, 1);
  box(parent, m.stone, -width * .27, height + rise + .81, ridge - .46, .78, .10, .85, 1);
  for (const offset of [-.18, .18]) {
    bar(parent, m.darkTrim, [-width * .27 + offset, height + rise + .85, ridge - .46],
      [-width * .27 + offset, height + rise + 1.12, ridge - .46], .075, .085);
  }
}

function sash(parent, m, x, y, w, h, variant = 0) {
  const trim = variant === 3 ? m.darkTrim : m.paintedWood;
  box(parent, m.lightTrim, x, y, .035, w + .17, h + .18, .072);
  box(parent, m.darkTrim, x, y, .073, w + .025, h + .036, .028);
  box(parent, variant % 3 === 1 ? m.paleGlass : m.glass, x, y, .09, w - .065, h - .065, .016);
  if (variant % 3 === 2) {
    box(parent, m.interior, x - w * .29, y - h * .05, .105, w * .22, h * .83, .008);
  }
  for (const side of [-1, 1]) {
    box(parent, trim, x + side * (w / 2 - .025), y, .12, .048, h, .04);
    box(parent, trim, x, y + side * (h / 2 - .022), .12, w, .051, .04);
  }
  box(parent, trim, x, y + .032, .126, w, .035, .035);
  box(parent, trim, x, y, .122, .027, h, .027);
  box(parent, trim, x, y + h * .25, .122, w, .021, .027);
  box(parent, m.lightTrim, x, y - h / 2 - .06, .104, w + .20, .071, .23);
}

function door(parent, m, x, base, paint, width = doorstep.doorWidth, top = 2.08) {
  box(parent, m.stone, x, base + doorstep.y, doorstep.z, width + doorstep.extraWidth, doorstep.height, doorstep.depth, 1.3);
  box(parent, m.lightTrim, x, base + top / 2 + .08, .054, width + .19, top + .17, .112);
  box(parent, paint, x, base + top / 2 + .09, .122, width, top, .036);
  box(parent, m.glass, x, base + 1.72, .147, width * .68, .44, .016);
  for (const dir of [-1, 1]) {
    box(parent, m.darkTrim, x + dir * width * .17, base + 1.72, .16, .035, .46, .012);
    box(parent, m.darkTrim, x + dir * width * .19, base + .66, .148, width * .31, .64, .023);
  }
  box(parent, m.brass, x + width * .35, base + 1.01, .174, .055, .06, .058);
}

function shopSign(label, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 80;
  const context = canvas.getContext('2d');
  context.fillStyle = color;
  context.fillRect(0, 0, 512, 80);
  context.strokeStyle = '#ddd3b77a';
  context.lineWidth = 2;
  context.strokeRect(9, 8, 494, 64);
  context.fillStyle = '#dcd6c1';
  context.font = '500 34px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, 256, 41, 455);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map, roughness: .89 });
}

function addHarbourArchive(parent, m) {
  const { x, z, photo } = harbourArchive;
  const frame = m.plain('#46554b', .88);
  const mount = m.plain('#c7bca2', .94);
  box(parent, frame, x, 1.55, z, .17, .73, .86);
  box(parent, mount, x + .084, 1.55, z, .02, .62, .74);
  box(parent, shopSign('BAY ARCHIVE', '#46554b'), x + .094, 1.783, z, .015, .105, .67, 0, false);
  const texture = new THREE.TextureLoader().load(import.meta.env.BASE_URL + photo);
  texture.colorSpace = THREE.SRGBColorSpace;
  const print = new THREE.MeshStandardMaterial({ map: texture, color: '#e1d6bd', roughness: .91 });
  mesh(parent, new THREE.PlaneGeometry(.67, .34), print, x + .097, 1.515, z, false).rotation.y = Math.PI / 2;
}

function shopWindow(parent, m, x, width) {
  const height = 1.62;
  const floor = .73;
  const trim = shade(m.plaster, '#7d8276');
  const interior = m.plain('#686056', .88);
  const shelf = m.plain('#534d43', .93);
  const displayGlass = new THREE.MeshPhysicalMaterial({
    color: '#a1afa8', roughness: .21, metalness: .25, transparent: true, opacity: .36,
    depthWrite: false, side: THREE.DoubleSide,
  });
  const goods = ['#aa9071', '#7f8f83', '#b5a999', '#756c5d'].map((color) => m.plain(color, .9));
  box(parent, interior, x, floor + height / 2, .029, width, height, .056);
  box(parent, shelf, x, floor + .28, .135, width - .1, .034, .168);
  box(parent, shelf, x, floor + .71, .108, width - .14, .030, .13);
  for (let index = 0; index < 9; index++) {
    const xx = x + (index % 5 - 2) * width * .16;
    const y = floor + (index < 5 ? .38 : .80);
    box(parent, goods[index % goods.length], xx, y, .143, .095 + (index % 3) * .04,
      .13 + (index % 2) * .061, .079);
  }
  for (const side of [-1, 1]) {
    box(parent, trim, x + side * width / 2, floor + height / 2, .137, .08, height + .10, .24, 1);
    box(parent, m.darkTrim, x, floor + height / 2 + side * height / 2, .187, width, .071, .14);
  }
  box(parent, m.darkTrim, x, floor + height / 2, .243, .042, height, .032);
  box(parent, m.darkTrim, x, floor + 1.16, .244, width, .046, .03);
  const pane = quad(parent, displayGlass, [x - width / 2 + .02, floor, .237],
    [x + width / 2 - .02, floor, .237], [x + width / 2 - .02, floor + height, .237],
    [x - width / 2 + .02, floor + height, .237]);
  pane.renderOrder = 4;
  box(parent, trim, x, .47, .11, width, .49, .20, 1);
  box(parent, m.stone, x, floor - .05, .192, width + .16, .08, .33, 1.3);
}

function addPlanters(parent, m) {
  const clay = m.plain('#686451', .94);
  const soil = m.plain('#493f30', .98);
  const blades = ['#636c49', '#747d53', '#8b895a'].map((color) => {
    const material = m.plain(color, .94);
    material.side = THREE.DoubleSide;
    return material;
  });
  const random = seededRandom(230);
  for (const { x, z } of planters) {
    const pot = group(parent, x, .135, z);
    mesh(pot, new THREE.CylinderGeometry(.225, .177, .40, 16), clay, 0, .20, 0);
    mesh(pot, new THREE.CylinderGeometry(.244, .244, .048, 16), clay, 0, .402, 0);
    mesh(pot, new THREE.CylinderGeometry(.215, .215, .018, 20), soil, 0, .433, 0);
    for (let index = 0; index < 31; index++) {
      const angle = random() * Math.PI * 2;
      const radius = random() * .17;
      const dx = Math.cos(angle);
      const dz = Math.sin(angle);
      const reach = .12 + random() * .24;
      const height = .22 + random() * .34;
      const root = [dx * radius, .44, dz * radius];
      const middle = [root[0] + dx * reach * .43, .44 + height * .73, root[2] + dz * reach * .43];
      const tip = [root[0] + dx * reach, .44 + height, root[2] + dz * reach];
      shape(pot, blades[index % blades.length], [root, [middle[0] - dz * .018, middle[1], middle[2] + dx * .018],
        tip, [middle[0] + dz * .018, middle[1], middle[2] - dx * .018]],
      [0, 1, 3, 1, 2, 3], [[.5, 0], [0, .6], [.5, 1], [1, .6]], false);
    }
  }
}

function balcony(parent, m, x, y) {
  box(parent, m.stone, x, y, .48, 2.18, .16, 1.04, 1.2);
  for (const side of [-1, 1]) {
    box(parent, m.stone, x + side * .79, y - .26, .27, .14, .49, .44, 1.2);
    bar(parent, m.iron, [x + side, y + .93, .10], [x + side, y + .93, .96], .022);
  }
  bar(parent, m.iron, [x - 1, y + .93, .96], [x + 1, y + .93, .96], .021);
  bar(parent, m.iron, [x - 1, y + .19, .96], [x + 1, y + .19, .96], .017);
  for (let i = 0; i <= 13; i++) {
    const xx = x - 1 + i * (2 / 13);
    bar(parent, m.iron, [xx, y + .09, .96], [xx, y + .93, .96], .008, .008, 6);
  }
}

function addBuilding(parent, m, spec) {
  const { x, z, width, depth, stories, color, shop } = spec;
  const house = group(parent, x, houseBase, z, Math.PI / 2);
  const plaster = shade(m.plaster, color);
  const height = 2.93 * stories + .16;
  box(house, plaster, 0, height / 2, -depth / 2, width, height, depth, 1);
  box(house, m.stone, 0, .265, -depth / 2, width + .07, .53, depth + .094, 2.1);
  addRoof(house, m, width, depth, height, spec.roof, plaster);
  const columns = spec.columns ?? 3;
  for (let i = 0; i < columns; i++) {
    const xx = (i + .5) * width / columns - width / 2;
    for (let level = 1; level < stories; level++) {
      sash(house, m, xx, 1.52 + level * 2.93, spec.upperWidth ?? 1.00, 1.48, (i + level) % 4);
    }
    if (shop && i > 0) {
      shopWindow(house, m, xx, Math.min(width / columns - .55, 2.12));
    } else if (i === (shop ? 0 : Math.floor(columns / 2))) {
      door(house, m, xx, 0, m.plain(spec.door ?? '#4a534e', .72));
    } else {
      sash(house, m, xx, 1.51, 1.22, 1.55, (i + 2) % 4);
    }
  }
  for (let level = 1; level < stories; level++) {
    box(house, m.lightTrim, 0, level * 2.93 - .015, .039, width + .08, .064, .12);
  }
  if (shop) {
    box(house, shopSign(shop, '#3a4b48'), 0, 2.71, .12, width - .47, .47, .13);
    box(house, m.darkTrim, 0, 2.94, .185, width - .28, .085, .29);
    box(house, m.lightTrim, 0, 2.43, .10, width - .40, .056, .21);
  }
  if (spec.balcony) balcony(house, m, 0, 3.40);
  if (spec.endWindows) {
    const end = group(house, -width / 2, 0, 0, -Math.PI / 2);
    for (const offset of [-2.05, -4.85]) {
      sash(end, m, offset, 1.65, 1.13, 1.53, 2);
      if (stories > 1) sash(end, m, offset, 4.43, 1.02, 1.41, 0);
      if (stories > 2) sash(end, m, offset, 7.34, .93, 1.30, 1);
    }
  }
  for (const side of [-1, 1]) {
    const edge = side * (width / 2 - .19);
    curvedBar(house, m.pipes, [[edge, height - .07, .22], [edge, height - .18, .16],
      [edge, height - .31, .108], [edge, .57, .108], [edge - side * .05, .31, .14]], .029, 20);
    if (spec.quoins) {
      for (let course = 0; course < Math.floor(height / .43); course++) {
        const span = course % 2 === 0 ? .31 : .18;
        box(house, m.lightTrim, side * (width / 2 - span / 2 + .008), .255 + .43 * course,
          .018, span, .35, .042);
      }
    }
  }
}

function addRoadAndPaths(parent, m) {
  const roadZ = (streetStart + streetEnd) / 2;
  const length = streetStart - streetEnd;
  const sidewalkZ = (streetStart + turnaround.entrance) / 2;
  const sidewalkLength = streetStart - turnaround.entrance;
  const verge = m.plain('#727b65', .98);
  box(parent, verge, -39.4, -.21, roadZ, 69.2, .40, length, 0, false);
  box(parent, m.asphalt, -.195, -.074, roadZ, 7.63, .15, length, 2.3, false);
  box(parent, m.pavers, -5.53, .047, sidewalkZ, 3.04, .17, sidewalkLength, 2, false);
  box(parent, m.stone, -7.52, -.085, sidewalkZ, .44, .34, sidewalkLength, 2.1, false);
  const promenade = coastLoop.promenadeSections(streetEnd, streetStart);
  for (const [from, to] of promenade) {
    box(parent, m.pavers, 6.09, .134, (from + to) / 2, 3.06, .212, to - from, 2, false);
    box(parent, m.stone, 7.566, -.61, (from + to) / 2, .34, 1.69, to - from, 2.1);
  }
  for (const [from, to] of coastLoop.gaps) {
    box(parent, m.stone, promenadeGap.x, -.67, (from + to) / 2, promenadeGap.width, 1.34, to - from, 2.1);
    box(parent, m.pavers, promenadeGap.x, -.038, (from + to) / 2, promenadeGap.width, .078, to - from, 2, false);
  }
  const { left, right, top, length: rampLength } = junctionRamp;
  const bottom = top - rampLength;
  quad(parent, m.pavers, [left, .24, top], [right, .24, top],
    [right, .003, bottom], [left, .003, bottom], (right - left) / 2, rampLength / 2);
  shape(parent, m.stone, [[left, .002, top], [left, .24, top], [left, .003, bottom],
    [right, .002, top], [right, .24, top], [right, .003, bottom]], [0, 1, 2, 3, 5, 4],
  [[0, 0], [0, .12], [.65, 0], [0, 0], [0, .12], [.65, 0]], false);
  const curbs = ['#c8c4b6', '#b9b7ac', '#c4c2b8', '#c9c4b8'].map((color) => shade(m.stone, color));
  for (let i = 0, z = 10; z > turnaround.entrance + .48; i++, z -= .998) {
    box(parent, curbs[i % curbs.length], landCurb.x, .065, z, landCurb.width, .144, .985, 2.1);
  }
  const bankEdges = [streetEnd, ...ramps.flat(), streetStart];
  const bankSections = [];
  for (let index = 0; index < bankEdges.length; index += 2) {
    bankSections.push(...coastLoop.promenadeSections(bankEdges[index], bankEdges[index + 1]));
  }
  for (const [left, right] of bankSections) {
    const length = right - left;
    const center = (left + right) / 2;
    box(parent, m.pavers, 4.27, .134, center, .58, .212, length, 2, false);
    box(parent, m.stone, promenadeWall.x, .205, center, promenadeWall.width, .422, length, 2.1);
    for (let index = 0; index < Math.ceil(length / 1.17); index++) {
      const z = left + index * 1.17;
      const width = Math.min(1.17, right - z);
      box(parent, curbs[index % curbs.length], promenadeWall.x, .435, z + width / 2, promenadeWall.capWidth, .085, width - .014, 2.1);
    }
  }
  const rampPavers = shade(m.pavers, '#b9b4a8');
  for (const [from, to] of ramps) {
    for (const [start, end] of coastLoop.promenadeSections(from, to)) {
      for (let i = 0; i < rampStrips; i++) {
        const a = rampStart + rampStripWidth * i;
        const b = a + rampStripWidth;
        quad(parent, rampPavers, [a, rampHeight(a), end],
          [b, rampHeight(b), end], [b, rampHeight(b), start],
          [a, rampHeight(a), start], .1, (end - start) / 2);
      }
    }
  }
  for (const x of [3.295, 3.436]) {
    for (const [from, to] of promenade) {
      box(parent, m.yellowPaint, x, .005, (from + to) / 2, .054, .003, to - from - .08, 0, false);
    }
  }
  for (const x of [-3.67, -3.81]) {
    box(parent, m.yellowPaint, x, .005, sidewalkZ, .054, .003, sidewalkLength - .9, 0, false);
  }
  for (const z of [-.6, -8.6, -15.45, -22.2, -30.5, -38.3, -46.2, -54.5,
    -62.1, -70.2, -78.5, -86.4, -94.5, -102.2]) {
    box(parent, m.lightPaint, -1.91, .006, z, .052, .004, 1.28, 0, false);
  }
  for (const z of [2.0, -10.1, -23.5, -38.8, -55.1, -72.6, -87.4, -103.4]) {
    box(parent, m.drain, -3.78, .009, z, .27, .019, .44);
    for (let i = 0; i < 8; i++) {
      box(parent, m.rim, -3.78, .021, z - .18 + i * .048, .233, .008, .013);
    }
  }
  const manhole = mesh(parent, new THREE.CylinderGeometry(.28, .28, .012, 36),
    m.drain, .2, .008, -7.25, false);
  manhole.receiveShadow = true;
  for (let step = 1; step <= 3; step++) {
    mesh(parent, new THREE.TorusGeometry(.065 * step, .006, 4, 24), m.pipes, .2, .016, -7.25, false)
      .rotation.x = -Math.PI / 2;
  }
  const repairs = shade(m.asphalt, '#a0acb1');
  for (const [x, z, width, depth] of [[1.08, -3.7, .77, 1.43], [-.8, -15.71, .63, 2.3], [2.66, -20.83, .47, .81],
    [-2.47, -45.2, .56, 2.4], [.48, -65.36, 1.12, 1.3], [-.52, -83.47, .77, 2.1], [1.3, -101.47, .49, 1.8]]) {
    const corners = [[x, .003, z + depth], [x + width, .003, z + depth - .08],
      [x + width - .045, .003, z + .12], [x + .075, .003, z]];
    shape(parent, repairs, corners, [0, 1, 2, 0, 2, 3],
      corners.map(([xx, , zz]) => [xx / 2.3, zz / 2.3]), false);
  }
}

function addTurnaround(parent, m) {
  const { entrance, edge, wallWidth } = turnaround;
  const curb = -4.01;
  const leftWidth = curb - edge;
  const depth = entrance - streetEnd;
  const centerZ = (entrance + streetEnd) / 2;
  box(parent, m.asphalt, (edge + curb) / 2, -.074, centerZ, leftWidth, .15, depth, 2.3, false);
  box(parent, m.stone, (edge + curb) / 2, .034, entrance + .12, leftWidth, .085, .24, 2.1);
  box(parent, m.stone, edge - wallWidth / 2, .26, centerZ, wallWidth, .55, depth, 2.1);
  box(parent, m.lightTrim, edge - wallWidth / 2, .56, centerZ, wallWidth + .09, .076, depth);
  const endWidth = limits.maxX + .22 - edge;
  const wallX = edge + endWidth / 2;
  const wallZ = streetEnd + wallWidth / 2;
  box(parent, m.stone, wallX, .29, wallZ, endWidth, .70, wallWidth, 2.1);
  box(parent, m.lightTrim, wallX, .67, wallZ, endWidth + .08, .075, wallWidth + .06);
  box(parent, m.iron, 1.92, .90, wallZ, .046, .56, .055);
  box(parent, shopSign('TURNING AREA', '#47514b'), 1.92, 1.12, wallZ + .03, 1.43, .24, .064);
}

function addRailAndStreetFurniture(parent, m) {
  const deck = .24;
  for (let z = 10; z >= streetEnd; z -= 1.81) {
    if (coastLoop.promenadeOpen(z)) continue;
    bar(parent, m.iron, [7.59, deck + .01, z], [7.59, deck + 1.08, z], .031, .024);
    mesh(parent, new THREE.SphereGeometry(.035, 8, 6), m.iron, 7.59, deck + 1.08, z);
  }
  for (const y of [.405, .724, 1.03]) {
    for (const [from, to] of coastLoop.promenadeSections(streetEnd, 10.2)) {
      bar(parent, m.iron, [7.59, deck + y, from], [7.59, deck + y, to], .017, .017, 8);
    }
  }
  for (const z of promenadeLamps) {
    if (!coastLoop.promenadeOpen(z)) addStreetLamp(parent, m, promenadeLampX, deck, z);
  }
  for (const [x, z] of benches) {
    if (!coastLoop.promenadeOpen(z)) addBench(parent, m, x, deck, z);
  }
  for (const [from, to] of ramps) {
    for (const z of [from - .12, to + .12]) {
      if (coastLoop.promenadeOpen(z)) continue;
      bar(parent, m.iron, [4.22, deck, z], [4.22, deck + .82, z], .049, .034);
      mesh(parent, new THREE.SphereGeometry(.038, 10, 6), m.iron, 4.22, deck + .81, z);
    }
  }
  const bin = m.plain('#3c4b44', .86);
  for (const z of [-14.01, -37.14]) {
    if (coastLoop.promenadeOpen(z)) continue;
    const x = 4.76;
    bar(parent, bin, [x, deck + .02, z], [x, deck + .82, z], .23, .26, 12);
    box(parent, m.iron, x, deck + .83, z, .52, .086, .49);
    box(parent, m.drain, x - .22, deck + .715, z, .075, .104, .265);
  }
}

const buildings = [
    { x: -6.75, z: 4.8, width: 5.4, depth: 6.2, stories: 2, roof: 1.2, color: '#a89f8c', door: '#46514c', endWindows: true, quoins: true },
    { x: -6.95, z: -4.30, width: 10.06, depth: 8.2, stories: 3, roof: 1.76, color: '#ece0c6', endWindows: true, balcony: true, quoins: true },
    { x: -6.65, z: -13.86, width: 8.7, depth: 7.25, stories: 2, roof: 1.64, color: '#bec4bf', shop: 'COVE STORES', door: '#4b6259', endWindows: false },
    { x: -6.87, z: -22.65, width: 8.18, depth: 7.4, stories: 3, roof: 1.57, color: '#ddd8c5', door: '#53665c', upperWidth: .88, quoins: true },
    { x: -6.58, z: -31.20, width: 8.11, depth: 7.2, stories: 3, roof: 1.7, color: '#cbbaa5', door: '#55504c' },
    { x: -7.08, z: -39.82, width: 8.42, depth: 7.0, stories: 2, roof: 1.72, color: '#d2c7ae', shop: 'HARBOUR OFFICE', door: '#5c655d' },
    { x: -7.02, z: -49.40, width: 9.4, depth: 8.0, stories: 3, roof: 1.3, color: '#c9c9c1' },
    { x: -7.05, z: -60.19, width: 10.5, depth: 7.6, stories: 3, roof: 1.45, color: '#cac4b1', columns: 4 },
    { x: -7.37, z: -70.53, width: 9.9, depth: 9.1, stories: 2, roof: 1.53, color: '#ddd8c5' },
    { x: -7.20, z: -80.55, width: 9.65, depth: 6.9, stories: 3, roof: 1.19, color: '#c8bfab' },
    { x: -7.15, z: -91.14, width: 9.8, depth: 7.6, stories: 3, roof: 1.50, color: '#d4ccc0' },
    { x: -7.72, z: -101.86, width: 10.0, depth: 8.0, stories: 2, roof: 1.60, color: '#bfc3bd' },
];

const doorwaySteps = buildings.map(({ x, z, width, shop, columns = 3 }) => {
  const column = shop ? 0 : Math.floor(columns / 2);
  const offset = (column + .5) * width / columns - width / 2;
  return { x: x + doorstep.z, z: z - offset, halfWidth: (doorstep.doorWidth + doorstep.extraWidth) / 2 };
});

export function addStreet(scene, m) {
  const street = group(scene, 0, 0, 0);
  addRoadAndPaths(street, m);
  addTurnaround(street, m);
  addCoastLoop(street, m, coastLoop, shopSign);
  addRailAndStreetFurniture(street, m);
  addPlanters(street, m);
  for (const building of buildings) addBuilding(street, m, building);
  addHarbourArchive(street, m);
  batchOpaque(street);
}

export function addVehicles(scene, m) {
  const vehicles = group(scene, 0, 0, 0);
  const darkContact = new THREE.MeshBasicMaterial({
    map: shadowTexture(), transparent: true, opacity: .65, depthWrite: false,
  });
  for (const car of parked) addCar(vehicles, m, darkContact, car);
  batchOpaque(vehicles);
  return addCar(scene, m, darkContact, carStart, true);
}

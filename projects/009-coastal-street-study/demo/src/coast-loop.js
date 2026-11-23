import { MathUtils } from 'three';
import { bar, box, shape } from './geometry.js';
import { addBench } from './props.js';

const { lerp, smoothstep } = MathUtils;
const near = -30;
const far = -106;
export const lookout = { near: -59.6, far: -69.6, edge: 19.83, railX: 23.38 };
const lookoutPaving = { left: lookout.edge - .04, right: lookout.railX + .14, height: .004 };
export const lookoutSeat = { x: 21.14, z: -67.1, height: .475, standX: 21.79 };
const seats = [-62.4, lookoutSeat.z];

function loopCenter(z) {
  const depth = -z;
  return .25 + 12.55 * smoothstep(depth, 30, 55) * (1 - smoothstep(depth, 72, -far));
}

function roadWidth(z) {
  const depth = -z;
  const center = loopCenter(z);
  const halfWidth = 3.08 + .30 * (center - .25) / 12.55;
  const parking = smoothstep(depth, 50.8, -lookout.near) * (1 - smoothstep(depth, -lookout.far, 77));
  const mergeRoom = .65 * smoothstep(depth, 70, 78) * (1 - smoothstep(depth, 92, 105));
  return { z, left: center - halfWidth - mergeRoom, right: center + halfWidth + (lookout.edge - 16.18) * parking };
}

function edge(from, to, side) {
  const dx = to[side] - from[side];
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  return {
    x: (from[side] + to[side]) / 2, z: (from.z + to.z) / 2,
    cos: dz / length, sin: dx / length, halfWidth: 0, halfLength: length / 2,
    minX: Math.min(from[side], to[side]), maxX: Math.max(from[side], to[side]),
    minZ: from.z, maxZ: to.z,
  };
}

export function createCoastLoop(mainEdge, streetEnd, streetStart) {
  const samples = Array.from({ length: (near - far) * 2 + 1 }, (_, i) => roadWidth(far + i / 2));
  const rows = [samples[0]];
  for (let i = 1; i < samples.length; i++) {
    const from = samples[i - 1];
    const to = samples[i];
    const crossings = [];
    for (const side of ['left', 'right']) {
      for (const x of [mainEdge, 7.81]) {
        const t = (x - from[side]) / (to[side] - from[side]);
        if (t > 0 && t < 1) crossings.push(t);
      }
    }
    for (const t of [...new Set(crossings)].sort((a, b) => a - b)) {
      rows.push({ z: lerp(from.z, to.z, t), left: lerp(from.left, to.left, t), right: lerp(from.right, to.right, t) });
    }
    rows.push(to);
  }

  const spans = [];
  const boundsAlongMain = (from, to) => edge({ z: from, left: mainEdge }, { z: to, left: mainEdge }, 'left');
  const boundaries = [boundsAlongMain(streetEnd, far), boundsAlongMain(near, streetStart)];
  const gaps = [];
  for (let i = 1; i < rows.length; i++) {
    const from = rows[i - 1];
    const to = rows[i];
    const left = (from.left + to.left) / 2;
    const right = (from.right + to.right) / 2;
    if (right > mainEdge) {
      const outer = edge(from, to, 'right');
      const inner = left > mainEdge ? edge(from, to, 'left') : undefined;
      spans.push({ from, to, outer, inner });
      boundaries.push(outer);
      if (inner) boundaries.push(inner);
    }
    if (right <= mainEdge || left > mainEdge) {
      boundaries.push(boundsAlongMain(from.z, to.z));
    }
    if (right > mainEdge && left < 7.81) {
      const last = gaps.at(-1);
      if (last?.[1] === from.z) last[1] = to.z;
      else gaps.push([from.z, to.z]);
    }
  }

  function boundsAt(z) {
    if (z < far || z > near) return;
    const index = Math.min(samples.length - 2, Math.floor((z - far) * 2));
    const from = samples[index];
    const to = samples[index + 1];
    const t = (z - from.z) * 2;
    return { left: lerp(from.left, to.left, t), right: lerp(from.right, to.right, t) };
  }

  return {
    near, far, spans, boundaries, gaps, mainEdge, boundsAt,
    contains(x, z) {
      const bounds = boundsAt(z);
      return Boolean(bounds && x >= bounds.left && x <= bounds.right);
    },
    promenadeOpen(z) {
      return gaps.some(([a, b]) => z >= a && z <= b);
    },
    promenadeSections(from, to) {
      const sections = [];
      let start = from;
      for (const [a, b] of gaps) {
        if (b <= start || a >= to) continue;
        if (start < a) sections.push([start, a]);
        start = Math.max(start, b);
      }
      if (start < to) sections.push([start, to]);
      return sections;
    },
  };
}

export function onLookout(x, z) {
  return z >= lookout.far && z <= lookout.near && x >= lookout.edge - .06 && x <= lookout.railX - .18;
}

export function lookoutPavingHeight(x, z) {
  if (z >= lookout.far && z <= lookout.near && x >= lookoutPaving.left && x <= lookoutPaving.right) {
    return lookoutPaving.height;
  }
}

export function atLookoutBench(x, z) {
  return Math.abs(x - lookoutSeat.x) < .50 && seats.some((seat) => Math.abs(z - seat) < 1.15);
}

export function canSitAtLookout(x, z) {
  return x >= lookoutSeat.x + .50 && Math.hypot(x - lookoutSeat.standX, z - lookoutSeat.z) <= 1.15;
}

function paintDash(parent, m, x, z, angle, length, width) {
  box(parent, m.lightPaint, x, .010, z, width, .003, length, 0, false).rotation.y = angle;
}

function paintArrow(parent, m, x, z, angle) {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const outline = [[-.115,.64], [.115,.64], [.115,-.10], [.36,-.10],
    [0,-.74], [-.36,-.10], [-.115,-.10]];
  const points = outline.map(([dx,dz]) => [x + dx * cos + dz * sin, .012, z - dx * sin + dz * cos]);
  shape(parent, m.lightPaint, points, [0,1,2, 0,2,6, 5,3,4],
    points.map(([px,,pz]) => [px,pz]), false);
}

function addGuides(parent, m) {
  for (let z = -25.5; z >= -101; z -= 3.35) {
    const angle = Math.atan2(loopCenter(z + .5) - loopCenter(z - .5), 1);
    paintDash(parent, m, loopCenter(z), z, angle, 1.33, .085);
  }
  paintArrow(parent, m, 1.44, -31, -.48);
  paintArrow(parent, m, 14.45, -54.6, -.50);
  paintArrow(parent, m, loopCenter(-91), -91, .50);
  for (const [z,x,angle] of [[-56.2,15.6,-.58],[-58.0,16.8,-.59],[-60.0,18.0,-.35]]) {
    paintDash(parent, m, x, z, angle, .80, .08);
  }
}

function roadStrip(parent, material, from, to, mainEdge) {
  const points = [
    [Math.max(mainEdge, from.left), .003, from.z],
    [Math.max(mainEdge, to.left), .003, to.z],
    [to.right, .003, to.z], [from.right, .003, from.z],
  ];
  shape(parent, material, points, [0, 1, 2, 0, 2, 3],
    points.map(([x, , z]) => [x / 2.3, z / 2.3]), false);
}

function roadSide(parent, m, edge, cap) {
  const length = edge.halfLength * 2;
  const angle = Math.atan2(edge.sin, edge.cos);
  box(parent, m.stone, edge.x, -.82, edge.z, .18, 1.64, length + .025, 1.8, false).rotation.y = angle;
  if (cap) box(parent, m.lightTrim, edge.x, .035, edge.z, .11, .069, length + .02).rotation.y = angle;
}

export function addCoastLoop(parent, m, loop, signMaterial) {
  for (const { from, to, outer, inner } of loop.spans) {
    roadStrip(parent, m.asphalt, from, to, loop.mainEdge);
    const onDeck = outer.z >= lookout.far && outer.z <= lookout.near;
    roadSide(parent, m, outer, !onDeck);
    if (inner) roadSide(parent, m, inner, true);
  }

  const deckZ = (lookout.far + lookout.near) / 2;
  const deckWidth = lookout.railX + .13 - lookout.edge;
  const deckLength = lookout.near - lookout.far;
  box(parent, m.stone, lookout.edge + deckWidth / 2, -.83, deckZ, deckWidth, 1.64, deckLength, 1.8);
  const { left, right, height } = lookoutPaving;
  box(parent, m.pavers, (left + right) / 2, height - .025, deckZ, right - left, .05, deckLength, 1.7, false);
  for (const z of seats) addBench(parent, m, lookoutSeat.x, height, z);
  for (const height of [.35, .70, 1.02]) {
    bar(parent, m.iron, [lookout.railX, height, lookout.far], [lookout.railX, height, lookout.near], .018);
    for (const z of [lookout.far, lookout.near]) {
      bar(parent, m.iron, [lookout.edge, height, z], [lookout.railX, height, z], .018);
    }
  }
  for (let i = 0; i <= 6; i++) {
    const z = lerp(lookout.far, lookout.near, i / 6);
    bar(parent, m.iron, [lookout.railX, 0, z], [lookout.railX, 1.08, z], .028);
  }
  for (const z of [lookout.far, lookout.near]) {
    bar(parent, m.iron, [lookout.edge, 0, z], [lookout.edge, 1.08, z], .028);
  }
  for (const z of [-60.2, -64.6, -69]) {
    box(parent, m.lightPaint, 18.04, .008, z, 2.75, .004, .057, 0, false);
  }
  box(parent, m.lightPaint, 16.67, .008, -64.6, .057, .004, 8.8, 0, false);
  addGuides(parent, m);

  for (const [x, z, label] of [
    [4.64, -32.2, 'SCENIC LOOKOUT  →'],
    [21.86, -64.8, 'SEAFRONT LOOKOUT'],
  ]) {
    bar(parent, m.iron, [x, 0, z], [x, 1.60, z], .026);
    box(parent, signMaterial(label, '#465951'), x, 1.45, z, 1.55, .28, .065);
  }
}

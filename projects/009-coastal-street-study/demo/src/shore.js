import * as THREE from 'three';
import { addFishingBoat } from './fishing-boat.js';
import { addSeagulls } from './seagulls.js';
import { mesh, seededRandom, shape } from './geometry.js';
import { addSeaSurface, seaLevel, waterlineOf } from './sea-surface.js';
import { seawardWalls, streetEnd } from './street.js';

export const reefMark = { x: 47.1, z: -91.9 };

function washedMaterial(material, time, phase, reach) {
  const surface = material.clone();
  surface.onBeforeCompile = (shader) => {
    shader.uniforms.washTime = time;
    shader.uniforms.washPhase = { value: phase };
    shader.uniforms.washReach = { value: reach };
    shader.vertexShader = 'varying vec3 washPosition;\n' + shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nwashPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = `
      varying vec3 washPosition;
      uniform float washTime, washPhase, washReach;
      float washHash(vec2 p) {
        vec3 v = fract(p.xyx * .1031);
        v += dot(v, v.yzx + 33.33);
        return fract((v.x + v.y) * v.z);
      }
      float washNoise(vec2 p) {
        vec2 cell = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(washHash(cell), washHash(cell + vec2(1, 0)), f.x),
          mix(washHash(cell + vec2(0, 1)), washHash(cell + vec2(1, 1)), f.x), f.y);
      }
    ` + shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec2 washP = washPosition.xz;
      float heightOverWater = washPosition.y - (${seaLevel});
      float washClock = washTime * .444 + sin(washP.y * .76) * .09
        + sin(washP.y * 1.83 + washP.x * .46) * .043 + washPhase;
      float washAge = fract(washClock - .72);
      float surge = smoothstep(.0, .044, washAge) * (1.0 - smoothstep(.074, .21, washAge));
      float skin = washNoise(washP * vec2(7.3, 12.1) + vec2(washTime * .8, washTime * -.47));
      float damp = 1.0 - smoothstep(.025, .33, heightOverWater + skin * .061);
      diffuseColor.rgb *= 1.0 - damp * .34;
      float washHeight = surge * washReach;
      float whiteWater = (1.0 - smoothstep(.013 + washHeight * .42, .035 + washHeight, heightOverWater))
        * smoothstep(.29, .90, skin) * surge;
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.58, .63, .60), whiteWater * .58);
    `);
  };
  return surface;
}

function addReef(scene, m, time) {
  const rock = washedMaterial(m.cliff, time, .16, .24);
  rock.color.set('#8d9187');
  const stones = [
    [-5.9, .39, 3.5, 2.45, .61, 1.31], [-3.8, .49, 1.9, 2.3, .72, 1.6],
    [-.7, .63, .38, 3.25, .97, 1.8], [1.7, .43, -2.1, 2.82, .65, 1.54],
    [3.05, .29, -4.0, 2.11, .49, 1.04], [-2.25, .15, -2.26, 1.95, .42, 1.19],
    [4.95, .11, -4.8, 1.29, .28, .89], [-6.8, .12, 5.66, .89, .40, .61],
  ];
  const pieces = stones.map(([x, height, z, sx, sy, sz], index) => {
    const geometry = new THREE.IcosahedronGeometry(1, 2);
    const points = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < points.count; i++) {
      const a = points.getX(i), b = points.getY(i), c = points.getZ(i);
      const warp = 1 + .14 * Math.sin(a * 6 + b * 3 - c * 5 + index)
        + .09 * Math.cos(b * 9 + c * 4 + index * 2);
      const foot = 1 + Math.max(0, -b) * .20;
      points.setXYZ(i, (a * warp + b * .16) * sx * foot,
        b * warp * sy * (b < 0 ? 1.65 : 1) + a * .16, (c * warp + a * .19) * sz * foot);
      uv.setXY(i, (a * sx + c * sz * .39) * .72, (c * sz * .67 + b * sy) * .94);
    }
    geometry.computeVertexNormals();
    const stone = mesh(scene, geometry, rock, reefMark.x + x, seaLevel + height * .66, reefMark.z + z, false);
    stone.rotation.y = -.24 + index * .37;
    return stone;
  });

  const { x, z } = reefMark;
  const concrete = m.plain('#a9a99b', .96);
  const paint = m.plain('#d4d6c7', .76);
  const rustRed = m.plain('#813d31', .74);
  const pedestal = seaLevel + 1.21;
  mesh(scene, new THREE.CylinderGeometry(.37, .50, .40, 8), concrete, x, pedestal - .16, z, false);
  mesh(scene, new THREE.CylinderGeometry(.27, .39, 1.70, 10), paint, x, pedestal + .78, z, false);
  mesh(scene, new THREE.CylinderGeometry(.39, .35, .20, 10), rustRed, x, pedestal + 1.68, z, false);
  mesh(scene, new THREE.CylinderGeometry(.25, .32, .35, 10), rustRed, x, pedestal + 1.87, z, false);
  mesh(scene, new THREE.ConeGeometry(.39, .24, 10), m.iron, x, pedestal + 2.14, z, false);
  return pieces;
}

function addBeach(scene, m, time) {
  const positions = [];
  const uv = [];
  const indices = [];
  const edges = [[7.57, -.93], [8.0, -.94], [9.25, -.995], [11.30, -1.099], [13.05, -1.29],
    [15.05, -1.51], [18.2, -2.0]];
  const rows = Math.ceil((11 - streetEnd + 21) / 1.7);
  for (let j = 0; j <= rows; j++) {
    const z = 11 - j * 1.7;
    const offset = Math.sin(z * .106) * .37 + Math.cos(z * .29) * .14;
    for (let i = 0; i < edges.length; i++) {
      const [x, y] = edges[i];
      const xx = x + offset * i / edges.length;
      positions.push([xx, y + Math.sin(z * .28 + i * .39) * .025, z]);
      uv.push([xx * .67, z * .67]);
      if (j && i) {
        const index = j * edges.length + i;
        indices.push(index - edges.length - 1, index - edges.length, index - 1,
          index - edges.length, index, index - 1);
      }
    }
  }
  const bank = shape(scene, washedMaterial(m.pebbles, time, 0, .070), positions, indices, uv, false);

  const random = seededRandom(52);
  const beachLength = 5 - streetEnd;
  for (let i = 0; i < Math.round(beachLength * .46); i++) {
    const x = 8.20 + random() * 4.05;
    const z = 5 - random() * beachLength;
    const stone = mesh(scene, new THREE.IcosahedronGeometry(1, 1), m.cliff, x, -1.06, z, false);
    const size = .039 + random() * .16;
    stone.scale.set(size * 1.23, size * .55, size);
    stone.rotation.y = random() * Math.PI;
  }
  return bank;
}

function addHeadlandFoot(scene, m) {
  const positions = [];
  const uv = [];
  const colors = [];
  const indices = [];
  const grass = new THREE.Color('#727b65');
  const shingle = new THREE.Color('#928570');
  const tint = new THREE.Color();
  const section = [[-74, .30], [-58, .49], [-38, .24], [-25, .44], [-16, .20], [-9, .25], [-3, .17],
    [1.4, -.05], [4.6, -.36], [6.6, -.67], [7.57, -.89], [9.25, -1.42]];
  for (let row = 0; row <= 31; row++) {
    const depth = row * 1.6 - 3.2;
    const z = streetEnd - depth;
    for (const [column, [x, floor]] of section.entries()) {
      const inland = 1 - THREE.MathUtils.smoothstep(x, -8, 6.5);
      const slope = floor + inland * (.049 * depth + .21 * Math.sin(depth * .43 + x * .63));
      const height = THREE.MathUtils.lerp(Math.min(floor, -.08), slope,
        THREE.MathUtils.smoothstep(depth, 0, 4.8));
      positions.push([x, height, z]);
      uv.push([x / 3.9, z / 3.9]);
      tint.copy(grass).lerp(shingle, THREE.MathUtils.smoothstep(x, -.5, 8.6));
      tint.multiplyScalar(.97 + .052 * Math.sin(x * .54 + depth * .38));
      colors.push(tint.r, tint.g, tint.b);
      if (!row || !column) continue;
      const i = row * section.length + column;
      indices.push(i - section.length - 1, i - section.length, i - 1,
        i - section.length, i, i - 1);
    }
  }
  const foot = shape(scene, cliffMaterial(m), positions, indices, uv, false);
  foot.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return foot;
}

function cliffMaterial(m) {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 1, map: m.cliff.map, normalMap: m.cliff.normalMap,
    normalScale: new THREE.Vector2(.17, .17),
  });
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', [
      'vec3 terrainSample = texture2D(map, vMapUv).rgb;',
      'float textureVariation = dot(terrainSample, vec3(.3, .59, .11));',
      'diffuseColor.rgb *= .74 + textureVariation * .76;',
    ].join('\n'));
  };
  return material;
}

function interpolateProfile(profile, t) {
  const step = Math.min(profile.length - 2, Math.floor(t * (profile.length - 1)));
  const mix = t * (profile.length - 1) - step;
  return profile[step].map((value, column) => THREE.MathUtils.lerp(value, profile[step + 1][column], mix));
}

function addHeadland(scene, m, profile, far = false) {
  const position = [];
  const uv = [];
  const colors = [];
  const elements = [];
  const widthSteps = 49;
  const lengthSteps = profile.length * 9;
  const grass = new THREE.Color(far ? '#727d73' : '#657358');
  const stone = new THREE.Color(far ? '#918f84' : '#9b7760');
  const random = seededRandom(far ? 113 : 67);
  for (let j = 0; j <= lengthSteps; j++) {
    const [z, left, edge, height] = interpolateProfile(profile, j / lengthSteps);
    const relief = THREE.MathUtils.smoothstep(height, 0, 3);
    for (let i = 0; i <= widthSteps; i++) {
      const u = i / widthSteps;
      const ridge = .74 + .043 * Math.sin(z * .064) + .018 * Math.sin(z * .146);
      const x = THREE.MathUtils.lerp(left, edge, u) + Math.sin(z * .20 + u * 12) * .32;
      const drop = THREE.MathUtils.smoothstep(u, ridge, 1);
      const initial = height * (.77 + .21 * Math.sin(u * Math.PI * .93) + Math.sin(z * .099 + u * 9) * .044);
      const floor = THREE.MathUtils.lerp(initial, -2.18, Math.pow(drop, .74));
      const variation = (Math.sin((x + z) * .55) * .22 + Math.cos(z * .53 - u * 45) * .34
        + (random() - .50) * .47) * (1 - Math.pow(drop, 4)) * relief;
      position.push(x, floor + variation, z);
      uv.push((z + x * .43) / 7.6, (floor + x * .18) / 6.2);
      const cover = THREE.MathUtils.smoothstep(u, ridge - .023 + Math.sin(z * .18) * .016, ridge + .15);
      const rockStrata = .90 + .062 * Math.sin(floor * .82 + z * .15) + .041 * Math.cos(floor * 3.6 + x * .93);
      const tint = grass.clone().lerp(stone, cover);
      tint.multiplyScalar((.91 + .11 * random() + Math.sin(u * 37 + z * .23) * .043) * (1 - cover + cover * rockStrata));
      colors.push(tint.r, tint.g, tint.b);
      if (i && j) {
        const vertex = j * (widthSteps + 1) + i;
        elements.push(vertex - widthSteps - 2, vertex - widthSteps - 1, vertex - 1,
          vertex - widthSteps - 1, vertex, vertex - 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(elements);
  geometry.computeVertexNormals();
  mesh(scene, geometry, cliffMaterial(m), 0, 0, 0, false);
}

export function addShore(scene, m, { horizon, sun, sunTint }) {
  addHeadland(scene, m, [[-194, -68, 27, 3], [-230, -88, 59, 15], [-272, -101, 92, 18],
    [-310, -99, 117, 11], [-347, -98, 144, 3]], true);
  addHeadland(scene, m, [[.5, -57, -6.1, -.19], [-5, -57, -5.3, 1.1], [-20, -59, -1.45, 15.5], [-33, -61, 6.3, 28],
    [-49, -66, 15.8, 29.5], [-62, -68, 26.2, 22.3], [-80, -67, 35, 15.2], [-100, -75, 40, 4.2]]
    .map(([z, ...section]) => [streetEnd + z, ...section]));
  const washTime = { value: 0 };
  const hill = addHeadlandFoot(scene, m);
  const beach = addBeach(scene, m, washTime);
  const reef = addReef(scene, m, washTime);
  const boat = addFishingBoat(scene, m, seaLevel);
  const gulls = addSeagulls(scene, reefMark, boat.position, seaLevel);
  const sea = addSeaSurface(scene, {
    bank: [...waterlineOf(beach), ...waterlineOf(hill), ...seawardWalls()],
    reef: reef.flatMap(waterlineOf),
    reefOrigin: new THREE.Vector2(reefMark.x, reefMark.z),
    horizon, sun, sunTint,
    wakePath: boat.wakePath,
    heading: boat.heading,
  });
  return {
    setLight: sea.setLight,
    update(time, dt) {
      washTime.value = time;
      boat.update(dt);
      gulls(dt);
      sea.update(time);
    },
  };
}

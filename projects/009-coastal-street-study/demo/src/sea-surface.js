import * as THREE from 'three';
import { mesh } from './geometry.js';
import { horizonGLSL } from './overcast-sky.js';

export const seaLevel = -1.28;
const contactBounds = { minX: 7, minZ: -163, width: 59, length: 178 };
const contactRange = 7;

export function waterlineOf(object) {
  object.updateWorldMatrix(true, false);
  const { index, attributes: { position } } = object.geometry;
  const count = index?.count ?? position.count;
  const vertices = Array.from({ length: position.count }, (_, i) =>
    new THREE.Vector3().fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld));
  const lines = [];
  for (let i = 0; i < count; i += 3) {
    const indices = index ? [index.getX(i), index.getX(i + 1), index.getX(i + 2)] : [i, i + 1, i + 2];
    const points = [];
    for (let edge = 0; edge < 3; edge++) {
      const a = vertices[indices[edge]];
      const b = vertices[indices[(edge + 1) % 3]];
      if ((a.y > seaLevel) === (b.y > seaLevel)) continue;
      const u = (seaLevel - a.y) / (b.y - a.y);
      points.push([THREE.MathUtils.lerp(a.x, b.x, u), THREE.MathUtils.lerp(a.z, b.z, u)]);
    }
    if (points.length === 2) lines.push(points);
  }
  return lines;
}

function contactTexture(bank, reef) {
  const width = 384;
  const height = 1024;
  const data = new Uint8Array(width * height * 4).fill(255);
  const { minX, minZ, width: spanX, length: spanZ } = contactBounds;
  const cellX = spanX / width;
  const cellZ = spanZ / height;
  function rasterize(lines, channel) {
    for (const [[ax, az], [bx, bz]] of lines) {
      const startX = Math.max(0, Math.floor((Math.min(ax, bx) - contactRange - minX) / cellX));
      const endX = Math.min(width - 1, Math.ceil((Math.max(ax, bx) + contactRange - minX) / cellX));
      const startZ = Math.max(0, Math.floor((Math.min(az, bz) - contactRange - minZ) / cellZ));
      const endZ = Math.min(height - 1, Math.ceil((Math.max(az, bz) + contactRange - minZ) / cellZ));
      const dx = bx - ax, dz = bz - az;
      const stretch = dx * dx + dz * dz;
      if (stretch < 1e-8) continue;
      for (let j = startZ; j <= endZ; j++) {
        const z = minZ + (j + .5) * cellZ - az;
        for (let i = startX; i <= endX; i++) {
          const x = minX + (i + .5) * cellX - ax;
          const nearest = THREE.MathUtils.clamp((x * dx + z * dz) / stretch, 0, 1);
          const offsetX = x - nearest * dx, offsetZ = z - nearest * dz;
          const distance = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);
          const at = (j * width + i) * 4 + channel;
          data[at] = Math.min(data[at], Math.round(distance * 255 / contactRange));
        }
      }
    }
  }
  rasterize(bank, 0);
  rasterize(reef, 1);
  const texture = new THREE.DataTexture(data, width, height);
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function gridAxis(start, end) {
  const points = [start - 1450, start - 170, start - 36];
  for (let v = start; v < end; v += .69) points.push(v);
  points.push(end, end + 36, end + 170, end + 1450);
  return points;
}

function seaGeometry() {
  // Smaller cells resolve the breakers around the playable coast.
  const xs = gridAxis(6, 68);
  const zs = gridAxis(-165, 16);
  const points = [];
  const indices = [];
  for (let j = 0; j < zs.length; j++) {
    for (let i = 0; i < xs.length; i++) {
      points.push(xs[i], seaLevel, zs[j]);
      if (!j || !i) continue;
      const here = j * xs.length + i;
      indices.push(here - xs.length - 1, here - 1, here - xs.length, here - xs.length, here - 1, here);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.setIndex(indices);
  return geometry;
}

const contactGLSL = `
uniform float clockTime;
uniform sampler2D contactMap;
uniform vec4 contactArea;
uniform float contactRange;
vec2 contactDistance(vec2 p) {
  vec2 uv = (p - contactArea.xy) / contactArea.zw;
  if (any(lessThanEqual(uv, vec2(0.0))) || any(greaterThanEqual(uv, vec2(1.0)))) return vec2(contactRange);
  return texture2D(contactMap, uv).rg * contactRange;
}
float waveClock(vec2 p) {
  return clockTime * .444 + sin(p.y * .76) * .09 + sin(p.y * 1.83 + p.x * .46) * .043;
}
float travellingCrest(float phase) {
  return 1.0 - smoothstep(.028, .17, abs(fract(phase) - .72));
}
`;

export function addSeaSurface(scene, { bank, reef, reefOrigin, horizon, sun, sunTint, wakePath, heading }) {
  const uniforms = {
    clockTime: { value: 0 },
    contactMap: { value: contactTexture(bank, reef) },
    contactArea: { value: new THREE.Vector4(contactBounds.minX, contactBounds.minZ, contactBounds.width, contactBounds.length) },
    contactRange: { value: contactRange },
    horizon: { value: horizon },
    sunDirection: { value: sun },
    sunTint: { value: sunTint },
    sunGlint: { value: 0 },
    skyReflection: { value: 1 },
    hazeFalloff: { value: 0 },
    offshore: { value: new THREE.Color() },
    shallows: { value: new THREE.Color() },
    skyLight: { value: new THREE.Color() },
    foamTint: { value: new THREE.Color('#edf0e5') },
    reefOrigin: { value: reefOrigin },
    wakePath: { value: wakePath },
    boatHeading: { value: heading },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      ${contactGLSL}
      varying vec3 waterPoint;
      void main() {
        vec3 world = position;
        vec2 p = world.xz;
        vec2 banks = contactDistance(p);
        float distanceToBank = min(banks.x, banks.y);
        float swell = sin(p.x * .90 + p.y * .37 + clockTime * 1.41 + sin(p.y * .15) * .65);
        float crossSwell = sin(p.x * .39 - p.y * 1.12 + clockTime * 1.17);
        float crest = travellingCrest(waveClock(p) + (banks.y < banks.x ? .16 : 0.0) + distanceToBank * .32);
        float surf = 1.0 - smoothstep(.15, 4.15, distanceToBank);
        float waveFade = 1.0 - smoothstep(66.0, 121.0, length(p - vec2(21.0, -67.0)));
        world.y += ((swell * .039 + crossSwell * .019) * (1.0 - surf * .65) + crest * surf * .17) * waveFade;
        waterPoint = world;
        gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
      }
    `,
    fragmentShader: `
      ${contactGLSL}
      varying vec3 waterPoint;
      ${horizonGLSL}
      uniform vec3 offshore, shallows, skyLight, foamTint;
      uniform vec3 sunDirection, sunTint;
      uniform float sunGlint, skyReflection, hazeFalloff;
      uniform vec2 reefOrigin;
      uniform vec2 wakePath[${wakePath.length}];
      uniform vec2 boatHeading;
      float hash(vec2 p) {
        vec3 a = fract(p.xyx * .1031);
        a += dot(a, a.yzx + 33.33);
        return fract((a.x + a.y) * a.z);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      float strip(float distanceToBank, float phase, float breakUp) {
        float nearWater = 1.0 - smoothstep(1.85, 5.4, distanceToBank);
        float moving = travellingCrest(phase + distanceToBank * .32 + (breakUp - .5) * .077);
        float sinceImpact = fract(phase - .72);
        float spread = mix(.16, 1.28, smoothstep(.02, .58, sinceImpact));
        float wash = (1.0 - smoothstep(spread * .25, spread, distanceToBank))
          * (1.0 - smoothstep(.17, .80, sinceImpact));
        return max(moving * nearWater * .62, wash * .95) * smoothstep(.16, .75, breakUp);
      }
      float boatWash(vec2 p, float bubbles) {
        if (distance(p, wakePath[0]) > 33.0) return 0.0;
        float offset = 1e4;
        float age = 0.0;
        for (int i = 0; i < ${wakePath.length - 1}; i++) {
          vec2 along = wakePath[i + 1] - wakePath[i];
          float t = clamp(dot(p - wakePath[i], along) / dot(along, along), 0.0, 1.0);
          float distanceFromTrail = length(p - (wakePath[i] + along * t));
          if (distanceFromTrail < offset) {
            offset = distanceFromTrail;
            age = (float(i) + t) / ${(wakePath.length - 1).toFixed(1)};
          }
        }
        float wakeWidth = .46 + age * 3.8 + (bubbles - .5) * .25;
        float edge = 1.0 - smoothstep(.10, .37 + age * .14, abs(offset - wakeWidth));
        float churn = (1.0 - smoothstep(.10, .71 + age * .49, offset)) * (1.0 - smoothstep(.1, .77, age));
        float dissolve = (1.0 - smoothstep(.26, 1.0, age)) * smoothstep(.16, .82, bubbles);
        float wash = max(edge * .63, churn * .75) * dissolve;

        vec2 fromStern = p - wakePath[0];
        float alongBoat = dot(fromStern, boatHeading);
        float apart = abs(dot(fromStern, vec2(boatHeading.y, -boatHeading.x)));
        float shoulder = .46 + clamp(9.5 - alongBoat, 0.0, 2.25) * .43;
        float bow = smoothstep(6.5, 8.5, alongBoat) * (1.0 - smoothstep(9.9, 10.25, alongBoat))
          * (1.0 - smoothstep(.08, .49, abs(apart - shoulder)));
        return max(wash, bow * .5 * smoothstep(.23, .87, bubbles));
      }
      void main() {
        vec2 p = waterPoint.xz;
        float range = distance(cameraPosition, waterPoint);
        vec2 banks = contactDistance(p);
        float edge = min(banks.x, banks.y);
        float detail = 1.0 - smoothstep(25.0, 133.0, range);
        float wind = noise(p * .128 + vec2(clockTime * .045, 0.0));
        float gust = noise(p * .39 + vec2(-clockTime * .059, clockTime * .066));
        float granule = noise(vec2(dot(p, vec2(2.25, 1.26)), dot(p, vec2(-.89, 3.48))) + vec2(clockTime * -.38, clockTime * .21));
        float swellA = cos(dot(p, vec2(1.09, .47)) + clockTime * 1.36 + wind * 3.5 + gust * 1.6);
        float swellB = cos(dot(p, vec2(.55, -.91)) + clockTime * 1.23 + wind * 4.0);
        float rippleA = sin(dot(p, vec2(3.74, 2.38)) + clockTime * 2.19 + granule * 2.3);
        float rippleB = sin(dot(p, vec2(-4.48, 1.94)) + clockTime * 2.67 + wind * 3.2);
        vec3 surface = normalize(cross(dFdx(waterPoint), dFdy(waterPoint)));
        float nearContact = 1.0 - smoothstep(.2, 4.7, edge);
        vec3 baseNormal = mix(vec3(0.0, 1.0, 0.0), surface, nearContact * .26);
        float swellVisibility = 1.0 - smoothstep(91.0, 330.0, range);
        vec2 slope = vec2(swellA * .057 + swellB * .021, swellA * .029 - swellB * .047)
          * mix(.43, 1.0, gust) * swellVisibility;
        vec2 rippleSlope = vec2(rippleA * .023 + rippleB * .012, rippleB * .026 - rippleA * .009) * detail;
        vec3 normal = normalize(baseNormal + vec3(slope.x + rippleSlope.x, 0.0, slope.y + rippleSlope.y));
        vec3 view = normalize(cameraPosition - waterPoint);
        float fresnel = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 4.1);
        float tint = 1.0 - smoothstep(.38, 6.9, edge);
        vec3 color = mix(offshore, shallows, tint * .69);
        color = mix(color, skyLight, (.095 + fresnel * .57) * skyReflection);
        float reflectedSun = max(0.0, dot(reflect(-sunDirection, normal), view));
        float sheen = pow(reflectedSun, 92.0) + .12 * pow(reflectedSun, 24.0);
        color += sunTint * sheen * sunGlint;
        color += (wind - .5) * .036 * swellVisibility + detail * (rippleA * .006 + rippleB * .006 + (granule - .5) * .015);
        float immersed = 1.0 - smoothstep(.03, 1.95, banks.y);
        float contactShade = max(immersed * .29, (1.0 - smoothstep(.02, .48, banks.x)) * .16);
        color *= 1.0 - contactShade;
        float clock = waveClock(p);
        float bubbles = mix(granule, noise(p * 1.47 + vec2(clockTime * .10, 0.0)), .41);
        float exposed = .61 + .39 * smoothstep(-4.6, 4.3, dot(p - reefOrigin, normalize(vec2(.88, .38))));
        float foam = max(strip(banks.x, clock, bubbles) * .83,
          strip(banks.y, clock + .16, bubbles) * exposed);
        foam = max(foam, boatWash(p, bubbles));
        color = mix(color, foamTint, foam * .90);
        float distanceHaze = (1.0 - exp(-max(0.0, range - 112.0) * hazeFalloff))
          * smoothstep(112.0, 185.0, range);
        distanceHaze = mix(distanceHaze, 1.0, smoothstep(540.0, 785.0, range));
        color = mix(color, marineHorizon(-view), distanceHaze);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const sea = mesh(scene, seaGeometry(), material, 0, 0, 0, false);
  sea.receiveShadow = false;
  return {
    setLight({ offshore, shallows, skyLight, skyReflection, sunGlint, hazeFalloff }) {
      uniforms.offshore.value.set(offshore);
      uniforms.shallows.value.set(shallows);
      uniforms.skyLight.value.set(skyLight);
      uniforms.skyReflection.value = skyReflection;
      uniforms.sunGlint.value = sunGlint;
      uniforms.hazeFalloff.value = hazeFalloff;
    },
    update(time) { uniforms.clockTime.value = time; },
  };
}

import * as THREE from 'three';
import { mesh } from './geometry.js';

export const horizonGLSL = `
uniform vec3 horizon;
vec3 marineHorizon(vec3 ray) {
  vec2 azimuth = ray.xz * inversesqrt(max(.0001, dot(ray.xz, ray.xz)));
  float openSeaLight = smoothstep(-.68, .96, dot(azimuth, vec2(.85, -.53)));
  return horizon * mix(vec3(.89, .93, .98), vec3(1.05, 1.035, 1.01), openSeaLight);
}
`;

const cloudGLSL = `
uniform float cloudTime;
uniform float clearing;
uniform vec3 sunDirection, sunTint, upperSky;
uniform vec3 highShade, highLight, lowShade, lowLight;
varying vec3 direction;

float cloudHash(vec2 p) {
  vec3 v = fract(p.xyx * .1031);
  v += dot(v, v.yzx + 33.33);
  return fract((v.x + v.y) * v.z);
}

float cloudNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(cloudHash(i), cloudHash(i + vec2(1, 0)), f.x),
    mix(cloudHash(i + vec2(0, 1)), cloudHash(i + vec2(1, 1)), f.x), f.y);
}

float cloudDensity(vec2 p) {
  mat2 turn = mat2(.84, -.54, .54, .84);
  float broad = cloudNoise(p) * .55;
  p = turn * p * 2.06 + 7.3;
  float folds = cloudNoise(p) * .28;
  p = turn * p * 2.01 + 12.8;
  float detail = cloudNoise(p) * .12;
  return broad + folds + detail + cloudNoise(p * 2.03) * .05;
}

vec2 cloudUV(vec2 ground, vec2 wind, float scale) {
  vec2 moved = ground - wind * cloudTime;
  return vec2(dot(moved, vec2(.91, .42)), dot(moved, vec2(-.42, .91)) * .70) / scale;
}

void main() {
  vec3 ray = normalize(direction);
  float elevation = max(ray.y, .013);
  vec3 air = marineHorizon(ray);
  vec3 color = mix(air, upperSky, (1.0 - exp(-max(ray.y, 0.0) * 5.2)) * clearing);
  vec3 sunOffset = ray - sunDirection;
  float sunRadiusSquared = dot(sunOffset, sunOffset);
  float scattering = exp2(-sunRadiusSquared * mix(38.0, 94.0, clearing));
  float halo = exp2(-sunRadiusSquared * mix(430.0, 1220.0, clearing));
  if (ray.y > .008) {
    // The two cloud decks are projected at different heights so their apparent
    // scales and contrast change independently with elevation.
    float highDistance = (340.0 - cameraPosition.y) / elevation;
    float lowDistance = (126.0 - cameraPosition.y) / elevation;
    vec2 highUV = cloudUV(cameraPosition.xz + ray.xz * highDistance, vec2(.17, -.29), 465.0) + vec2(10.3, 2.8);
    vec2 lowUV = cloudUV(cameraPosition.xz + ray.xz * lowDistance, vec2(.53, -.39), 216.0) + vec2(3.7, 12.5);
    vec2 warp = vec2(cloudNoise(lowUV * .63 + 4.3), cloudNoise(lowUV * .65 + 18.4)) - .5;
    lowUV += warp * 2.05;
    float high = cloudDensity(highUV);
    float bank = cloudNoise(lowUV * .69 + vec2(-6.7, 3.8));
    float low = cloudDensity(lowUV) * .84 + bank * .16;
    float shoulder = cloudDensity(lowUV + vec2(-.22, .16));

    float farVeil = exp(-highDistance * .00034) * smoothstep(.014, .099, ray.y);
    vec3 highCloud = mix(highShade, highLight, 1.0 - smoothstep(.21, .70, high));
    float highCover = mix(.50 + .33 * high, smoothstep(.46, .81, high) * .78, clearing);
    color = mix(color, highCloud, highCover * farVeil);

    float nearVeil = exp(-lowDistance * .00043) * smoothstep(.013, .101, ray.y);
    float thickness = smoothstep(.29, .68, low);
    float rim = clamp((low - shoulder) * (1.28 + scattering * .68) + .018, 0.0, .33);
    vec3 litCloud = lowLight + sunTint * scattering * mix(.09, .036, clearing);
    vec3 lowCloud = mix(litCloud, lowShade, clamp(thickness * 1.08 - rim, 0.0, 1.0));
    float coverage = smoothstep(mix(.24, .50, clearing), mix(.59, .76, clearing), low);
    color = mix(color, lowCloud, coverage * nearVeil);

    // A veiled sun brightens the thin cloud around it as well as its softened disk.
    float transmission = (1.0 - thickness * mix(.56, .28, clearing)) * (1.0 - high * .27);
    float disk = 1.0 - smoothstep(mix(.006, .0038, clearing), mix(.016, .0065, clearing), sqrt(sunRadiusSquared));
    color += sunTint * (scattering * mix(.15, .075, clearing) + halo * mix(.36, .21, clearing)
      + disk * mix(.83, 1.21, clearing)) * transmission;
  }
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function addSky(scene) {
  const horizon = new THREE.Color();
  const sun = new THREE.Vector3();
  const sunTint = new THREE.Color();
  const uniforms = {
    horizon: { value: horizon },
    cloudTime: { value: 0 },
    clearing: { value: 0 },
    sunDirection: { value: sun },
    sunTint: { value: sunTint },
    upperSky: { value: new THREE.Color() },
    highShade: { value: new THREE.Color() },
    highLight: { value: new THREE.Color() },
    lowShade: { value: new THREE.Color() },
    lowLight: { value: new THREE.Color() },
  };
  scene.fog = new THREE.FogExp2();
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms,
    vertexShader: `
      varying vec3 direction;
      void main() {
        direction = (modelMatrix * vec4(position, 1.0)).xyz - cameraPosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: horizonGLSL + cloudGLSL,
  });
  const sky = mesh(scene, new THREE.SphereGeometry(755, 36, 24), material, 0, 0, -45, false);
  sky.renderOrder = -100;
  sky.receiveShadow = false;

  return {
    horizon,
    sun,
    sunTint,
    setLight(preset) {
      for (const [name, color] of Object.entries(preset.colors)) uniforms[name].value.set(color);
      uniforms.clearing.value = preset.clearing;
      sun.set(...preset.sun).normalize();
      scene.fog.color.copy(horizon);
      scene.fog.density = preset.fogDensity;
      const canvas = document.createElement('canvas');
      canvas.width = 384;
      canvas.height = 192;
      const context = canvas.getContext('2d');
      const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, preset.reflection[0]);
      gradient.addColorStop(.30, preset.reflection[1]);
      gradient.addColorStop(.495, preset.reflection[2]);
      gradient.addColorStop(.51, '#8c9290');
      gradient.addColorStop(.74, '#636967');
      gradient.addColorStop(1, '#494b43');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      const reflection = new THREE.CanvasTexture(canvas);
      reflection.mapping = THREE.EquirectangularReflectionMapping;
      reflection.colorSpace = THREE.SRGBColorSpace;
      const previous = scene.environment;
      scene.environment = reflection;
      previous?.dispose();
    },
    update(time) { uniforms.cloudTime.value = time; },
  };
}

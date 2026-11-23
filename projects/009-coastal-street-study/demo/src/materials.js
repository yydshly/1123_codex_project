import * as THREE from 'three';

const surfaces = {
  asphalt: { color: '#afbdc5', normal: 0.21, roughness: 0.98, roughMap: true },
  plaster: { color: '#eee4cf', normal: 0.18, roughness: 0.91 },
  pavers: { color: '#c0bec0', normal: 0.35, roughness: 0.95, roughMap: true },
  stone: { color: '#a1a096', normal: 0.48, roughness: 0.9 },
  slate: { color: '#9a9da3', normal: 0.43, roughness: 0.89 },
  pebbles: { color: '#a8a29a', normal: 0.72, roughness: 0.92 },
  cliff: { color: '#ae9e90', normal: 0.34, roughness: 0.95 },
};

export async function loadMaterials(renderer) {
  const loader = new THREE.TextureLoader();
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const loaded = await Promise.all(Object.entries(surfaces).map(async ([name, options]) => {
    const read = async (kind) => {
      const file = import.meta.env.BASE_URL + 'textures/' + name + '-' + kind + '.webp';
      try {
        const texture = await loader.loadAsync(file);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = anisotropy;
        if (kind === 'color') texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      } catch {
        throw new Error('贴图加载失败 ' + file);
      }
    };
    const [color, normal, rough] = await Promise.all([
      read('color'), read('normal'), options.roughMap ? read('rough') : null,
    ]);
    const material = new THREE.MeshStandardMaterial({
      color: options.color,
      map: color,
      normalMap: normal,
      normalScale: new THREE.Vector2(options.normal, options.normal),
      roughness: options.roughness,
      roughnessMap: rough,
    });
    return [name, material];
  }));

  const material = (color, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({
    color, roughness, metalness,
  });
  return {
    ...Object.fromEntries(loaded),
    plain: material,
    paintedWood: material('#d0cdbd', 0.76),
    lightTrim: material('#d2cfc2', 0.87),
    darkTrim: material('#3f494a', 0.72),
    iron: material('#242c2d', 0.66, 0.35),
    pipes: material('#565d57', 0.83, 0.17),
    brass: material('#796c4e', 0.54, 0.45),
    glass: material('#415053', 0.28, 0.14),
    paleGlass: material('#647477', 0.33, 0.06),
    interior: material('#5c5850', 0.84),
    tire: material('#262a2b', 0.95),
    rubber: material('#171c1e', 0.75),
    rim: material('#a1a9aa', 0.31, 0.7),
    yellowPaint: material('#a79d6c', 0.89),
    lightPaint: material('#b9b9ac', 0.87),
    drain: material('#313736', 0.91, 0.16),
  };
}

export function shade(material, color) {
  const shaded = material.clone();
  shaded.color.set(color);
  return shaded;
}

export function shadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const shadow = ctx.createRadialGradient(64, 64, 4, 64, 64, 63);
  shadow.addColorStop(0, 'rgba(27,32,29,0.8)');
  shadow.addColorStop(0.43, 'rgba(27,32,29,0.54)');
  shadow.addColorStop(0.75, 'rgba(27,32,29,0.2)');
  shadow.addColorStop(1, 'rgba(27,32,29,0)');
  ctx.fillStyle = shadow;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

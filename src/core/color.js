/**
 * PERFIL DE COLOR. Instagram asume sRGB. Una foto en Adobe RGB subida sin
 * convertir se ve desaturada, y ese es un fallo que ninguna app de collage de
 * las que probamos corrige.
 *
 * La deteccion es una busqueda del nombre del perfil ICC en la cabecera del
 * fichero. La conversion es la de verdad: linealizar, pasar por XYZ y volver a
 * codificar en sRGB.
 */

export const CS_LABEL = {
  AdobeRGB: 'Adobe RGB (1998)',
  DisplayP3: 'Display P3',
  ProPhoto: 'ProPhoto RGB',
  sRGB: 'sRGB',
  unknown: 'sin perfil',
};

export const OFF_PROFILE = ['AdobeRGB', 'DisplayP3', 'ProPhoto'];

export async function detectColorSpace(file) {
  try {
    const buf = new Uint8Array(await file.slice(0, 262144).arrayBuffer());
    let s = '';
    for (let i = 0; i < buf.length; i++) {
      const c = buf[i];
      s += c >= 32 && c < 127 ? String.fromCharCode(c) : '\u0000';
    }
    const flat = s.replace(/\u0000/g, '');
    const hay = (n) => s.includes(n) || flat.includes(n.replace(/ /g, ''));
    if (hay('Adobe RGB')) return 'AdobeRGB';
    if (hay('Display P3') || hay('DisplayP3')) return 'DisplayP3';
    if (hay('ProPhoto')) return 'ProPhoto';
    if (hay('sRGB')) return 'sRGB';
  } catch (e) {
    /* perfil no legible */
  }
  return 'unknown';
}

const M_TO_XYZ = {
  AdobeRGB: [0.5767309, 0.185554, 0.1881852, 0.2973769, 0.6273491, 0.0752741, 0.0270343, 0.0706872, 0.9911085],
  DisplayP3: [0.4865709, 0.2656677, 0.1982173, 0.2289746, 0.6917385, 0.0792869, 0, 0.0451134, 1.0439444],
  /* ProPhoto esta definido sobre D50 y la salida sRGB es D65, asi que la matriz
     va con la adaptacion cromatica de Bradford ya incorporada. Sin ella el
     blanco salia en (255, 252, 221): una desviacion amarilla visible. */
  ProPhoto: [
    0.7556032, 0.1127849, 0.0820818,
    0.268338, 0.7151268, 0.0165353,
    0.00391, -0.0129187, 1.0978387,
  ],
};

const M_XYZ_SRGB = [
  3.2404542, -1.5371385, -0.4985314,
  -0.969266, 1.8760108, 0.041556,
  0.0556434, -0.2040259, 1.0572252,
];

export const srgbEncode = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
export const srgbDecode = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));

/** Convierte un pixel suelto. Extraido para poder testearlo sin canvas. */
export function pixelToSRGB(r, g, b, cs) {
  const M = M_TO_XYZ[cs];
  if (!M) return [r, g, b];
  const gamma = cs === 'AdobeRGB' ? 563 / 256 : cs === 'ProPhoto' ? 1.8 : null;
  const dec = gamma ? (v) => Math.pow(v, gamma) : srgbDecode;
  const R = dec(r / 255), G = dec(g / 255), B = dec(b / 255);
  const [a, b2, c, e, f, g2, i0, j, k] = M;
  const [p, q, s2, t2, u2, v2, x2, y2, z2] = M_XYZ_SRGB;
  const X = a * R + b2 * G + c * B;
  const Y = e * R + f * G + g2 * B;
  const Z = i0 * R + j * G + k * B;
  const out = [
    srgbEncode(Math.min(1, Math.max(0, p * X + q * Y + s2 * Z))) * 255,
    srgbEncode(Math.min(1, Math.max(0, t2 * X + u2 * Y + v2 * Z))) * 255,
    srgbEncode(Math.min(1, Math.max(0, x2 * X + y2 * Y + z2 * Z))) * 255,
  ];
  return out.map((v) => Math.min(255, Math.max(0, v)));
}

export function convertToSRGB(ctx, w, h, cs) {
  if (!M_TO_XYZ[cs]) return;
  const gamma = cs === 'AdobeRGB' ? 563 / 256 : cs === 'ProPhoto' ? 1.8 : null;
  const dec = gamma ? (v) => Math.pow(v, gamma) : srgbDecode;
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) lut[i] = dec(i / 255);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const [a, b2, c, e, f, g2, i0, j, k] = M_TO_XYZ[cs];
  const [p, q, s2, t2, u2, v2, x2, y2, z2] = M_XYZ_SRGB;
  const cl = (v) => Math.min(255, Math.max(0, v));
  for (let n = 0; n < d.length; n += 4) {
    const R = lut[d[n]], G = lut[d[n + 1]], B = lut[d[n + 2]];
    const X = a * R + b2 * G + c * B;
    const Y = e * R + f * G + g2 * B;
    const Z = i0 * R + j * G + k * B;
    d[n] = cl(srgbEncode(Math.min(1, Math.max(0, p * X + q * Y + s2 * Z))) * 255);
    d[n + 1] = cl(srgbEncode(Math.min(1, Math.max(0, t2 * X + u2 * Y + v2 * Z))) * 255);
    d[n + 2] = cl(srgbEncode(Math.min(1, Math.max(0, x2 * X + y2 * Y + z2 * Z))) * 255);
  }
  ctx.putImageData(img, 0, 0);
}

/** Tinta legible sobre un fondo dado, por luminancia relativa. */
export function contrastOn(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const lin = (v) => srgbDecode(v / 255);
  const L =
    0.2126 * lin(parseInt(n.slice(0, 2), 16)) +
    0.7152 * lin(parseInt(n.slice(2, 4), 16)) +
    0.0722 * lin(parseInt(n.slice(4, 6), 16));
  return L > 0.4 ? '#111111' : '#ffffff';
}

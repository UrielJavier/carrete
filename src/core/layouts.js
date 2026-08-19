/**
 * Constantes del dominio. Los layouts son DATOS, no componentes: una lista de
 * rectangulos normalizados. Añadir una rejilla nueva es añadir una entrada aqui,
 * y tanto el glifo del selector como el renderizador salen de los mismos numeros.
 */

export const RATIOS = {
  '4:5': { w: 1440, h: 1800, label: '4:5' },
  '3:4': { w: 1440, h: 1920, label: '3:4' },
  '1:1': { w: 1440, h: 1440, label: '1:1' },
  '1.91:1': { w: 1440, h: 754, label: '1.91' },
};

const r = (x, y, w, h) => ({ x, y, w, h });

export const LAYOUTS = {
  full: { name: 'Completa', cells: [r(0, 0, 1, 1)] },
  h2: { name: '2 horizontales', cells: [r(0, 0, 1, 1 / 2), r(0, 1 / 2, 1, 1 / 2)] },
  h3: {
    name: '3 horizontales',
    cells: [r(0, 0, 1, 1 / 3), r(0, 1 / 3, 1, 1 / 3), r(0, 2 / 3, 1, 1 / 3)],
  },
  v2: { name: '2 verticales', cells: [r(0, 0, 1 / 2, 1), r(1 / 2, 0, 1 / 2, 1)] },
  v3: {
    name: '3 verticales',
    cells: [r(0, 0, 1 / 3, 1), r(1 / 3, 0, 1 / 3, 1), r(2 / 3, 0, 1 / 3, 1)],
  },
  quad: {
    name: '4 esquinas',
    cells: [r(0, 0, 0.5, 0.5), r(0.5, 0, 0.5, 0.5), r(0, 0.5, 0.5, 0.5), r(0.5, 0.5, 0.5, 0.5)],
  },
  t2b1: { name: '2 arriba + 1', cells: [r(0, 0, 0.5, 0.5), r(0.5, 0, 0.5, 0.5), r(0, 0.5, 1, 0.5)] },
  t1b2: { name: '1 + 2 abajo', cells: [r(0, 0, 1, 0.5), r(0, 0.5, 0.5, 0.5), r(0.5, 0.5, 0.5, 0.5)] },
  l1r2: { name: '1 izq + 2 der', cells: [r(0, 0, 0.5, 1), r(0.5, 0, 0.5, 0.5), r(0.5, 0.5, 0.5, 0.5)] },
  l2r1: { name: '2 izq + 1 der', cells: [r(0, 0, 0.5, 0.5), r(0, 0.5, 0.5, 0.5), r(0.5, 0, 0.5, 1)] },
  six: {
    name: '6 (3×2)',
    cells: [
      r(0, 0, 1 / 3, 0.5), r(1 / 3, 0, 1 / 3, 0.5), r(2 / 3, 0, 1 / 3, 0.5),
      r(0, 0.5, 1 / 3, 0.5), r(1 / 3, 0.5, 1 / 3, 0.5), r(2 / 3, 0.5, 1 / 3, 0.5),
    ],
  },
  t1b3: {
    name: '1 + 3 abajo',
    cells: [
      r(0, 0, 1, 0.6),
      r(0, 0.6, 1 / 3, 0.4), r(1 / 3, 0.6, 1 / 3, 0.4), r(2 / 3, 0.6, 1 / 3, 0.4),
    ],
  },
};

/** Tope de Instagram para un carrusel. Subio de 10 a 20 en 2024. */
export const MAX_SLIDES = 20;

/** Escala de separacion, en px sobre el lienzo de 1440. Pasos cerrados. */
export const GAPS = [0, 2, 4, 6, 8, 12, 16, 24, 32, 48];

/** Valor especial de fondo: sin relleno, alfa 0. No es un color CSS cualquiera,
 *  asi que quien lo pinte tiene que tratarlo aparte. */
export const TRANSPARENT = 'transparent';

export const BGS = ['#ffffff', '#000000', TRANSPARENT];

/** Los asomos muestran un tercio de la pagina vecina a cada lado. Como la pagina
 *  activa ocupa 1 / (1 + 2·frac) del ancho, con 1/3 se ven ~1,67 paginas: mucho
 *  menos que las ~4,3 de Post, asi que la activa siempre queda mas ampliada. */
export const PEEK_FRAC = 1 / 3;
export const PEEK_GAP = 3;

/** En Foto los asomos se cierran y la pagina se acerca. */
export const FOTO_ZOOM = 1.22;

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const uid = () => Math.random().toString(36).slice(2, 9);

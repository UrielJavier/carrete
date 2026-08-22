/**
 * Constantes del dominio. Los layouts son DATOS, no componentes: una lista de
 * rectangulos normalizados. Añadir una rejilla nueva es añadir una entrada aqui,
 * y tanto el glifo del selector como el renderizador salen de los mismos numeros.
 */

export const RATIOS = {
  '4:5': { w: 1440, h: 1800, label: '4:5', desc: 'Vertical — buen equilibrio, ocupa bastante feed.' },
  '3:4': { w: 1440, h: 1920, label: '3:4', desc: 'La más alargada — ocupa el máximo del feed.' },
  '1:1': { w: 1440, h: 1440, label: '1:1', desc: 'Cuadrado — el toque clásico.' },
  '1.91:1': { w: 1440, h: 754, label: '1.91', desc: 'Apaisado — para paisajes y horizontales.' },
  /* Stories / Reels: pantalla completa, 9:16 (1080×1920 al exportar). */
  '9:16': { w: 1440, h: 2560, label: '9:16', desc: 'Pantalla completa — para stories y reels.' },
};

const r = (x, y, w, h) => ({ x, y, w, h });

/* Los layouts son particiones de la pagina en rectangulos [0..1]. Todos gratis: no
   hay ninguno "premium". Añadir uno es añadir una entrada con celdas que cubran la
   pagina sin huecos ni solapes; el glifo del selector y el render salen de aqui. */
const T = 1 / 3;
const T2 = 2 / 3;
const Q = 0.25;
const BIG = 0.62;
const SM = 0.38;

export const LAYOUTS = {
  full: { name: 'Completa', cells: [r(0, 0, 1, 1)] },

  // — 2 celdas —
  v2: { name: '2 verticales', cells: [r(0, 0, 0.5, 1), r(0.5, 0, 0.5, 1)] },
  v2l: { name: '2 vert. (izq. mayor)', cells: [r(0, 0, BIG, 1), r(BIG, 0, SM, 1)] },
  v2r: { name: '2 vert. (der. mayor)', cells: [r(0, 0, SM, 1), r(SM, 0, BIG, 1)] },
  h2: { name: '2 horizontales', cells: [r(0, 0, 1, 0.5), r(0, 0.5, 1, 0.5)] },
  h2t: { name: '2 horiz. (arriba mayor)', cells: [r(0, 0, 1, BIG), r(0, BIG, 1, SM)] },
  h2b: { name: '2 horiz. (abajo mayor)', cells: [r(0, 0, 1, SM), r(0, SM, 1, BIG)] },

  // — 3 celdas —
  v3: { name: '3 verticales', cells: [r(0, 0, T, 1), r(T, 0, T, 1), r(T2, 0, T, 1)] },
  h3: { name: '3 horizontales', cells: [r(0, 0, 1, T), r(0, T, 1, T), r(0, T2, 1, T)] },
  l1r2: { name: '1 izq + 2 der', cells: [r(0, 0, 0.5, 1), r(0.5, 0, 0.5, 0.5), r(0.5, 0.5, 0.5, 0.5)] },
  l2r1: { name: '2 izq + 1 der', cells: [r(0, 0, 0.5, 0.5), r(0, 0.5, 0.5, 0.5), r(0.5, 0, 0.5, 1)] },
  t1b2: { name: '1 + 2 abajo', cells: [r(0, 0, 1, 0.5), r(0, 0.5, 0.5, 0.5), r(0.5, 0.5, 0.5, 0.5)] },
  t2b1: { name: '2 arriba + 1', cells: [r(0, 0, 0.5, 0.5), r(0.5, 0, 0.5, 0.5), r(0, 0.5, 1, 0.5)] },
  l1r2w: { name: 'izq. grande + 2', cells: [r(0, 0, BIG, 1), r(BIG, 0, SM, 0.5), r(BIG, 0.5, SM, 0.5)] },
  t1b2w: { name: 'arriba grande + 2', cells: [r(0, 0, 1, BIG), r(0, BIG, 0.5, SM), r(0.5, BIG, 0.5, SM)] },

  // — 4 celdas —
  quad: {
    name: '4 esquinas',
    cells: [r(0, 0, 0.5, 0.5), r(0.5, 0, 0.5, 0.5), r(0, 0.5, 0.5, 0.5), r(0.5, 0.5, 0.5, 0.5)],
  },
  v4: { name: '4 verticales', cells: [r(0, 0, Q, 1), r(Q, 0, Q, 1), r(0.5, 0, Q, 1), r(0.75, 0, Q, 1)] },
  h4: { name: '4 horizontales', cells: [r(0, 0, 1, Q), r(0, Q, 1, Q), r(0, 0.5, 1, Q), r(0, 0.75, 1, Q)] },
  l1r3: {
    name: '1 izq + 3 der',
    cells: [r(0, 0, 0.5, 1), r(0.5, 0, 0.5, T), r(0.5, T, 0.5, T), r(0.5, T2, 0.5, T)],
  },
  r1l3: {
    name: '3 izq + 1 der',
    cells: [r(0, 0, 0.5, T), r(0, T, 0.5, T), r(0, T2, 0.5, T), r(0.5, 0, 0.5, 1)],
  },
  t1b3: {
    name: '1 + 3 abajo',
    cells: [r(0, 0, 1, BIG), r(0, BIG, T, SM), r(T, BIG, T, SM), r(T2, BIG, T, SM)],
  },
  t3b1: {
    name: '3 arriba + 1',
    cells: [r(0, 0, T, 0.5), r(T, 0, T, 0.5), r(T2, 0, T, 0.5), r(0, 0.5, 1, 0.5)],
  },
  bigTL: {
    name: '1 grande + esquina',
    cells: [r(0, 0, T2, T2), r(T2, 0, T, T2), r(0, T2, T2, T), r(T2, T2, T, T)],
  },

  // — 5 celdas —
  t1b4: {
    name: '1 + 4 abajo',
    cells: [r(0, 0, 1, 0.5), r(0, 0.5, Q, 0.5), r(Q, 0.5, Q, 0.5), r(0.5, 0.5, Q, 0.5), r(0.75, 0.5, Q, 0.5)],
  },
  l1r4: {
    name: '1 izq + 4 der',
    cells: [r(0, 0, 0.5, 1), r(0.5, 0, 0.5, Q), r(0.5, Q, 0.5, Q), r(0.5, 0.5, 0.5, Q), r(0.5, 0.75, 0.5, Q)],
  },
  v5: {
    name: '5 verticales',
    cells: [r(0, 0, 0.2, 1), r(0.2, 0, 0.2, 1), r(0.4, 0, 0.2, 1), r(0.6, 0, 0.2, 1), r(0.8, 0, 0.2, 1)],
  },

  // — 6 celdas —
  six: {
    name: '6 (3×2)',
    cells: [
      r(0, 0, T, 0.5), r(T, 0, T, 0.5), r(T2, 0, T, 0.5),
      r(0, 0.5, T, 0.5), r(T, 0.5, T, 0.5), r(T2, 0.5, T, 0.5),
    ],
  },
  six23: {
    name: '6 (2×3)',
    cells: [
      r(0, 0, 0.5, T), r(0.5, 0, 0.5, T),
      r(0, T, 0.5, T), r(0.5, T, 0.5, T),
      r(0, T2, 0.5, T), r(0.5, T2, 0.5, T),
    ],
  },

  // — 9 celdas —
  nine: {
    name: '9 (3×3)',
    cells: [
      r(0, 0, T, T), r(T, 0, T, T), r(T2, 0, T, T),
      r(0, T, T, T), r(T, T, T, T), r(T2, T, T, T),
      r(0, T2, T, T), r(T, T2, T, T), r(T2, T2, T, T),
    ],
  },
};

/** Tope de Instagram para un carrusel. Subio de 10 a 20 en 2024. */
export const MAX_SLIDES = 20;

/** Escala de separacion, en px sobre el lienzo de 1440. Pasos cerrados. */
export const GAPS = [0, 2, 4, 6, 8, 12, 16, 24, 32, 48];

/** Colores para distinguir grupos de celdas unidas. Se evitan rojos/ámbar/amarillos
 *  (colores típicos de aviso/error) para no confundir con advertencias. */
export const GROUP_COLORS = ['#6ea8fe', '#34d399', '#a78bfa', '#22d3ee', '#f472b6', '#818cf8', '#4ade80', '#e879f9'];

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

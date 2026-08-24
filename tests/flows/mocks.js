/**
 * Utilidades para tests de FLUJO (integración): recorren viajes de usuario completos
 * por el reducer + core, sin navegador. La lógica de verdad vive en `core`/`state`,
 * así que aquí se conduce como lo haría la app y se comprueba el render con un `ctx`
 * de mentira que apunta QUÉ foto se dibuja y DÓNDE.
 */
import { reducer, initialState } from '../../src/state/store.js';
import { postCells, drawRegion } from '../../src/core/geometry.js';

/** Registro de fotos de mentira: id -> tamaño. Sirve de `getSource` para drawRegion. */
export function makeLibrary() {
  const src = {};
  const add = (id, w = 1600, h = 1200) => { src[id] = { w, h }; return id; };
  const getSource = (id) => (src[id] ? { el: { id }, w: src[id].w, h: src[id].h } : null);
  return { src, add, getSource };
}

/** ctx que apunta cada dibujado con el id de su foto y el rect de recorte previo. */
export function fakeCtx() {
  const calls = [];
  let lastRect = null;
  return {
    calls,
    fillStyle: null,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    filter: 'none',
    fillRect: (...a) => calls.push(['fillRect', ...a]),
    clearRect: (...a) => calls.push(['clearRect', ...a]),
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    clip: () => {},
    rect: (x, y, w, h) => { lastRect = [x, y, w, h].map(Math.round); },
    drawImage: (el, x, y) => calls.push(['draw', el.id, lastRect, Math.round(x), Math.round(y)]),
  };
}

/** Ids de las fotos dibujadas, en orden. Refleja lo que se vería exportado (página 0). */
export function drawnIds(post, getSource) {
  const ctx = fakeCtx();
  drawRegion(ctx, postCells(post), 0, 1440, 1800, post.bg, getSource, post.fill);
  return ctx.calls.filter((c) => c[0] === 'draw').map((c) => c[1]);
}

export const countDrawn = (post, getSource, id) =>
  drawnIds(post, getSource).filter((x) => x === id).length;

/** Aplica una lista de acciones al estado, como un guion de usuario. */
export function run(state, ...actions) {
  return actions.reduce((s, a) => reducer(s, a), state);
}

export const start = () => initialState();

/** Asigna fotos a celdas de la página 0 (como una importación ya resuelta). */
export function withPhotos(state, pairs) {
  return pairs.reduce(
    (s, [cellIndex, imgId]) => reducer(s, { type: 'patchCell', slideIndex: 0, cellIndex, patch: { imgId } }),
    state,
  );
}

/** Ids de las celdas de la página 0 y su grupo, para inspección legible. */
export const cellGroups = (state) => state.post.slides[0].cells.map((c) => c.group || null);

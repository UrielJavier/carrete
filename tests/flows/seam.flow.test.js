import { describe, it, expect } from 'vitest';
import { postCells, drawRegion, newT } from '../../src/core/geometry.js';
import { exportSize } from '../../src/core/post.js';

/**
 * PRECISIÓN DE LA COSTURA (carrusel sin costuras). Un grupo que cruza páginas se
 * exporta como una imagen por página. Para que el "sin costuras" no muestre una raya
 * al deslizar, la foto compartida tiene que dibujarse desplazada EXACTAMENTE un ancho
 * de página entre una página y la siguiente, y el recorte de la celda a sangre tiene
 * que caer en píxeles enteros (0 y el ancho), sin franja fraccionaria en el borde.
 *
 * El ancho de export es entero (1080), así que el desplazamiento es entero por
 * construcción; este test lo blinda ante futuros cambios.
 */

/** ctx que apunta el rect de recorte y el x de cada dibujado. */
const recCtx = () => {
  const draws = [];
  const clips = [];
  return {
    draws,
    clips,
    fillStyle: null,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    filter: 'none',
    fillRect() {},
    clearRect() {},
    save() {},
    restore() {},
    beginPath() {},
    clip() {},
    rect(x, y, w, h) { clips.push({ x, y, w, h }); },
    drawImage(el, x, y, w, h) { draws.push({ id: el.id, x, y, w, h }); },
  };
};

const getSource = (id) => (id === 'x' ? { el: { id }, w: 2000, h: 1000 } : null);

/** Dos páginas 'full', ambas celdas unidas en un grupo que comparte la foto 'x'. */
const twoPageGroup = () => ({
  ratio: '1:1',
  gap: 0,
  fill: 'color',
  bg: '#000',
  groups: { g: { imgId: 'x', t: newT() } },
  slides: [
    { id: 's0', layoutId: 'full', cells: [{ t: newT(), group: 'g' }], texts: [] },
    { id: 's1', layoutId: 'full', cells: [{ t: newT(), group: 'g' }], texts: [] },
  ],
});

describe('costura del carrusel: corte a píxel exacto entre páginas', () => {
  it('la foto del grupo se dibuja desplazada EXACTAMENTE un ancho de página', () => {
    const post = twoPageGroup();
    const cells = postCells(post);
    const { w: EXW, h: EXH } = exportSize(post.ratio);

    const c0 = recCtx();
    drawRegion(c0, cells, 0, EXW, EXH, post.bg, getSource, post.fill);
    const c1 = recCtx();
    drawRegion(c1, cells, 1, EXW, EXH, post.bg, getSource, post.fill);

    const x0 = c0.draws.find((d) => d.id === 'x')?.x;
    const x1 = c1.draws.find((d) => d.id === 'x')?.x;
    expect(x0).toBeTypeOf('number');
    expect(x1).toBeTypeOf('number');
    // La página 1 dibuja la foto exactamente EXW px a la izquierda → continua sin raya.
    expect(x0 - x1).toBe(EXW);
  });

  it('la celda a sangre recorta en píxeles enteros (0 y el ancho), sin franja', () => {
    const post = twoPageGroup();
    const cells = postCells(post);
    const { w: EXW, h: EXH } = exportSize(post.ratio);

    const c0 = recCtx();
    drawRegion(c0, cells, 0, EXW, EXH, post.bg, getSource, post.fill);
    const clip = c0.clips[c0.clips.length - 1]; // recorte de la celda del grupo
    expect(clip.x).toBe(0);
    expect(clip.w).toBe(EXW);
    expect(Number.isInteger(clip.x)).toBe(true);
    expect(Number.isInteger(clip.w)).toBe(true);
  });
});

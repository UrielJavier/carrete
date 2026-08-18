import { describe, it, expect } from 'vitest';
import { postCells, drawRegion } from '../src/core/geometry.js';
import { TRANSPARENT } from '../src/core/layouts.js';
import { newPost, newSlide } from '../src/core/post.js';

/** ctx de mentira que apunta lo que se le pide: permite comprobar el dibujado sin
 *  navegador, que es donde han vivido los bugs de geometria. */
const fakeCtx = () => {
  const calls = [];
  return {
    calls,
    fillStyle: null,
    fillRect: (...a) => calls.push(['fillRect', ...a]),
    clearRect: (...a) => calls.push(['clearRect', ...a]),
    save: () => {}, restore: () => {}, beginPath: () => {}, clip: () => {},
    rect: (...a) => calls.push(['rect', ...a.map(Math.round)]),
    drawImage: (el, x, y, w, h) => calls.push(['draw', Math.round(x), Math.round(y)]),
  };
};

const conFotos = (layoutId, ids) => {
  const sl = newSlide(layoutId);
  ids.forEach((id, i) => { if (id) sl.cells[i].imgId = id; });
  return sl;
};

const render = (post) => {
  const ctx = fakeCtx();
  drawRegion(ctx, postCells(post), 0, 1440, 1800, post.bg, () => ({ el: {}, w: 1600, h: 1200 }));
  return ctx.calls;
};

describe('una pagina a medio llenar exporta la pagina COMPLETA', () => {
  it('rellena todo el lienzo y dibuja solo la celda con foto', () => {
    const post = { ...newPost(), slides: [conFotos('h2', ['i1', null])] };
    const calls = render(post);
    expect(calls[0]).toEqual(['fillRect', 0, 0, 1440, 1800]);
    expect(calls.filter((c) => c[0] === 'draw')).toHaveLength(1);
    /* la foto ocupa la mitad de arriba, en su sitio, no recortada al contenido */
    expect(calls.find((c) => c[0] === 'rect')).toEqual(['rect', 0, 0, 1440, 900]);
  });

  it('una pagina sin ninguna foto sigue exportandose', () => {
    const post = { ...newPost(), slides: [conFotos('quad', [null, null, null, null])] };
    const calls = render(post);
    expect(calls[0]).toEqual(['fillRect', 0, 0, 1440, 1800]);
    expect(calls.filter((c) => c[0] === 'draw')).toHaveLength(0);
  });
});

describe('fondo transparente', () => {
  it('no rellena: deja el lienzo con alfa 0', () => {
    const post = { ...newPost(), bg: TRANSPARENT, slides: [conFotos('h2', ['i1', null])] };
    const calls = render(post);
    expect(calls[0]).toEqual(['clearRect', 0, 0, 1440, 1800]);
    expect(calls.some((c) => c[0] === 'fillRect')).toBe(false);
  });

  it('las fotos se siguen dibujando en su sitio', () => {
    const post = { ...newPost(), bg: TRANSPARENT, slides: [conFotos('h2', [null, 'i2'])] };
    const calls = render(post);
    expect(calls.filter((c) => c[0] === 'draw')).toHaveLength(1);
    expect(calls.find((c) => c[0] === 'rect')).toEqual(['rect', 0, 900, 1440, 900]);
  });

  it('el gap tambien queda transparente, no de color', () => {
    const post = { ...newPost(), bg: TRANSPARENT, gap: 16, slides: [conFotos('quad', ['a', 'b', 'c', 'd'])] };
    const calls = render(post);
    expect(calls[0][0]).toBe('clearRect');
    expect(calls.filter((c) => c[0] === 'draw')).toHaveLength(4);
  });
});

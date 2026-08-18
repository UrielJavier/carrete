import { describe, it, expect } from 'vitest';
import { reducer, initialState, HISTORY_MAX } from '../src/state/store.js';

const start = () => initialState();
const ids = (st) => st.post.slides.map((s) => s.cells.map((c) => c.imgId || '.').join('')).join('|');

const withPhotos = (st, list) => {
  let s = st;
  list.forEach(([slideIndex, cellIndex, imgId]) => {
    s = reducer(s, { type: 'patchCell', slideIndex, cellIndex, patch: { imgId } });
  });
  return s;
};

describe('historial de deshacer', () => {
  it('deshace un cambio de layout y recupera las fotos', () => {
    let s = reducer(start(), { type: 'layout', layoutId: 'quad' });
    s = withPhotos(s, [[0, 0, 'a'], [0, 1, 'b'], [0, 2, 'c'], [0, 3, 'd']]);
    expect(ids(s)).toBe('abcd');
    s = reducer(s, { type: 'layout', layoutId: 'full' });
    expect(ids(s)).toBe('a');
    s = reducer(s, { type: 'undo' });
    expect(ids(s)).toBe('abcd');
  });

  it('deshacer con historial vacio no rompe nada', () => {
    const s = start();
    expect(reducer(s, { type: 'undo' })).toEqual(s);
  });

  it('el historial se limita', () => {
    let s = start();
    for (let i = 0; i < HISTORY_MAX + 10; i++) s = reducer(s, { type: 'addSlide' });
    expect(s.history.length).toBeLessThanOrEqual(HISTORY_MAX);
  });

  it('cada entrada guarda la orientacion de las fotos', () => {
    let s = start();
    s = reducer(s, { type: 'putImages', slideIndex: 0, cellIndex: 0, added: [{ id: 'i1', rot: 0, flip: false }] });
    s = reducer(s, { type: 'patchImage', id: 'i1', patch: { rot: 90 }, history: true });
    s = reducer(s, { type: 'undo' });
    expect(s.pendingOrient.i1).toEqual({ rot: 0, flip: false });
  });
});

describe('paginas', () => {
  it('añadir inserta despues de la actual y la deja abierta', () => {
    let s = start();
    s = reducer(s, { type: 'addSlide' });
    expect(s.post.slides).toHaveLength(2);
    expect(s.current).toBe(1);
  });

  it('respeta el tope de Instagram', () => {
    let s = start();
    for (let i = 0; i < 30; i++) s = reducer(s, { type: 'addSlide' });
    expect(s.post.slides).toHaveLength(20);
  });

  it('borrar la 2 deja la 3 convertida en 2', () => {
    let s = start();
    s = reducer(s, { type: 'addSlide' });
    s = reducer(s, { type: 'addSlide' });
    s = withPhotos(s, [[0, 0, 'a'], [1, 0, 'b'], [2, 0, 'c']]);
    s = reducer(s, { type: 'removeSlide', i: 1 });
    expect(ids(s)).toBe('a|c');
  });

  it('borrar la unica pagina deja una vacia', () => {
    let s = withPhotos(start(), [[0, 0, 'a']]);
    s = reducer(s, { type: 'removeSlide', i: 0 });
    expect(s.post.slides).toHaveLength(1);
    expect(ids(s)).toBe('.');
  });

  it('mover deja la pagina abierta en su destino', () => {
    let s = start();
    s = reducer(s, { type: 'addSlide' });
    s = reducer(s, { type: 'addSlide' });
    s = withPhotos(s, [[0, 0, 'a'], [1, 0, 'b'], [2, 0, 'c']]);
    s = reducer(s, { type: 'moveSlide', from: 2, to: 0 });
    expect(ids(s)).toBe('c|a|b');
    expect(s.current).toBe(0);
  });
});

describe('fotos en la pagina', () => {
  it('importar varias rellena los huecos siguientes', () => {
    let s = reducer(start(), { type: 'layout', layoutId: 'quad' });
    s = reducer(s, {
      type: 'putImages', slideIndex: 0, cellIndex: 0,
      added: [{ id: 'i1' }, { id: 'i2' }, { id: 'i3' }],
    });
    expect(s.post.slides[0].cells.map((c) => c.imgId)).toEqual(['i1', 'i2', 'i3', null]);
    expect(s.sel).toEqual({ slideIndex: 0, cellIndex: 0 });
  });

  it('intercambiar no cambia de nivel ni deja seleccion', () => {
    let s = reducer(start(), { type: 'layout', layoutId: 'v2' });
    s = withPhotos(s, [[0, 0, 'a'], [0, 1, 'b']]);
    s = reducer(s, { type: 'swapCells', a: 0, b: 1 });
    expect(s.post.slides[0].cells.map((c) => c.imgId)).toEqual(['b', 'a']);
    expect(s.sel).toBe(null);
    expect(s.level).toBe('page');
  });
});

describe('niveles y subniveles', () => {
  it('cambiar de nivel cierra la herramienta abierta', () => {
    let s = reducer(start(), { type: 'tool', tool: 'layout' });
    s = reducer(s, { type: 'level', level: 'post' });
    expect(s.tool).toBe(null);
  });
});

describe('ajustes del post', () => {
  it('el gap no genera historial en cada paso', () => {
    let s = reducer(start(), { type: 'gap', gap: 8 });
    s = reducer(s, { type: 'gap', gap: 16 });
    expect(s.history).toHaveLength(0);
    expect(s.post.gap).toBe(16);
  });

  it('los demas ajustes si', () => {
    const s = reducer(start(), { type: 'postSetting', patch: { ratio: '1:1' } });
    expect(s.history).toHaveLength(1);
    expect(s.post.ratio).toBe('1:1');
  });
});

import { describe, it, expect } from 'vitest';
import { docImageIds } from '../../src/core/post.js';
import { reducer } from '../../src/state/store.js';
import { postCells, drawRegion } from '../../src/core/geometry.js';
import {
  start, run, withPhotos, makeLibrary, drawnIds, countDrawn, cellGroups, fakeCtx,
} from './mocks.js';

const reducerPut = (s, slideIndex, cellIndex, imgId) =>
  reducer(s, { type: 'patchCell', slideIndex, cellIndex, patch: { imgId } });

function pageDrawnIds(post, getSource, pageIndex) {
  const ctx = fakeCtx();
  drawRegion(ctx, postCells(post), pageIndex, 1440, 1800, post.bg, getSource, post.fill);
  return ctx.calls.filter((c) => c[0] === 'draw').map((c) => c[1]);
}

/**
 * FLUJO de grupos de principio a fin: crear el post, poner fotos, unir un grupo,
 * añadir y quitar celdas, y comprobar en cada paso QUÉ se dibuja (una celda unida
 * enseña la foto del grupo; una suelta la suya) y el estado del modelo.
 */
describe('flujo: ciclo de vida de un grupo', () => {
  const setup = () => {
    const lib = makeLibrary();
    ['a', 'b', 'c', 'd'].forEach((id) => lib.add(id));
    // quad (2×2) con una foto distinta en cada celda
    let s = run(start(), { type: 'layout', layoutId: 'quad' });
    s = withPhotos(s, [[0, 'a'], [1, 'b'], [2, 'c'], [3, 'd']]);
    return { lib, s };
  };

  it('parte de cuatro fotos sueltas, una por celda', () => {
    const { lib, s } = setup();
    expect(drawnIds(s.post, lib.getSource)).toEqual(['a', 'b', 'c', 'd']);
    expect(cellGroups(s)).toEqual([null, null, null, null]);
  });

  it('unir dos celdas hace que compartan UNA foto (la de la primera)', () => {
    const { lib, s: base } = setup();
    const s = run(base, {
      type: 'mergeCells',
      cells: [{ slideIndex: 0, cellIndex: 1 }, { slideIndex: 0, cellIndex: 2 }],
    });
    const gid = s.post.slides[0].cells[1].group;
    expect(gid).toBeTruthy();
    expect(s.post.slides[0].cells[2].group).toBe(gid);
    // el grupo adopta la foto de la 1ª celda unida ('b'); 'c' deja de verse
    expect(s.post.groups[gid].imgId).toBe('b');
    expect(drawnIds(s.post, lib.getSource)).toEqual(['a', 'b', 'b', 'd']);
    expect(countDrawn(s.post, lib.getSource, 'c')).toBe(0);
  });

  it('añadir una celda al grupo extiende la máscara a esa celda', () => {
    const { lib, s: base } = setup();
    let s = run(base, {
      type: 'mergeCells',
      cells: [{ slideIndex: 0, cellIndex: 1 }, { slideIndex: 0, cellIndex: 2 }],
    });
    const gid = s.post.slides[0].cells[1].group;
    s = run(s, { type: 'addToGroup', slideIndex: 0, cellIndex: 3, groupId: gid });
    expect(s.post.slides[0].cells[3].group).toBe(gid);
    // ahora 1,2,3 enseñan la foto del grupo; 'd' deja de verse por su cuenta
    expect(drawnIds(s.post, lib.getSource)).toEqual(['a', 'b', 'b', 'b']);
    expect(countDrawn(s.post, lib.getSource, 'd')).toBe(0);
  });

  it('quitar una celda la devuelve a su propia foto y el grupo sobrevive con 2+', () => {
    const { lib, s: base } = setup();
    let s = run(base, {
      type: 'mergeCells',
      cells: [{ slideIndex: 0, cellIndex: 1 }, { slideIndex: 0, cellIndex: 2 }],
    });
    const gid = s.post.slides[0].cells[1].group;
    s = run(s, { type: 'addToGroup', slideIndex: 0, cellIndex: 3, groupId: gid });
    // quito la 3: el grupo aún tiene 1 y 2, así que sigue vivo
    s = run(s, { type: 'leaveGroup', slideIndex: 0, cellIndex: 3 });
    expect(s.post.slides[0].cells[3].group).toBeUndefined();
    expect(s.post.groups[gid]).toBeTruthy();
    expect(drawnIds(s.post, lib.getSource)).toEqual(['a', 'b', 'b', 'd']);
  });

  it('al bajar de dos celdas, el grupo se disuelve y cada celda recupera su foto', () => {
    const { lib, s: base } = setup();
    let s = run(base, {
      type: 'mergeCells',
      cells: [{ slideIndex: 0, cellIndex: 1 }, { slideIndex: 0, cellIndex: 2 }],
    });
    const gid = s.post.slides[0].cells[1].group;
    s = run(s, { type: 'leaveGroup', slideIndex: 0, cellIndex: 2 });
    expect(cellGroups(s)).toEqual([null, null, null, null]);
    expect(Object.keys(s.post.groups)).toHaveLength(0);
    // vuelve al punto de partida: cada celda con su foto
    expect(drawnIds(s.post, lib.getSource)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('la foto del grupo cuenta como usada (no se barrería como huérfana)', () => {
    const { s: base } = setup();
    const s = run(base, {
      type: 'mergeCells',
      cells: [{ slideIndex: 0, cellIndex: 1 }, { slideIndex: 0, cellIndex: 2 }],
    });
    const gid = s.post.slides[0].cells[1].group;
    const ids = docImageIds(s.post);
    expect(ids.has(s.post.groups[gid].imgId)).toBe(true);
  });
});

describe('flujo: deshacer y rehacer sobre un grupo', () => {
  it('deshacer quita el grupo; rehacer lo devuelve', () => {
    const lib = makeLibrary();
    ['a', 'b', 'c', 'd'].forEach((id) => lib.add(id));
    let s = run(start(), { type: 'layout', layoutId: 'quad' });
    s = withPhotos(s, [[0, 'a'], [1, 'b'], [2, 'c'], [3, 'd']]);
    s = run(s, {
      type: 'mergeCells',
      cells: [{ slideIndex: 0, cellIndex: 1 }, { slideIndex: 0, cellIndex: 2 }],
    });
    expect(drawnIds(s.post, lib.getSource)).toEqual(['a', 'b', 'b', 'd']);

    s = run(s, { type: 'undo' });
    expect(cellGroups(s)).toEqual([null, null, null, null]);
    expect(drawnIds(s.post, lib.getSource)).toEqual(['a', 'b', 'c', 'd']);

    s = run(s, { type: 'redo' });
    expect(drawnIds(s.post, lib.getSource)).toEqual(['a', 'b', 'b', 'd']);
  });
});

/**
 * FLUJO de un grupo que cruza páginas: unir la última celda de la página 1 con la
 * primera de la página 2 y comprobar que ambas enseñan la misma foto.
 */
describe('flujo: grupo entre dos páginas', () => {
  it('las celdas unidas de páginas distintas comparten la foto', () => {
    const lib = makeLibrary();
    lib.add('x');
    lib.add('y');
    let s = run(start(),
      { type: 'layout', layoutId: 'full' },
      { type: 'addSlide' },
      { type: 'layout', layoutId: 'full' });
    // página 0 y 1, cada una una celda 'full'
    s = reducerPut(s, 0, 0, 'x');
    s = reducerPut(s, 1, 0, 'y');
    s = run(s, {
      type: 'mergeCells',
      cells: [{ slideIndex: 0, cellIndex: 0 }, { slideIndex: 1, cellIndex: 0 }],
    });
    const gid = s.post.slides[0].cells[0].group;
    expect(s.post.slides[1].cells[0].group).toBe(gid);
    // la foto del grupo es 'x' (primera unida); ambas páginas la enseñan
    expect(s.post.groups[gid].imgId).toBe('x');
    expect(countDrawn(s.post, lib.getSource, 'x')).toBe(1); // página 0
    // en la página 1 (x0=1) también se dibuja 'x'
    expect(pageDrawnIds(s.post, lib.getSource, 1)).toContain('x');
  });
});

import { describe, it, expect } from 'vitest';
import {
  newPost, newSlide, clonePost, layoutChangeImpact, applyLayout,
  moveSlideTo, swapCells, duplicates, unusedImageIds, upscaleReport, projectBytes,
} from '../src/core/post.js';

const withPhotos = (layoutId, ids) => {
  const s = newSlide(layoutId);
  ids.forEach((id, i) => { if (id) s.cells[i].imgId = id; });
  return s;
};

describe('layoutChangeImpact: avisar solo si se pierde algo', () => {
  it('cuenta lo que se conserva y lo que se pierde', () => {
    const s = withPhotos('quad', ['a', 'b', 'c', 'd']);
    expect(layoutChangeImpact(s, 'full')).toEqual({ kept: 1, lost: 3, holes: 1 });
    expect(layoutChangeImpact(s, 'v2')).toEqual({ kept: 2, lost: 2, holes: 2 });
    expect(layoutChangeImpact(s, 't2b1')).toEqual({ kept: 3, lost: 1, holes: 3 });
  });

  it('no avisa si los huecos que desaparecen estaban vacios', () => {
    const s = withPhotos('quad', ['a', null, null, null]);
    expect(layoutChangeImpact(s, 'full').lost).toBe(0);
  });
});

describe('applyLayout conserva las fotos por indice', () => {
  it('recorta al numero de huecos nuevo', () => {
    const s = withPhotos('quad', ['a', 'b', 'c', 'd']);
    const out = applyLayout(s, 'v2');
    expect(out.cells.map((c) => c.imgId)).toEqual(['a', 'b']);
  });

  it('al crecer añade huecos vacios', () => {
    const s = withPhotos('full', ['a']);
    const out = applyLayout(s, 'quad');
    expect(out.cells.map((c) => c.imgId)).toEqual(['a', null, null, null]);
  });
});

describe('moveSlideTo: insertar, no intercambiar', () => {
  const abcd = ['A', 'B', 'C', 'D'].map((id) => ({ id }));
  const ids = (arr) => arr.map((s) => s.id).join('');

  it('mueve e inserta', () => {
    expect(ids(moveSlideTo(abcd, 0, 2))).toBe('BCAD');
    expect(ids(moveSlideTo(abcd, 3, 0))).toBe('DABC');
    expect(ids(moveSlideTo(abcd, 1, 2))).toBe('ACBD');
  });

  it('no muta el original', () => {
    moveSlideTo(abcd, 0, 3);
    expect(ids(abcd)).toBe('ABCD');
  });
});

describe('swapCells', () => {
  it('el encuadre viaja con la foto', () => {
    const s = withPhotos('v2', ['a', 'b']);
    s.cells[0].t = { scale: 2, fx: 0.3, fy: 0.4 };
    const out = swapCells(s, 0, 1);
    expect(out.cells[1].imgId).toBe('a');
    expect(out.cells[1].t).toEqual({ scale: 2, fx: 0.3, fy: 0.4 });
  });

  it('mover a un hueco vacio lo libera', () => {
    const s = withPhotos('v2', ['a', null]);
    const out = swapCells(s, 0, 1);
    expect(out.cells[0].imgId).toBe(null);
    expect(out.cells[1].imgId).toBe('a');
  });
});

describe('duplicates: por contenido, no por id', () => {
  const images = {
    i1: { key: 'AAA' },
    i2: { key: 'AAA' },  // misma foto importada dos veces
    i3: { key: 'BBB' },
  };

  it('detecta la misma foto con ids distintos', () => {
    const post = { ...newPost(), slides: [withPhotos('full', ['i1']), withPhotos('full', ['i2'])] };
    const d = duplicates(post, images);
    expect(d.groups).toHaveLength(1);
    expect(d.groups[0].pages).toEqual([1, 2]);
  });

  it('no marca fotos distintas', () => {
    const post = { ...newPost(), slides: [withPhotos('full', ['i1']), withPhotos('full', ['i3'])] };
    expect(duplicates(post, images).groups).toHaveLength(0);
  });

  it('detecta la repeticion dentro de una sola pagina', () => {
    const post = { ...newPost(), slides: [withPhotos('v2', ['i1', 'i2'])] };
    expect(duplicates(post, images).groups[0].pages).toEqual([1]);
  });
});

describe('unusedImageIds: el historial retiene las fotos', () => {
  const images = { i1: {}, i2: {}, i3: {}, i4: {} };

  it('sin historial libera las que salieron del post', () => {
    const post = { ...newPost(), slides: [withPhotos('full', ['i1'])] };
    expect(unusedImageIds(post, [], images).sort()).toEqual(['i2', 'i3', 'i4']);
  });

  it('con historial las conserva para poder deshacer', () => {
    const post = { ...newPost(), slides: [withPhotos('full', ['i1'])] };
    const hist = [{ post: { ...newPost(), slides: [withPhotos('quad', ['i1', 'i2', 'i3', 'i4'])] } }];
    expect(unusedImageIds(post, hist, images)).toEqual([]);
  });
});

describe('upscaleReport: donde perdemos calidad de verdad', () => {
  it('una foto de Camera Remote a sangre en 4:5 se amplia un 52%', () => {
    const post = { ...newPost(), slides: [withPhotos('full', ['i1'])] };
    const images = { i1: { w: 1776, h: 1184 } };
    const rep = upscaleReport(post, images);
    expect(rep[0].need).toBe(2700);
    expect(rep[0].factor).toBeCloseTo(1.52, 2);
  });

  it('un original de la X100T sobra resolucion', () => {
    const post = { ...newPost(), slides: [withPhotos('full', ['i1'])] };
    const images = { i1: { w: 4896, h: 3264 } };
    expect(upscaleReport(post, images)[0].factor).toBeLessThan(1);
  });
});

describe('clonePost', () => {
  it('es una copia profunda', () => {
    const p = newPost();
    const c = clonePost(p);
    c.slides[0].cells[0].imgId = 'x';
    expect(p.slides[0].cells[0].imgId).toBe(null);
  });
});

describe('projectBytes: espacio que ocupa un proyecto', () => {
  it('cuenta cada foto una vez aunque este en varias celdas', () => {
    const post = { ...newPost(), slides: [withPhotos('v2', ['i1', 'i1'])] };
    const b = projectBytes(post, { i1: 1000 });
    expect(b.photos).toBe(1000);
    expect(b.count).toBe(1);
  });

  it('suma fotos distintas y añade el peso del documento', () => {
    const post = { ...newPost(), slides: [withPhotos('v2', ['i1', 'i2'])] };
    const b = projectBytes(post, { i1: 1000, i2: 2500 });
    expect(b.photos).toBe(3500);
    expect(b.doc).toBeGreaterThan(0);
    expect(b.total).toBe(b.photos + b.doc);
  });

  it('un post vacio pesa solo su documento', () => {
    const b = projectBytes(newPost(), {});
    expect(b.photos).toBe(0);
    expect(b.count).toBe(0);
    expect(b.total).toBe(b.doc);
  });

  it('ignora fotos sin tamaño conocido', () => {
    const post = { ...newPost(), slides: [withPhotos('v2', ['i1', 'i9'])] };
    expect(projectBytes(post, { i1: 500 }).photos).toBe(500);
  });
});

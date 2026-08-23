import { describe, it, expect } from 'vitest';
import { postCells, groupImageBox, newT } from '../src/core/geometry.js';
import { docImageIds } from '../src/core/post.js';

describe('docImageIds (fotos que referencia un post)', () => {
  it('incluye las fotos de las celdas Y las de los grupos', () => {
    const doc = {
      groups: { g1: { imgId: 'gpic' } },
      slides: [{ cells: [{ imgId: 'a', group: 'g1' }, { imgId: null, group: 'g1' }, { imgId: 'b' }] }],
    };
    const ids = docImageIds(doc);
    expect(ids.has('a')).toBe(true);
    expect(ids.has('b')).toBe(true);
    // la foto compartida del grupo NO puede quedarse fuera (si no, se borraba al refrescar)
    expect(ids.has('gpic')).toBe(true);
  });

  it('tolera un post sin grupos', () => {
    const ids = docImageIds({ slides: [{ cells: [{ imgId: 'a' }] }] });
    expect([...ids]).toEqual(['a']);
  });
});

describe('groupImageBox (cover de la caja del grupo)', () => {
  it('mantiene la proporción de la imagen y cubre la caja, centrado', () => {
    const g = { x: 0.1, y: 0.2, w: 0.6, h: 0.5 };
    const box = groupImageBox(g, 1440, 1800, 1.5);
    // aspecto en px = ia
    expect((box.w * 1440) / (box.h * 1800)).toBeCloseTo(1.5, 3);
    // cubre la caja (ambas dimensiones >=)
    expect(box.w).toBeGreaterThanOrEqual(g.w - 1e-9);
    expect(box.h).toBeGreaterThanOrEqual(g.h - 1e-9);
    // centrado
    expect(box.x + box.w / 2).toBeCloseTo(g.x + g.w / 2, 6);
    expect(box.y + box.h / 2).toBeCloseTo(g.y + g.h / 2, 6);
  });
});

describe('postCells con grupos', () => {
  const post = {
    ratio: '1:1',
    gap: 0,
    groups: { g1: { imgId: 'a' } },
    slides: [{
      id: 's1',
      layoutId: 'v2',
      cells: [
        { imgId: 'a', t: newT(), group: 'g1' },
        { imgId: null, t: newT(), group: 'g1' },
      ],
    }],
  };

  it('marca las celdas del grupo con su caja envolvente y la foto del grupo', () => {
    const cells = postCells(post);
    expect(cells.length).toBe(2);
    for (const c of cells) {
      expect(c.group).toBe('g1');
      expect(c.groupImgId).toBe('a');
      // la caja del grupo abarca las dos celdas: casi todo el ancho de la página
      expect(c.groupRect.w).toBeCloseTo(1, 2);
      expect(c.groupRect.h).toBeCloseTo(1, 2);
    }
  });
});

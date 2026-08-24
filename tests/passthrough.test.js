import { describe, it, expect } from 'vitest';
import { newPost, newSlide, passthroughImage } from '../src/core/post.js';
import { newT } from '../src/core/geometry.js';

/**
 * Elegibilidad para entregar el fichero ORIGINAL sin recomprimir (máxima calidad).
 * Solo cuando la página es una foto/vídeo a marco completo, sin recomponer y con el
 * mismo aspecto que el post.
 */
const build = (ratio, { layoutId = 'full', imgId = 'a', scale = 1, group, im } = {}) => {
  const sl = newSlide(layoutId);
  sl.cells[0] = { imgId, t: { ...newT(), scale }, ...(group ? { group } : {}) };
  const post = { ...newPost(), ratio, slides: [sl] };
  const images = { a: { file: {}, w: 1000, h: 1000, rot: 0, flip: false, ...im } };
  return { post, images };
};

describe('passthroughImage (entregar el original sin recomprimir)', () => {
  it('elegible: foto a marco completo, scale 1, aspecto == ratio', () => {
    const { post, images } = build('1:1');
    expect(passthroughImage(post, images, 0)).toBe(images.a);
  });

  it('NO elegible si hay zoom (scale != 1)', () => {
    const { post, images } = build('1:1', { scale: 1.4 });
    expect(passthroughImage(post, images, 0)).toBeNull();
  });

  it('NO elegible si el aspecto de la foto no coincide con el ratio', () => {
    const { post, images } = build('1:1', { im: { w: 1000, h: 1500 } }); // 2:3 vs 1:1
    expect(passthroughImage(post, images, 0)).toBeNull();
  });

  it('NO elegible si la celda pertenece a un grupo', () => {
    const { post, images } = build('1:1', { group: 'g1' });
    expect(passthroughImage(post, images, 0)).toBeNull();
  });

  it('NO elegible si la foto está girada o espejada', () => {
    const a = build('1:1', { im: { rot: 90 } });
    expect(passthroughImage(a.post, a.images, 0)).toBeNull();
    const b = build('1:1', { im: { flip: true } });
    expect(passthroughImage(b.post, b.images, 0)).toBeNull();
  });

  it('NO elegible con un layout de varias celdas', () => {
    const { post, images } = build('1:1', { layoutId: 'quad' });
    expect(passthroughImage(post, images, 0)).toBeNull();
  });

  it('NO elegible si no hay foto o no hay fichero', () => {
    const sinImg = build('1:1', { imgId: null });
    expect(passthroughImage(sinImg.post, sinImg.images, 0)).toBeNull();
    const sinFile = build('1:1', { im: { file: null } });
    expect(passthroughImage(sinFile.post, sinFile.images, 0)).toBeNull();
  });

  it('usa la resolución del original (srcW/srcH) para el aspecto', () => {
    // preview 1000×1000 pero original 3:4 → no coincide con 1:1
    const { post, images } = build('1:1', { im: { srcW: 3000, srcH: 4000 } });
    expect(passthroughImage(post, images, 0)).toBeNull();
  });

  it('vale para vídeo (misma regla)', () => {
    const { post, images } = build('1:1', { im: { type: 'video' } });
    expect(passthroughImage(post, images, 0)).toBe(images.a);
  });
});

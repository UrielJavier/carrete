import { describe, it, expect } from 'vitest';
import { pixelToSRGB, contrastOn, srgbDecode, srgbEncode } from '../src/core/color.js';

describe('curva sRGB', () => {
  it('codificar y decodificar son inversas', () => {
    for (const v of [0, 0.02, 0.2, 0.5, 0.9, 1]) {
      expect(srgbDecode(srgbEncode(v))).toBeCloseTo(v, 10);
    }
  });
});

describe('conversion de perfil', () => {
  it('el blanco y el negro no se mueven', () => {
    for (const cs of ['AdobeRGB', 'DisplayP3', 'ProPhoto']) {
      const w = pixelToSRGB(255, 255, 255, cs);
      w.forEach((c) => expect(c).toBeCloseTo(255, 0));
      const b = pixelToSRGB(0, 0, 0, cs);
      b.forEach((c) => expect(c).toBeCloseTo(0, 0));
    }
  });

  it('Adobe RGB satura al pasar a sRGB, que es el sintoma que corrige', () => {
    const [r, g, b] = pixelToSRGB(0, 200, 0, 'AdobeRGB');
    expect(g).toBeGreaterThan(200);   // el verde se recoloca fuera de gama
    expect(r).toBeLessThan(60);
    expect(b).toBeLessThan(60);
  });

  it('un perfil desconocido no toca los pixeles', () => {
    expect(pixelToSRGB(12, 34, 56, 'unknown')).toEqual([12, 34, 56]);
  });
});

describe('contrastOn: tinta legible sobre el fondo', () => {
  it('elige negro sobre claros y blanco sobre oscuros', () => {
    expect(contrastOn('#ffffff')).toBe('#111111');
    expect(contrastOn('#000000')).toBe('#ffffff');
    expect(contrastOn('#e7e2d8')).toBe('#111111');
    expect(contrastOn('#1a4fd6')).toBe('#ffffff');
    expect(contrastOn('#f5c542')).toBe('#111111');
  });
});

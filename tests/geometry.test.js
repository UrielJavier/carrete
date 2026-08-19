import { describe, it, expect } from 'vitest';
import {
  imageUnits, clampT, newT, postCells, edgeInset, drawnWidth, stageMetrics,
} from '../src/core/geometry.js';
import { RATIOS } from '../src/core/layouts.js';
import { newPost, newSlide } from '../src/core/post.js';

const post = (over = {}) => ({ ...newPost(), ...over });

describe('imageUnits: la foto entra entera en la celda (contain)', () => {
  it('una foto mas ancha entra a lo ancho y deja hueco arriba/abajo', () => {
    const u = imageUnits(1, 0.8, 1.5);
    expect(u.dwU).toBe(1);
    expect(u.dhU).toBeCloseTo(0.5333, 4);
  });

  it('una foto mas estrecha entra a lo alto y deja hueco a los lados', () => {
    const u = imageUnits(1, 1.5, 0.8);
    expect(u.dhU).toBe(1);
    expect(u.dwU).toBeCloseTo(0.5333, 4);
  });

  it('el zoom multiplica los dos ejes', () => {
    const a = imageUnits(1, 0.8, 1.5);
    const b = imageUnits(2, 0.8, 1.5);
    expect(b.dwU / a.dwU).toBeCloseTo(2, 10);
    expect(b.dhU / a.dhU).toBeCloseTo(2, 10);
  });
});

describe('clampT: centra sin zoom y da libertad con zoom', () => {
  it('a zoom 1 la foto entra entera y queda centrada, sin libertad', () => {
    const t = clampT({ scale: 1, fx: 0.1, fy: 0.1 }, 0.8, 1.5);
    expect(t.fx).toBeCloseTo(0.5, 10);
    expect(t.fy).toBeCloseTo(0.5, 10);
  });

  it('con zoom aparece libertad en los dos ejes', () => {
    const t = clampT({ scale: 3, fx: 0.3, fy: 0.4 }, 0.8, 1.5);
    expect(t.fx).toBeCloseTo(0.3, 10);
    expect(t.fy).toBeCloseTo(0.4, 10);
  });

  it('el zoom nunca baja de 1 ni sube de 8', () => {
    expect(clampT({ scale: 0.2, fx: 0.5, fy: 0.5 }, 1, 1).scale).toBe(1);
    expect(clampT({ scale: 99, fx: 0.5, fy: 0.5 }, 1, 1).scale).toBe(8);
  });

  it('es idempotente: reaplicarlo no mueve nada', () => {
    const a = clampT({ scale: 2.4, fx: 0.05, fy: 0.9 }, 0.75, 1.6);
    const b = clampT(a, 0.75, 1.6);
    expect(b).toEqual(a);
  });
});

describe('preview y export coinciden al pixel', () => {
  /* Este es EL invariante de la aplicacion: la misma transformacion aplicada a
     dos resoluciones distintas debe producir el mismo encuadre. */
  const place = (cellAspect, imgAspect, t, cw) => {
    const tc = clampT(t, cellAspect, imgAspect);
    const u = imageUnits(tc.scale, cellAspect, imgAspect);
    const ch = cw / cellAspect;
    return {
      left: (0.5 - tc.fx * u.dwU) * cw,
      top: (0.5 - tc.fy * u.dhU) * ch,
      w: u.dwU * cw,
      h: u.dhU * ch,
    };
  };

  it('coincide en cientos de combinaciones', () => {
    let worst = 0;
    for (const ca of [0.5, 0.8, 1, 1.5, 2.4]) {
      for (const ia of [0.667, 1, 1.5, 3]) {
        for (const scale of [1, 1.4, 2.2, 3.9]) {
          for (const fx of [0.1, 0.5, 0.9]) {
            for (const fy of [0.1, 0.5, 0.9]) {
              const t = { scale, fx, fy };
              const small = place(ca, ia, t, 360);
              const big = place(ca, ia, t, 1440);
              const k = 1440 / 360;
              for (const key of ['left', 'top', 'w', 'h']) {
                expect(Number.isFinite(small[key])).toBe(true);
                worst = Math.max(worst, Math.abs(small[key] * k - big[key]));
              }
            }
          }
        }
      }
    }
    expect(worst).toBeLessThan(1e-9);
  });
});

describe('edgeInset y el gap', () => {
  it('el valor elegido es la separacion real en bordes y costuras', () => {
    const G = 16;
    const R = RATIOS['4:5'];
    for (const layoutId of ['quad', 'v3', 'h2', 'full']) {
      const p = post({ gap: G, slides: [newSlide(layoutId)] });
      const cs = postCells(p);
      const left = Math.min(...cs.map((c) => c.rect.x)) * R.w;
      const right = (1 - Math.max(...cs.map((c) => c.rect.x + c.rect.w))) * R.w;
      const top = Math.min(...cs.map((c) => c.rect.y)) * R.h;
      const bottom = (1 - Math.max(...cs.map((c) => c.rect.y + c.rect.h))) * R.h;
      expect(left).toBeCloseTo(G, 6);
      expect(right).toBeCloseTo(G, 6);
      expect(top).toBeCloseTo(G, 6);
      expect(bottom).toBeCloseTo(G, 6);

      let seam = null;
      for (const a of cs) {
        for (const b of cs) {
          const d = (b.rect.x - (a.rect.x + a.rect.w)) * R.w;
          if (d > 0.01) seam = seam === null ? d : Math.min(seam, d);
        }
      }
      if (seam !== null) expect(seam).toBeCloseTo(G, 6);
    }
  });

  it('una arista compartida recibe la mitad por cada lado', () => {
    expect(edgeInset(true, 16)).toBe(16);
    expect(edgeInset(false, 16)).toBe(8);
  });

  it('con gap 0 las celdas se tocan exactamente', () => {
    const cs = postCells(post({ gap: 0, slides: [newSlide('quad')] }));
    expect(cs[0].rect.x + cs[0].rect.w).toBeCloseTo(cs[1].rect.x, 10);
  });
});

describe('postCells: espacio de post', () => {
  it('la pagina i ocupa la region [i, i+1]', () => {
    const p = post({ slides: [newSlide('full'), newSlide('full'), newSlide('full')] });
    const cs = postCells(p);
    expect(cs[0].rect.x).toBeCloseTo(0, 10);
    expect(cs[1].rect.x).toBeCloseTo(1, 10);
    expect(cs[2].rect.x).toBeCloseTo(2, 10);
  });

  it('cellAspect tiene en cuenta la proporcion del post', () => {
    const cs = postCells(post({ ratio: '1:1', slides: [newSlide('v2')] }));
    expect(cs[0].cellAspect).toBeCloseTo(0.5, 10);
  });
});

describe('drawnWidth: ancho de dibujo en contain', () => {
  it('una foto horizontal a sangre en 4:5 entra por el ancho de la celda', () => {
    const cs = postCells(post({ slides: [newSlide('full')] }));
    const need = drawnWidth({ ...cs[0], t: newT() }, 1776 / 1184, 1440);
    /* Contain: la apaisada encaja por el ancho de la celda (el lienzo), sin exigir
       más ancho; y cabe de sobra en el original (no amplía). */
    expect(Math.round(need)).toBe(1440);
    expect(need).toBeLessThan(1776);
  });
});

describe('stageMetrics: el area mide lo mismo en los tres niveles', () => {
  it('la altura no depende del nivel', () => {
    const a = stageMetrics(361, 850, '4:5', 'post');
    const b = stageMetrics(361, 850, '4:5', 'page');
    const c = stageMetrics(361, 850, '4:5', 'photo');
    expect(a.areaH).toBe(b.areaH);
    expect(b.areaH).toBe(c.areaH);
  });

  it('en Foto la pagina crece y llena el area', () => {
    const page = stageMetrics(361, 850, '4:5', 'page');
    const photo = stageMetrics(361, 850, '4:5', 'photo');
    expect(photo.stageW).toBeGreaterThan(page.stageW);
    expect(photo.stageH).toBeCloseTo(photo.areaH, 0);
  });

  it('la pagina mantiene la proporcion exacta', () => {
    for (const ratio of Object.keys(RATIOS)) {
      const m = stageMetrics(361, 850, ratio, 'page');
      const R = RATIOS[ratio];
      expect(m.stageH / m.stageW).toBeCloseTo(R.h / R.w, 2);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { rotSize, turnFocal, mirrorFocal } from '../src/core/geometry.js';
import { splitRotation } from '../src/core/post.js';

describe('rotSize: caja envolvente', () => {
  it('con multiplos de 90 intercambia ancho y alto', () => {
    expect(rotSize(1600, 1200, 0)).toEqual({ w: 1600, h: 1200 });
    const r90 = rotSize(1600, 1200, 90);
    expect(r90.w).toBeCloseTo(1200, 6);
    expect(r90.h).toBeCloseTo(1600, 6);
  });

  it('con angulos libres la caja crece', () => {
    const r = rotSize(1600, 1200, 2);
    expect(r.w).toBeGreaterThan(1600);
    expect(r.h).toBeGreaterThan(1200);
  });

  it('a 45 grados una foto horizontal da una caja cuadrada', () => {
    const r = rotSize(1600, 1200, 45);
    expect(r.w).toBeCloseTo(r.h, 6);
  });
});

describe('turnFocal: el encuadre viaja con la foto', () => {
  const W = 1600;
  const H = 1200;

  it('cuatro giros de 90 devuelven el punto original', () => {
    let t = { scale: 1, fx: 0.2, fy: 0.3 };
    for (let i = 0; i < 4; i++) {
      t = turnFocal(t, 90, rotSize(W, H, i * 90), rotSize(W, H, (i + 1) * 90), false);
    }
    expect(t.fx).toBeCloseTo(0.2, 10);
    expect(t.fy).toBeCloseTo(0.3, 10);
  });

  it('el centro nunca se mueve', () => {
    for (const deg of [1, 2, 45, 90, 180]) {
      const t = turnFocal({ scale: 1, fx: 0.5, fy: 0.5 }, deg, rotSize(W, H, 0), rotSize(W, H, deg), false);
      expect(t.fx).toBeCloseTo(0.5, 10);
      expect(t.fy).toBeCloseTo(0.5, 10);
    }
  });

  it('conserva el zoom', () => {
    const t = turnFocal({ scale: 2.7, fx: 0.3, fy: 0.4 }, 90, rotSize(W, H, 0), rotSize(W, H, 90), false);
    expect(t.scale).toBe(2.7);
  });

  it('con espejo el sentido se invierte', () => {
    const a = turnFocal({ scale: 1, fx: 0.2, fy: 0.5 }, 30, rotSize(W, H, 0), rotSize(W, H, 30), false);
    const b = turnFocal({ scale: 1, fx: 0.2, fy: 0.5 }, 30, rotSize(W, H, 0), rotSize(W, H, 30), true);
    expect(a.fy).not.toBeCloseTo(b.fy, 4);
  });
});

describe('mirrorFocal', () => {
  it('es su propia inversa', () => {
    const t = { scale: 2, fx: 0.1, fy: 0.7 };
    const back = mirrorFocal(mirrorFocal(t));
    expect(back.scale).toBe(t.scale);
    expect(back.fx).toBeCloseTo(t.fx, 12);
    expect(back.fy).toBeCloseTo(t.fy, 12);
  });

  it('lo que estaba a un tercio de la izquierda queda a un tercio de la derecha', () => {
    expect(mirrorFocal({ scale: 1, fx: 1 / 3, fy: 0.5 }).fx).toBeCloseTo(2 / 3, 10);
  });
});

describe('splitRotation: vuelta y ajuste son independientes', () => {
  it('descompone correctamente', () => {
    expect(splitRotation(0)).toEqual({ base: 0, off: 0 });
    expect(splitRotation(1.5)).toEqual({ base: 0, off: 1.5 });
    expect(splitRotation(88.5)).toEqual({ base: 90, off: -1.5 });
    expect(splitRotation(91.5)).toEqual({ base: 90, off: 1.5 });
    expect(splitRotation(271)).toEqual({ base: 270, off: 1 });
    expect(splitRotation(358.5)).toEqual({ base: 0, off: -1.5 });
  });

  it('cambiar de vuelta conserva el ajuste', () => {
    const { off } = splitRotation(91.5);
    for (const base of [0, 90, 180, 270]) {
      expect(splitRotation(base + off).off).toBeCloseTo(off, 10);
    }
  });
});

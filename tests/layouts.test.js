import { describe, it, expect } from 'vitest';
import { LAYOUTS } from '../src/core/layouts.js';

/* Cada layout debe PARTIR la página: las celdas cubren [0,1]×[0,1] sin salirse y sin
   dejar hueco. El área total (suma de w*h) tiene que dar 1. Es un guardarraíl para
   que añadir layouts nuevos no meta huecos ni solapes por un número mal puesto. */
describe('LAYOUTS', () => {
  for (const [key, layout] of Object.entries(LAYOUTS)) {
    it(`"${key}" cubre la página exactamente`, () => {
      expect(layout.cells.length).toBeGreaterThan(0);
      let area = 0;
      for (const c of layout.cells) {
        expect(c.x).toBeGreaterThanOrEqual(-1e-9);
        expect(c.y).toBeGreaterThanOrEqual(-1e-9);
        expect(c.x + c.w).toBeLessThanOrEqual(1 + 1e-9);
        expect(c.y + c.h).toBeLessThanOrEqual(1 + 1e-9);
        expect(c.w).toBeGreaterThan(0);
        expect(c.h).toBeGreaterThan(0);
        area += c.w * c.h;
      }
      expect(area).toBeCloseTo(1, 5);
    });

    it(`"${key}" tiene nombre`, () => {
      expect(typeof layout.name).toBe('string');
      expect(layout.name.length).toBeGreaterThan(0);
    });
  }
});

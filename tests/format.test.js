import { describe, it, expect } from 'vitest';
import { weight } from '../src/core/format.js';

describe('weight', () => {
  it('escala la unidad', () => {
    expect(weight(900)).toBe('900 B');
    expect(weight(520192)).toBe('508 kB');
    expect(weight(751811)).toBe('734 kB');
    expect(weight(1024 * 1024)).toBe('1,0 MB');
    expect(weight(4200000)).toBe('4,0 MB');
    expect(weight(3.5 * 1024 * 1024 * 1024)).toBe('3,50 GB');
  });

  it('devuelve vacio si no hay dato', () => {
    expect(weight(null)).toBe('');
    expect(weight(undefined)).toBe('');
  });
});

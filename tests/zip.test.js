import { describe, it, expect } from 'vitest';
import { safeName } from '../src/features/export/zipShots.js';

describe('safeName: nombre de fichero a partir del proyecto', () => {
  it('quita acentos y espacios', () => {
    expect(safeName('Verano en Bermeo')).toBe('verano-en-bermeo');
    expect(safeName('Mañana río')).toBe('manana-rio');
  });

  it('quita lo que no vale en un nombre de fichero', () => {
    expect(safeName('post/final: 2026?')).toBe('postfinal-2026');
  });

  it('tiene respaldo si no queda nada', () => {
    expect(safeName('')).toBe('carrete');
    expect(safeName('///')).toBe('carrete');
    expect(safeName(null)).toBe('carrete');
  });
});

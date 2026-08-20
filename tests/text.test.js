import { describe, it, expect } from 'vitest';
import { wrapLines, newText, fontCss, FONTS } from '../src/core/text.js';

/* Medidor de mentira: cada carácter mide 10px. Así el wrap es predecible sin
   canvas real (jsdom no mide texto). */
const measure = (str) => str.length * 10;

describe('wrapLines', () => {
  it('deja una línea corta como está', () => {
    expect(wrapLines(measure, 'hola', 1000)).toEqual(['hola']);
  });

  it('envuelve por palabras cuando no cabe', () => {
    // "aaa bbb ccc" con ancho 60 => cabe "aaa bbb"? "aaa bbb"=70>60, así que parte
    expect(wrapLines(measure, 'aaa bbb ccc', 60)).toEqual(['aaa', 'bbb', 'ccc']);
  });

  it('respeta los saltos de línea explícitos', () => {
    expect(wrapLines(measure, 'a\nb', 1000)).toEqual(['a', 'b']);
  });

  it('una palabra más ancha que la caja se queda sola, no se parte', () => {
    expect(wrapLines(measure, 'superlargo', 30)).toEqual(['superlargo']);
  });

  it('contenido vacío da una línea vacía', () => {
    expect(wrapLines(measure, '', 100)).toEqual(['']);
  });
});

describe('newText', () => {
  it('trae valores por defecto y un id', () => {
    const t = newText();
    expect(t.id).toBeTruthy();
    expect(t.x).toBe(0.5);
    expect(t.y).toBe(0.5);
    expect(t.align).toBe('center');
    expect(t.font).toBe('sans');
  });

  it('acepta overrides', () => {
    expect(newText({ content: 'hey', color: '#fff' })).toMatchObject({ content: 'hey', color: '#fff' });
  });
});

describe('fontCss', () => {
  it('devuelve el css de la fuente pedida', () => {
    expect(fontCss('serif')).toContain('Playfair');
  });
  it('cae a la primera si la clave no existe', () => {
    expect(fontCss('noexiste')).toBe(FONTS[0].css);
  });
});

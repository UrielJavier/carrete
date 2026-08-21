/**
 * TEXTOS. Capa que va SIEMPRE por encima de las fotos (nunca debajo). Cada página
 * guarda un array ordenado `texts`: el orden del array ES el orden de pintado, así
 * que "adelante/atrás" es mover un peldaño en el array, sin números de z-index.
 *
 * Un texto vive en espacio de PÁGINA, normalizado (0..1): posición del ANCLA
 * (centro de la caja), ancho de caja y tamaño como fracciones. Así el mismo texto
 * se ve idéntico en el editor, el feed, la miniatura y el export, a cualquier
 * resolución —el mismo principio que las fotos.
 */

import { uid } from './layouts.js';

/* Familias empaquetadas en local (sin CDN). El `css` se usa TAL CUAL tanto en el
   DOM del editor como en `ctx.font` del canvas, así que la fuente es la misma. */
export const FONTS = [
  { key: 'sans', label: 'Sans', css: "'Inter', system-ui, sans-serif" },
  { key: 'serif', label: 'Serif', css: "'Playfair Display', Georgia, serif" },
  { key: 'hand', label: 'Escrita', css: "'Caveat', cursive" },
  { key: 'mono', label: 'Mono', css: 'ui-monospace, Menlo, monospace' },
];

export function fontCss(key) {
  return (FONTS.find((f) => f.key === key) || FONTS[0]).css;
}

/** Familias que hay que asegurar cargadas antes de exportar (para el canvas). */
export const FONT_FAMILIES = ["'Inter'", "'Playfair Display'", "'Caveat'"];

/**
 * El canvas dibuja con la fuente de REPUESTO si la real aún no está cargada (los
 * navegadores solo la piden cuando se usa). Antes de exportar hay que forzar su
 * carga o el fichero saldría con otra tipografía distinta a la del editor.
 */
export async function ensureFonts() {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.all(FONT_FAMILIES.map((f) => document.fonts.load(`16px ${f}`)));
    await document.fonts.ready;
  } catch (e) { /* si falla, se cae a la de repuesto */ }
}

export const LINE_HEIGHT = 1.25;

/* Tamaños de letra como fracción de la altura de página, en pasos con "puntitos"
   (como el gap). Cubren desde un pie de foto discreto hasta un titular grande. */
export const SIZE_STEPS = [0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.11, 0.13, 0.16, 0.19, 0.23, 0.28];

/** Índice del paso más cercano a un valor (para arrancar el deslizador). */
export function nearestStep(steps, value) {
  let best = 0;
  let bestD = Infinity;
  steps.forEach((v, i) => {
    const d = Math.abs(v - value);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}

export function newText(overrides = {}) {
  return {
    id: uid(),
    content: 'Texto',
    x: 0.5,       // ancla (centro) X, 0..1 de la página
    y: 0.5,       // ancla (centro) Y, 0..1 de la página
    w: 0.8,       // ancho de caja, 0..1 del ancho de página
    size: 0.09,   // altura de fuente, fracción de la altura de página
    color: '#111111',
    font: 'sans',
    rot: 0,       // grados, horario
    align: 'center',
    ...overrides,
  };
}

/**
 * Parte el contenido en líneas para un ancho máximo. Respeta los saltos de línea
 * explícitos y envuelve por palabras (una palabra más ancha que la caja se queda
 * sola en su línea, no se parte). `measure(str)` devuelve el ancho en px del texto
 * con la fuente ya fijada en el contexto. Puro: cubierto por tests.
 */
export function wrapLines(measure, content, maxWidth) {
  const out = [];
  const paras = String(content ?? '').split('\n');
  for (const para of paras) {
    const words = para.split(/(\s+)/).filter((w) => w !== '');
    if (!words.length) { out.push(''); continue; }
    let line = '';
    for (const word of words) {
      if (/^\s+$/.test(word)) { line += word; continue; }
      const tryLine = line + word;
      if (line !== '' && measure(tryLine.trimEnd()) > maxWidth) {
        out.push(line.trimEnd());
        line = word;
      } else {
        line = tryLine;
      }
    }
    out.push(line.trimEnd());
  }
  return out;
}

/**
 * Pinta los textos de una página sobre `ctx`, en un lienzo de sw×sh. Se llama
 * DESPUÉS de las fotos, así el texto queda siempre encima. Recorre el array en
 * orden: el último se pinta el último y queda arriba del todo.
 */
export function drawTexts(ctx, texts, sw, sh) {
  if (!texts || !texts.length) return;
  for (const t of texts) {
    const px = Math.max(1, (t.size || 0.09) * sh);
    ctx.save();
    ctx.font = `${px}px ${fontCss(t.font)}`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = t.color || '#111111';
    const maxW = Math.max(1, (t.w ?? 0.8) * sw);
    const lines = wrapLines((str) => ctx.measureText(str).width, t.content, maxW);
    const lineH = px * LINE_HEIGHT;
    const totalH = lines.length * lineH;

    ctx.translate((t.x ?? 0.5) * sw, (t.y ?? 0.5) * sh);
    if (t.rot) ctx.rotate((t.rot * Math.PI) / 180);

    /* La caja está centrada en el ancla; la alineación coloca cada línea dentro. */
    const align = t.align || 'center';
    ctx.textAlign = align;
    const ax = align === 'left' ? -maxW / 2 : align === 'right' ? maxW / 2 : 0;
    let y = -totalH / 2 + lineH / 2;
    for (const line of lines) {
      ctx.fillText(line, ax, y);
      y += lineH;
    }
    ctx.restore();
  }
}

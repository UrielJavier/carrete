/**
 * GEOMETRIA. Todo el modulo es puro y es donde vivieron todos los bugs de la
 * primera version, asi que es lo que esta cubierto por tests.
 *
 * Dos ideas sostienen el resto de la aplicacion:
 *
 * 1. ESPACIO DEL POST. El post es un lienzo continuo. Las celdas no pertenecen a
 *    una pagina: viven en espacio de post, donde x se mide en unidades de pagina
 *    (0..N) e y en 0..1. Una pagina es solo una VENTANA DE RECORTE: la pagina i
 *    es la region [i, i+1]. Una celda con { x: .5, w: 1 } ocupa media pagina 1 y
 *    media pagina 2, y el renderizador ya la dibuja bien.
 *
 * 2. TODO RELATIVO. Ni el preview ni el clamp usan pixeles medidos: la foto se
 *    coloca en multiplos del tamaño de su celda. Lo que ajustas sobre un preview
 *    de 1600px se aplica identico al exportar desde el original de 26MP.
 */

import { LAYOUTS, RATIOS, TRANSPARENT, clamp } from './layouts.js';

/**
 * Tamaño de la foto en multiplos del tamaño de su celda. Sin pixeles.
 *
 * A scale 1 la foto ENCAJA entera dentro de la celda (contain): el eje que
 * limita toca los bordes y el otro deja hueco, que se rellena con el color de
 * fondo. El zoom (scale > 1) la agranda desde ahi, y a partir de cierto punto
 * cubre y recorta. Asi la foto nunca se deforma y llenar la celda es opcional.
 */
export function imageUnits(scale, cellAspect, imgAspect) {
  const wider = imgAspect > cellAspect;
  return {
    dwU: (wider ? 1 : imgAspect / cellAspect) * scale,
    dhU: (wider ? cellAspect / imgAspect : 1) * scale,
  };
}

/**
 * Clamp del punto focal: la foto siempre cubre la celda, asi que nunca aparece
 * hueco vacio ni puede invadir la celda vecina. Invariante a la resolucion.
 */
export function clampT(t, cellAspect, imgAspect) {
  const scale = clamp(t.scale, 1, 8);
  const u = imageUnits(scale, cellAspect, imgAspect);
  const hx = Math.min(0.5, 0.5 / u.dwU);
  const hy = Math.min(0.5, 0.5 / u.dhU);
  return { scale, fx: clamp(t.fx, hx, 1 - hx), fy: clamp(t.fy, hy, 1 - hy) };
}

export const newT = () => ({ scale: 1, fx: 0.5, fy: 0.5 });

/**
 * El gap es la separacion VISIBLE, no un margen por celda. En cada costura
 * interior se reparte a medias entre las dos celdas que la comparten
 * (gap/2 + gap/2 = gap) y en el borde de la pagina se aplica entero.
 *
 * Cada pagina se trata como una pieza cerrada: su borde es borde aunque haya
 * otra pagina al lado. Se probo lo contrario y se descarto, porque mirando una
 * pagina sola la imagen no quedaba centrada.
 */
export function edgeInset(isOuter, g) {
  return isOuter ? g : g / 2;
}

/** Aplana el post a celdas en espacio de post, con el gap ya aplicado. */
export function postCells(post) {
  const R = RATIOS[post.ratio];
  const gx = post.gap / R.w;
  const gy = post.gap / R.h;
  const E = 1e-6;
  const out = [];
  post.slides.forEach((s, i) => {
    LAYOUTS[s.layoutId].cells.forEach((c, ci) => {
      const insL = edgeInset(c.x <= E, gx);
      const insR = edgeInset(c.x + c.w >= 1 - E, gx);
      const insT = edgeInset(c.y <= E, gy);
      const insB = edgeInset(c.y + c.h >= 1 - E, gy);
      const rect = {
        x: i + c.x + insL,
        y: c.y + insT,
        w: Math.max(0.001, c.w - insL - insR),
        h: Math.max(0.001, c.h - insT - insB),
      };
      out.push({
        slideIndex: i,
        cellIndex: ci,
        rect,
        cellAspect: (rect.w * R.w) / (rect.h * R.h),
        imgId: s.cells[ci].imgId,
        t: s.cells[ci].t,
        trim: s.cells[ci].trim,
      });
    });
  });
  return out;
}

/**
 * Dibuja la region [x0, x0+1] del lienzo del post. La usan el preview del feed,
 * las miniaturas y el export: una sola fuente de verdad, asi que lo que ves es
 * lo que exportas.
 */
/* Fracción del ancho del lienzo usada como radio de desenfoque del relleno. Relativa
   a la resolución, así el preview y el export se ven igual. */
const BLUR_FRAC = 0.022;

export function drawRegion(ctx, cells, x0, sw, sh, bg, getSource, fill) {
  /* Un fondo transparente deja los huecos vacios con alfa 0, para poder componer
     la pagina sobre un video en otra herramienta. Ojo: Instagram no admite
     transparencia y aplana el alfa, asi que esto es un paso intermedio, no algo
     que se suba tal cual. */
  if (bg === TRANSPARENT) {
    ctx.clearRect(0, 0, sw, sh);
  } else {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, sw, sh);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  for (const cell of cells) {
    if (cell.rect.x + cell.rect.w <= x0 + 1e-4) continue;
    if (cell.rect.x >= x0 + 1 - 1e-4) continue;
    if (!cell.imgId) continue;
    const src = getSource(cell.imgId);
    if (!src) continue;
    const rx = (cell.rect.x - x0) * sw;
    const ry = cell.rect.y * sh;
    const rw = cell.rect.w * sw;
    const rh = cell.rect.h * sh;
    const ia = src.w / src.h;
    const t = clampT(cell.t, cell.cellAspect, ia);
    const u = imageUnits(t.scale, cell.cellAspect, ia);
    const dw = u.dwU * rw;
    const dh = u.dhU * rh;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rx, ry, rw, rh);
    ctx.clip();
    /* Relleno de huecos con la propia foto ampliada y borrosa (en vez del color):
       se cubre la celda entera con la imagen a COVER, oversized, desenfocada; luego
       encima va la foto nítida en contain. */
    if (fill === 'blur') {
      const cellA = rw / rh;
      let bw = ia > cellA ? rh * ia : rw;
      let bh = ia > cellA ? rh : rw / ia;
      bw *= 1.08; bh *= 1.08;
      ctx.filter = `blur(${Math.max(1, sw * BLUR_FRAC)}px)`;
      ctx.drawImage(src.el, rx + (rw - bw) / 2, ry + (rh - bh) / 2, bw, bh);
      ctx.filter = 'none';
    }
    ctx.drawImage(src.el, rx + rw / 2 - t.fx * dw, ry + rh / 2 - t.fy * dh, dw, dh);
    ctx.restore();
  }
}

/**
 * Ancho de dibujo en px de export. Solo depende de los aspectos, no de la
 * resolucion de origen, asi que sirve para saber si una foto se esta ampliando.
 */
export function drawnWidth(cell, imgAspect, sw) {
  return imageUnits(clamp(cell.t.scale, 1, 8), cell.cellAspect, imgAspect).dwU * cell.rect.w * sw;
}

/**
 * Caja envolvente de una imagen girada un angulo cualquiera. Con multiplos de 90
 * se reduce a intercambiar ancho y alto.
 */
export function rotSize(w, h, deg) {
  const rad = ((deg || 0) * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  return { w: w * c + h * s, h: w * s + h * c };
}

/**
 * Gira el punto focal con la imagen, para cualquier angulo: se pasa a
 * coordenadas de la caja actual, se rota, y se normaliza contra la caja nueva.
 * Con espejo activo el sentido se invierte.
 */
export function turnFocal(t, delta, before, after, flip) {
  const rad = ((flip ? -delta : delta) * Math.PI) / 180;
  const co = Math.cos(rad);
  const si = Math.sin(rad);
  const px = (t.fx - 0.5) * before.w;
  const py = (t.fy - 0.5) * before.h;
  return {
    scale: t.scale,
    fx: 0.5 + (px * co - py * si) / (after.w || 1),
    fy: 0.5 + (px * si + py * co) / (after.h || 1),
  };
}

/** Espejo horizontal: lo que estaba a un tercio de la izquierda pasa a la derecha. */
export function mirrorFocal(t) {
  return { scale: t.scale, fx: 1 - t.fx, fy: t.fy };
}

/**
 * Altura del area de trabajo, en pixeles. Es IDENTICA en los tres niveles: lo
 * que cambia es el tamaño del contenido dentro, no el hueco. Se calcula aqui y
 * no en CSS porque una cadena de porcentajes colapsaba en el nivel Post.
 */
export function stageMetrics(wrapW, viewportH, ratio, level, opts = {}) {
  const R = RATIOS[ratio];
  const { peekFrac = 0.2, peekGap = 3, fotoZoom = 1.22, reserved = 366, cap = 460 } = opts;
  let pageW = (wrapW - 2 * peekGap) / (1 + 2 * peekFrac);
  let fotoW = Math.min(pageW * fotoZoom, wrapW);
  let h = (fotoW * R.h) / R.w;
  const limit = Math.max(150, Math.min(viewportH - reserved, (cap * R.h) / R.w));
  if (h > limit) {
    h = limit;
    fotoW = (h * R.w) / R.h;
    pageW = fotoW / fotoZoom;
  }
  const areaH = Math.round(h);
  /* En Foto la pagina llena el area por construccion, derivando el ancho de la
     altura ya redondeada. Calcular las dos por separado dejaba un pixel de
     desajuste. */
  if (level === 'photo') {
    return {
      areaH,
      stageW: Math.round((areaH * R.w) / R.h),
      stageH: areaH,
      peekW: Math.round(pageW * peekFrac),
    };
  }
  const stageW = Math.round(pageW);
  return {
    areaH,
    stageW,
    stageH: Math.round((stageW * R.h) / R.w),
    peekW: Math.round(pageW * peekFrac),
  };
}

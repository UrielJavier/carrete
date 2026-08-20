/**
 * TRATAMIENTO DE IMAGEN. El principio que gobierna este modulo: el File original
 * NUNCA se toca. El preview es una copia reducida para editar; al exportar se
 * vuelve a decodificar el original.
 *
 * El giro y el espejo se aplican a los PIXELES, no a la geometria, asi que el
 * resto del codigo los ignora por completo.
 */

import { rotSize } from './geometry.js';
import { convertToSRGB } from './color.js';

export const PREVIEW_MAX = 1600;

export async function decodeBitmap(file, opts) {
  try {
    return await createImageBitmap(file, opts || { imageOrientation: 'from-image' });
  } catch (e) {
    return await createImageBitmap(file);
  }
}

/**
 * Dibuja un bitmap girado y/o volteado en un canvas nuevo.
 * El espejo se aplica FUERA del giro para que refleje lo que el usuario ve y no
 * el original: primero se gira la foto y despues se voltea el resultado.
 */
export function rotateOnto(bmp, rot, k, flip) {
  const nat = rotSize(bmp.width, bmp.height, rot);
  const cw = Math.max(1, Math.round(nat.w * k));
  const ch = Math.max(1, Math.round(nat.h * k));
  const cv = document.createElement('canvas');
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(cw / 2, ch / 2);
  if (flip) ctx.scale(-1, 1);
  if (rot) ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(bmp, (-bmp.width * k) / 2, (-bmp.height * k) / 2, bmp.width * k, bmp.height * k);
  return { cv, ctx, w: cw, h: ch };
}

/** Preview ligero. Devuelve tambien las dimensiones del original, que hacen
 *  falta para decidir a que escala decodificar al exportar. */
export async function buildPreview(file, cs, convert, rot, flip) {
  const bmp = await decodeBitmap(file);
  const box = rotSize(bmp.width, bmp.height, rot || 0);
  const natW = Math.round(box.w);
  const natH = Math.round(box.h);
  const srcW = bmp.width;
  const srcH = bmp.height;
  const k = Math.min(1, PREVIEW_MAX / Math.max(natW, natH));
  const out = rotateOnto(bmp, rot || 0, k, flip);
  if (convert) convertToSRGB(out.ctx, out.w, out.h, cs);
  if (bmp.close) bmp.close();

  /* Con angulos que no son multiplo de 90 las esquinas quedan transparentes, y
     JPEG no tiene canal alfa: las pintaria de negro. Ahi hace falta PNG. */
  const mime = (rot || 0) % 90 !== 0 ? 'image/png' : 'image/jpeg';
  const blob = await new Promise((res) => out.cv.toBlob(res, mime, 0.92));
  const url = blob ? URL.createObjectURL(blob) : out.cv.toDataURL(mime, 0.92);
  const el = await new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('no se pudo decodificar el preview'));
    im.src = url;
  });
  return { w: natW, h: natH, srcW, srcH, url, el };
}

/**
 * Preview de un VÍDEO. Devuelve la URL para el <video>, las dimensiones, la duración
 * y un PÓSTER (primer fotograma) como imagen, que usan las miniaturas / feed / perfil
 * (que dibujan en canvas) y el export estático provisional hasta que el export a
 * vídeo esté montado. El File original nunca se toca.
 */
export async function buildVideoPreview(file) {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;

  await new Promise((res, rej) => {
    if (video.readyState >= 1) return res();
    video.onloadedmetadata = () => res();
    video.onerror = () => rej(new Error('no se pudo leer el vídeo'));
  });

  const w = video.videoWidth || 1080;
  const h = video.videoHeight || 1080;
  const duration = Number.isFinite(video.duration) ? video.duration : 0;

  /* Póster: un fotograma temprano. Con timeout por si el seek no dispara en el
     navegador, para no colgar la importación. */
  let el = null;
  try {
    await new Promise((res) => {
      let done = false;
      const finish = () => { if (!done) { done = true; res(); } };
      video.onseeked = finish;
      setTimeout(finish, 1500);
      try { video.currentTime = Math.min(0.1, duration ? duration / 2 : 0.1); } catch (e) { finish(); }
    });
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    cv.getContext('2d').drawImage(video, 0, 0, w, h);
    const poster = new Image();
    poster.src = cv.toDataURL('image/jpeg', 0.6);
    await new Promise((res) => { poster.onload = res; poster.onerror = res; });
    el = poster;
  } catch (e) {
    el = null;
  }

  return { type: 'video', url, el, w, h, srcW: w, srcH: h, duration };
}

/**
 * Identidad por CONTENIDO, no por id: cada importacion crea un id nuevo, asi que
 * la misma foto metida dos veces son dos entradas distintas. Sin esto, el aviso
 * de fotos repetidas no detectaria el caso que de verdad importa.
 */
export async function fingerprint(file) {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const buf = await file.arrayBuffer();
      const d = await crypto.subtle.digest('SHA-256', buf);
      return Array.prototype.map
        .call(new Uint8Array(d), (b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch (e) {
    /* sin crypto disponible */
  }
  return (file.name || '?') + '|' + file.size + '|' + (file.lastModified || 0);
}

import { TRANSPARENT, clamp } from '../../core/layouts.js';
import { drawRegion, drawnWidth } from '../../core/geometry.js';
import { exportSize, passthroughImage } from '../../core/post.js';
import { rotateOnto } from '../../core/image.js';
import { convertToSRGB } from '../../core/color.js';
import { drawTexts, ensureFonts } from '../../core/text.js';
import { encodePageVideo, videoCellOf } from './videoExport.js';

/**
 * EXPORT. El principio: el File original nunca se toca, y aqui se vuelve a
 * decodificar desde el a la escala que necesita cada celda.
 *
 * Se decodifica a ~1,6x el tamaño de destino y el ultimo paso lo da drawImage. Con
 * giro hay una pasada mas, pero se hace a esa escala mayor, asi que actua como
 * supermuestreo y el resultado sale mejor que rotando al tamaño final.
 */
/** Extensión del fichero original, para nombrarlo bien en el ZIP / al compartir. */
const extOf = (im) => {
  const m = (im.name || '').match(/\.([a-z0-9]+)$/i);
  if (m) return `.${m[1].toLowerCase()}`;
  const t = (im.file && im.file.type) || '';
  if (/heic|heif/.test(t)) return '.heic';
  if (t.includes('png')) return '.png';
  if (t.includes('quicktime')) return '.mov';
  if (t.includes('mp4') || t.startsWith('video')) return '.mp4';
  return '.jpg';
};

export async function exportPost({ post, cells, images, onProgress, original = true }) {
  /* La proporcion sale del ratio; el ancho es fijo (1080, el de IG). */
  const { w: EXW, h: EXH } = exportSize(post.ratio);
  const out = [];
  const cache = new Map();

  /* Las fuentes de los textos deben estar cargadas antes de pintar en canvas. */
  await ensureFonts();

  const decodeFor = async (im, needW) => {
    const key = `${im.id}:${Math.ceil(needW / 256)}`;
    if (cache.has(key)) return cache.get(key);
    /* Cuanto hay que escalar el ORIGINAL para que su caja girada mida lo que
       necesita la celda. Sirve igual para 90 grados que para 2. */
    const factor = clamp((needW * 1.6) / (im.w || 1), 0.02, 1);
    const srcW = im.srcW || im.w;
    let bmp;
    try {
      bmp = await createImageBitmap(im.file, {
        resizeQuality: 'high',
        imageOrientation: 'from-image',
        resizeWidth: Math.max(1, Math.round(srcW * factor)),
      });
    } catch (e) {
      bmp = await createImageBitmap(im.file);
    }
    let rec;
    if (im.rot || im.flip || im.converted) {
      const o = rotateOnto(bmp, im.rot || 0, 1, im.flip);
      if (im.converted) convertToSRGB(o.ctx, o.w, o.h, im.cs);
      rec = { el: o.cv, w: o.w, h: o.h };
    } else {
      rec = { el: bmp, w: bmp.width, h: bmp.height };
    }
    cache.set(key, rec);
    return rec;
  };

  for (let i = 0; i < post.slides.length; i++) {
    onProgress?.(i + 1, post.slides.length);
    const idx = String(i + 1).padStart(2, '0');

    /* MÁXIMA CALIDAD: si la página es una FOTO a marco completo sin recomponer, se
       entrega el fichero ORIGINAL sin recomprimir (sin generación de pérdida nuestra;
       conserva P3). El vídeo se trata más abajo, en su rama. */
    const pt = original ? passthroughImage(post, images, i) : null;
    if (pt && pt.type !== 'video') {
      out.push({
        blob: pt.file,
        url: URL.createObjectURL(pt.file),
        thumb: pt.url, // el preview decodificado, para que la miniatura se vea en cualquier navegador
        name: idx + extOf(pt),
        bytes: pt.file.size,
        original: true,
      });
      continue;
    }

    const cv = document.createElement('canvas');
    cv.width = EXW;
    cv.height = EXH;

    /* Las fotos de la página se decodifican a resolución de export una sola vez;
       sirven tanto para el export de imagen como para componer una página con vídeo. */
    const local = new Map();
    for (const cell of cells) {
      if (cell.rect.x + cell.rect.w <= i + 1e-4 || cell.rect.x >= i + 1 - 1e-4) continue;
      /* Una celda unida usa la foto del grupo (cubre toda la caja del grupo); el
         resto, la suya. */
      const grouped = cell.group && cell.groupImgId;
      const useId = grouped ? cell.groupImgId : cell.imgId;
      const im = useId ? images[useId] : null;
      if (!im || im.type === 'video') continue;
      const needW = grouped ? EXW : drawnWidth(cell, im.w / im.h, EXW);
      local.set(useId, await decodeFor(im, needW));
    }

    /* Si la página tiene un vídeo, se exporta como MP4 (fotograma a fotograma); si
       no, como imagen. Así un carrusel mezcla páginas-foto y páginas-vídeo. */
    const vidCell = videoCellOf(cells, i, images);
    if (vidCell) {
      /* MÁXIMA CALIDAD para vídeo: si la página es un vídeo a marco completo, sin
         recomponer y SIN recortar (trim), se entrega el `.mov`/`.mp4` original —
         conserva códec, bitrate, HDR y AUDIO, y se salta el transcode. */
      if (pt && pt.type === 'video') {
        const tr = post.slides[i].cells[0]?.trim;
        const dur = pt.duration;
        const trimmed = tr && ((tr.start || 0) > 0.05 || (dur && tr.end < dur - 0.05));
        if (!trimmed) {
          out.push({
            blob: pt.file,
            url: URL.createObjectURL(pt.file),
            name: idx + extOf(pt),
            bytes: pt.file.size,
            video: true,
            original: true,
          });
          continue;
        }
      }
      const blob = await encodePageVideo({
        pageIndex: i,
        cells,
        images,
        W: EXW,
        H: EXH,
        bg: post.bg,
        vidCell,
        staticSrc: local,
        texts: post.slides[i].texts,
        fill: post.fill,
        onProgress: (f, tot) => onProgress?.(i + 1, post.slides.length, { frame: f, frames: tot }),
      });
      out.push({
        blob,
        url: blob ? URL.createObjectURL(blob) : '',
        name: String(i + 1).padStart(2, '0') + '.mp4',
        bytes: blob ? blob.size : 0,
        video: true,
      });
      continue;
    }

    const ctx = cv.getContext('2d');
    drawRegion(ctx, cells, i, EXW, EXH, post.bg, (id) => local.get(id) || null, post.fill);
    /* Textos SIEMPRE encima de las fotos. */
    drawTexts(ctx, post.slides[i].texts, EXW, EXH);

    /* Con fondo transparente el formato es PNG por narices: JPEG no tiene canal
       alfa y pintaria los huecos de negro. */
    const png = post.fmt !== 'jpeg' || post.bg === TRANSPARENT;
    const mime = png ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((res) => cv.toBlob(res, mime, 0.95));
    out.push({
      /* Se guarda el blob ademas de la URL: el ZIP necesita los bytes, y volver a
         leerlos desde la URL seria una copia de mas. */
      blob,
      url: blob ? URL.createObjectURL(blob) : cv.toDataURL(mime, 0.95),
      name: String(i + 1).padStart(2, '0') + (png ? '.png' : '.jpg'),
      bytes: blob ? blob.size : 0,
    });
  }
  return out;
}

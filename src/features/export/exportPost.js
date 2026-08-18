import { RATIOS, TRANSPARENT, clamp } from '../../core/layouts.js';
import { drawRegion, drawnWidth } from '../../core/geometry.js';
import { rotateOnto } from '../../core/image.js';
import { convertToSRGB } from '../../core/color.js';

/**
 * EXPORT. El principio: el File original nunca se toca, y aqui se vuelve a
 * decodificar desde el a la escala que necesita cada celda.
 *
 * Se decodifica a ~1,6x el tamaño de destino y el ultimo paso lo da drawImage. Con
 * giro hay una pasada mas, pero se hace a esa escala mayor, asi que actua como
 * supermuestreo y el resultado sale mejor que rotando al tamaño final.
 */
export async function exportPost({ post, cells, images, onProgress }) {
  const R = RATIOS[post.ratio];
  const out = [];
  const cache = new Map();

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
    const cv = document.createElement('canvas');
    cv.width = R.w;
    cv.height = R.h;

    const local = new Map();
    for (const cell of cells) {
      if (cell.rect.x + cell.rect.w <= i + 1e-4 || cell.rect.x >= i + 1 - 1e-4) continue;
      const im = cell.imgId ? images[cell.imgId] : null;
      if (!im) continue;
      local.set(cell.imgId, await decodeFor(im, drawnWidth(cell, im.w / im.h, R.w)));
    }

    drawRegion(cv.getContext('2d'), cells, i, R.w, R.h, post.bg, (id) => local.get(id) || null);

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

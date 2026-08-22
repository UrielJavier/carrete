import { useCallback } from 'react';
import { uid } from '../core/layouts.js';
import { rotSize, turnFocal, mirrorFocal, clampT, postCells } from '../core/geometry.js';
import { detectColorSpace } from '../core/color.js';
import { buildPreview, buildVideoPreview, fingerprint } from '../core/image.js';

/**
 * BIBLIOTECA DE FOTOS.
 *
 * El giro y el espejo se aplican a los PIXELES, no a la geometria: se regenera el
 * preview y se intercambian ancho y alto, asi que el resto del codigo los ignora.
 * Lo unico que hay que transportar es el punto focal, y de eso se encargan
 * `turnFocal` y `mirrorFocal`, que estan cubiertos por tests.
 */
export function useImageLibrary({ post, images, dispatch, setBusy, onError }) {
  const ingest = useCallback(async (files, slideIndex, cellIndex) => {
    try {
      setBusy(files.length > 1 ? `Leyendo ${files.length} archivos…` : 'Leyendo archivo…');
      const added = [];
      for (const file of files) {
        if (file.type.startsWith('video/')) {
          /* El vídeo no se hashea entero (podrían ser decenas de MB): basta su huella
             de metadatos para detectar repetidos. */
          const key = `${file.name}|${file.size}|${file.lastModified || 0}`;
          const pv = await buildVideoPreview(file);
          added.push({ id: uid(), name: file.name, file, key, rot: 0, flip: false, ...pv });
          continue;
        }
        const cs = await detectColorSpace(file);
        /* Identidad por CONTENIDO: cada importacion crea un id nuevo, asi que la
           misma foto metida dos veces son dos entradas distintas y sin el hash el
           aviso de repetidas no la detectaria. */
        const key = await fingerprint(file);
        const pv = await buildPreview(file, cs, false, 0, false);
        added.push({
          id: uid(), name: file.name, file, cs, key,
          converted: false, rot: 0, flip: false, ...pv,
        });
      }
      dispatch({ type: 'putImages', slideIndex, cellIndex, added });
    } catch (e) {
      onError('No se pudo leer la foto: ' + (e?.message || e));
    } finally {
      setBusy(null);
    }
  }, [dispatch, setBusy, onError]);

  /* Añade UNA foto y la asigna como imagen compartida de un grupo de celdas unidas. */
  const ingestToGroup = useCallback(async (files, groupId) => {
    const file = files[0];
    if (!file) return;
    try {
      setBusy('Leyendo archivo…');
      let rec;
      if (file.type.startsWith('video/')) {
        const key = `${file.name}|${file.size}|${file.lastModified || 0}`;
        const pv = await buildVideoPreview(file);
        rec = { id: uid(), name: file.name, file, key, rot: 0, flip: false, ...pv };
      } else {
        const cs = await detectColorSpace(file);
        const key = await fingerprint(file);
        const pv = await buildPreview(file, cs, false, 0, false);
        rec = { id: uid(), name: file.name, file, cs, key, converted: false, rot: 0, flip: false, ...pv };
      }
      dispatch({ type: 'setGroupImage', groupId, added: [rec] });
    } catch (e) {
      onError('No se pudo leer la foto: ' + (e?.message || e));
    } finally {
      setBusy(null);
    }
  }, [dispatch, setBusy, onError]);

  const reorient = useCallback(async (id, nextRot, nextFlip) => {
    const im = images[id];
    if (!im) return;
    try {
      setBusy('Aplicando…');
      const from = im.rot || 0;
      const sw = im.srcW || im.w;
      const sh = im.srcH || im.h;
      const before = rotSize(sw, sh, from);
      const after = rotSize(sw, sh, nextRot);
      const pv = await buildPreview(im.file, im.cs, im.converted, nextRot, nextFlip);
      if (im.url?.startsWith('blob:')) URL.revokeObjectURL(im.url);

      const cellPatches = postCells(post)
        .filter((c) => c.imgId === id)
        .map((c) => {
          let t = post.slides[c.slideIndex].cells[c.cellIndex].t;
          if (nextRot !== from) t = turnFocal(t, nextRot - from, before, after, im.flip);
          if (nextFlip !== !!im.flip) t = mirrorFocal(t);
          return {
            slideIndex: c.slideIndex,
            cellIndex: c.cellIndex,
            t: clampT(t, c.cellAspect, pv.w / pv.h),
          };
        });

      dispatch({
        type: 'patchImage',
        id,
        history: true,
        cellPatches,
        patch: { ...pv, rot: nextRot, flip: nextFlip, saved: false },
      });
    } catch (e) {
      onError('No se pudo aplicar: ' + (e?.message || e));
    } finally {
      setBusy(null);
    }
  }, [images, post, dispatch, setBusy, onError]);

  const convertToSRGB = useCallback(async (list) => {
    try {
      setBusy('Convirtiendo a sRGB…');
      for (const im of list) {
        const pv = await buildPreview(im.file, im.cs, true, im.rot || 0, !!im.flip);
        if (im.url?.startsWith('blob:')) URL.revokeObjectURL(im.url);
        dispatch({ type: 'patchImage', id: im.id, patch: { ...pv, converted: true, saved: false } });
      }
    } catch (e) {
      onError('Falló la conversión: ' + (e?.message || e));
    } finally {
      setBusy(null);
    }
  }, [dispatch, setBusy, onError]);

  return { ingest, ingestToGroup, reorient, convertToSRGB };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { uid } from '../core/layouts.js';
import { newPost, clonePost, projectBytes, docImageIds } from '../core/post.js';
import { buildPreview, buildVideoPreview } from '../core/image.js';
import * as db from '../core/db.js';

const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const defaultName = () => {
  const d = new Date();
  return `${d.getDate()} ${meses[d.getMonth()]} `
    + `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * PROYECTOS Y PERSISTENCIA.
 *
 * El almacen de ficheros es COMPARTIDO entre proyectos: una misma foto puede estar
 * en varios, asi que las huerfanas solo se borran comparando contra TODOS, nunca
 * contra el que esta abierto.
 *
 * Los previews NO se guardan: son derivados y ocuparian el doble. Se regeneran al
 * abrir, y solo los de las fotos que ese proyecto usa, para que la memoria dependa
 * del proyecto abierto y no del total acumulado.
 */
export function useProjects({ post, images, current, ui, onLoad, onError, setBusy }) {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const timer = useRef(null);
  const booted = useRef(false);

  const loadImagesFor = useCallback(async (doc) => {
    /* Carga TAMBIÉN las fotos de los grupos, no solo las de celdas: si no, al abrir
       o refrescar el grupo aparecía sin su foto compartida. */
    const ids = [...docImageIds(doc)];
    if (ids.length) setBusy('Cargando fotos…');
    const loaded = {};
    for (const id of ids) {
      try {
        const rec = await db.loadFile(id);
        if (!rec?.file) continue;
        const pv = rec.type === 'video'
          ? await buildVideoPreview(rec.file)
          : await buildPreview(rec.file, rec.cs, rec.converted, rec.rot || 0, !!rec.flip);
        loaded[id] = { id, saved: true, ...rec, ...pv };
      } catch (e) {
        /* foto ilegible: la celda quedara vacia */
      }
    }
    setBusy(null);
    return loaded;
  }, [setBusy]);

  const save = useCallback(async () => {
    if (!projectId) return;
    try {
      await db.saveProject(projectId, clonePost(post));
      /* La medida se guarda en el indice al escribir, asi que la lista se pinta sin
         leer nada mas. Solo hay que calcularla a demanda para proyectos guardados
         antes de que el indice la incluyera. */
      const sizes = {};
      Object.keys(images).forEach((id) => {
        if (images[id]?.file?.size) sizes[id] = images[id].file.size;
      });
      const bytes = projectBytes(post, sizes);

      setProjects((list) => {
        const meta = {
          id: projectId,
          name: list.find((p) => p.id === projectId)?.name || defaultName(),
          updated: Date.now(),
          pages: post.slides.length,
          ratio: post.ratio,
          bytes: bytes.total,
          photos: bytes.count,
        };
        const next = list.some((p) => p.id === projectId)
          ? list.map((p) => (p.id === projectId ? { ...p, ...meta } : p))
          : list.concat([meta]);
        db.saveIndex(next);
        return next;
      });
      await db.saveUI({ projectId, current, ...ui });
      for (const id of Object.keys(images)) {
        const im = images[id];
        if (im.saved) continue;
        await db.saveFile(id, {
          name: im.name, cs: im.cs, key: im.key, type: im.type,
          converted: im.converted, rot: im.rot || 0, flip: !!im.flip, file: im.file,
        });
        im.saved = true;
      }
    } catch (e) {
      /* sin persistencia: se sigue trabajando en memoria */
    }
  }, [projectId, post, images, current, ui]);

  /* Escritura con retardo: render() ocurre tras cada cambio, y guardar en cada uno
     saturaria IndexedDB. */
  useEffect(() => {
    if (!booted.current) return undefined;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, 500);
    return () => clearTimeout(timer.current);
  }, [save]);

  const open = useCallback(async (id) => {
    try {
      const doc = await db.loadProject(id);
      if (!doc?.slides?.length) return false;
      const loaded = await loadImagesFor(doc);
      setProjectId(id);
      onLoad(doc, loaded, 0);
      return true;
    } catch (e) {
      onError('No se pudo abrir el proyecto: ' + (e?.message || e));
      return false;
    }
  }, [loadImagesFor, onLoad, onError]);

  const create = useCallback(async (name, base) => {
    const id = uid();
    const doc = base || newPost();
    const meta = { id, name: name || defaultName(), updated: Date.now(), pages: doc.slides.length, ratio: doc.ratio };
    await db.saveProject(id, doc);
    setProjects((list) => {
      const next = list.concat([meta]);
      db.saveIndex(next);
      return next;
    });
    return { id, doc };
  }, []);

  const remove = useCallback(async (id) => {
    /* Cancela cualquier guardado pendiente: si no, el temporizador escribiria
       despues del borrado y resucitaria el proyecto. */
    if (timer.current) clearTimeout(timer.current);
    await db.deleteProjectDoc(id);
    const next = projects.filter((p) => p.id !== id);
    setProjects(next);
    await db.saveIndex(next);
    if (id === projectId) {
      if (next.length) await open(next[0].id);
      else {
        setProjectId(null);
        onLoad(newPost(), {}, 0);
      }
    }
    db.sweepFiles(next);
  }, [projects, projectId, open, onLoad]);

  /* Mide los proyectos del indice que aun no traen la medida. */
  const measureMissing = useCallback(async () => {
    const pend = projects.filter((p) => p.bytes == null);
    if (!pend.length) return;
    const medidos = {};
    for (const p of pend) {
      const m = await db.measureProject(p.id);
      if (m) {
        const b = projectBytes(m.doc, m.sizes);
        medidos[p.id] = { bytes: b.total, photos: b.count };
      }
    }
    setProjects((list) => {
      const next = list.map((p) => (medidos[p.id] ? { ...p, ...medidos[p.id] } : p));
      db.saveIndex(next);
      return next;
    });
  }, [projects]);

  const rename = useCallback(async (id, name) => {
    setProjects((list) => {
      const next = list.map((p) => (p.id === id ? { ...p, name: name || 'Sin título' } : p));
      db.saveIndex(next);
      return next;
    });
  }, []);

  const duplicate = useCallback(async (id) => {
    const src = await db.loadProject(id);
    if (!src) return;
    const name = projects.find((p) => p.id === id)?.name || 'Sin título';
    const { id: newId } = await create(`${name} (copia)`, JSON.parse(JSON.stringify(src)));
    await open(newId);
  }, [projects, create, open]);

  /* Arranque. Primera vez crea un proyecto y entra al editor; si el usuario los
     borro todos, se respeta el estado vacio. La diferencia esta en si el indice
     existe en disco: [] guardado significa "los borre a proposito". */
  const boot = useCallback(async () => {
    try {
      const stored = await db.loadIndex();
      const firstRun = !stored;
      const list = stored || [];
      setProjects(list);
      const savedUI = (await db.loadUI()) || {};

      if (firstRun && !list.length) {
        const { id, doc } = await create();
        setProjectId(id);
        onLoad(doc, {}, 0);
        return { ui: savedUI, empty: false };
      }
      if (!list.length) return { ui: savedUI, empty: true };

      const wanted = savedUI.projectId && list.some((p) => p.id === savedUI.projectId)
        ? savedUI.projectId : list[0].id;
      const doc = await db.loadProject(wanted);
      if (doc?.slides?.length) {
        const loaded = await loadImagesFor(doc);
        setProjectId(wanted);
        onLoad(doc, loaded, savedUI.current || 0);
      }
      db.sweepFiles(list);
      return { ui: savedUI, empty: false };
    } catch (e) {
      onError('No se pudo cargar: ' + (e?.message || e));
      return { ui: {}, empty: true };
    } finally {
      booted.current = true;
    }
  }, [create, loadImagesFor, onLoad, onError]);

  return {
    projects, projectId, boot, open, create, remove, rename, duplicate, save,
    measureMissing, setProjectId,
  };
}

/**
 * PERSISTENCIA. Las fotos son Blobs, asi que localStorage no sirve: IndexedDB
 * guarda ficheros tal cual.
 *
 * Claves: kv:index (lista de proyectos), kv:project:<id> (el post), kv:ui.
 * El almacen `files` es COMPARTIDO entre proyectos: una misma foto puede estar en
 * varios, asi que las huerfanas solo se borran comparando contra TODOS los
 * proyectos, nunca contra el que esta abierto.
 */

import { docImageIds } from './post.js';

const DB_NAME = 'carrete';
let dbPromise = null;

/** Una sola conexion reutilizada: abrirla en cada operacion hacia decenas de
 *  aperturas por guardado. */
function idb() {
  if (!dbPromise) {
    dbPromise = new Promise((res, rej) => {
      const rq = indexedDB.open(DB_NAME, 1);
      rq.onupgradeneeded = () => {
        const db = rq.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('files')) db.createObjectStore('files');
      };
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => {
        dbPromise = null;
        rej(rq.error);
      };
    });
  }
  return dbPromise;
}

export function idbDo(store, mode, fn) {
  return idb().then(
    (db) =>
      new Promise((res, rej) => {
        const tx = db.transaction(store, mode);
        const rq = fn(tx.objectStore(store));
        if (rq) {
          rq.onsuccess = () => res(rq.result);
          rq.onerror = () => rej(rq.error);
        } else {
          tx.oncomplete = () => res();
          tx.onerror = () => rej(tx.error);
        }
      })
  );
}

export const idbGet = (store, key) => idbDo(store, 'readonly', (st) => st.get(key));
export const idbPut = (store, key, val) => idbDo(store, 'readwrite', (st) => st.put(val, key));
export const idbDel = (store, key) => idbDo(store, 'readwrite', (st) => st.delete(key));
export const idbKeys = (store) => idbDo(store, 'readonly', (st) => st.getAllKeys());

export const loadIndex = () => idbGet('kv', 'index');
export const saveIndex = (list) => idbPut('kv', 'index', list);
export const loadUI = () => idbGet('kv', 'ui');
export const saveUI = (ui) => idbPut('kv', 'ui', ui);
export const loadProject = (id) => idbGet('kv', 'project:' + id);
export const saveProject = (id, post) => idbPut('kv', 'project:' + id, post);
export const deleteProjectDoc = (id) => idbDel('kv', 'project:' + id);

export const loadFile = (id) => idbGet('files', id);
export const saveFile = (id, rec) => idbPut('files', id, rec);

/** Borra del disco las fotos que no usa NINGUN proyecto. */
export async function sweepFiles(projects, liveIds = {}) {
  try {
    const used = {};
    for (const p of projects) {
      const doc = await loadProject(p.id);
      if (!doc || !doc.slides) continue;
      /* Incluye las fotos de los grupos, no solo las de las celdas: si no, la foto
         compartida de un grupo se borraba como huérfana al refrescar. */
      docImageIds(doc).forEach((id) => { used[id] = true; });
    }
    const keys = await idbKeys('files');
    const orphans = keys.filter((k) => !used[k] && !liveIds[k]);
    if (orphans.length) {
      await idbDo('files', 'readwrite', (st) => {
        orphans.forEach((k) => st.delete(k));
      });
    }
    return orphans;
  } catch (e) {
    return [];
  }
}

/** Tamaño de un proyecto leyendo los ficheros que referencia. Solo se usa para
 *  proyectos guardados antes de que el indice incluyera la medida. */
export async function measureProject(id) {
  const doc = await loadProject(id);
  if (!doc?.slides) return null;
  const ids = docImageIds(doc);
  const sizes = {};
  for (const imgId of ids) {
    const rec = await loadFile(imgId);
    if (rec?.file?.size) sizes[imgId] = rec.file.size;
  }
  return { doc, sizes };
}

/** Lo que el navegador dice que llevamos ocupado y cuanto nos deja. Es una
 *  estimacion suya, no una suma nuestra. */
export async function storageEstimate() {
  try {
    if (navigator.storage?.estimate) return await navigator.storage.estimate();
  } catch (e) {
    /* sin soporte */
  }
  return null;
}

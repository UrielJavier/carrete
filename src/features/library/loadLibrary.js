import * as db from '../../core/db.js';

/**
 * BIBLIOTECA. El almacén `files` es compartido entre proyectos, así que aquí se ve
 * TODO lo que ocupa espacio y en qué se usa. Se cruza cada fichero con los proyectos
 * que lo referencian para saber cuántas veces se usa y cuándo se tocó por última vez.
 *
 * No guardamos dimensiones por fichero (no están en el registro), así que la ficha va
 * por peso/tipo/uso/recencia, que es lo que sirve para gestionar la memoria.
 */
export async function loadLibrary(projects) {
  /* Uso por fichero: nº de celdas que lo referencian, en cuántos proyectos, y la
     fecha más reciente de un proyecto que lo usa (para "últimos usados"). */
  const usage = {};
  for (const p of projects) {
    const doc = await db.loadProject(p.id); // eslint-disable-line no-await-in-loop
    if (!doc?.slides) continue;
    doc.slides.forEach((sl) => sl.cells.forEach((c) => {
      if (!c.imgId) return;
      const u = usage[c.imgId] || (usage[c.imgId] = { count: 0, projects: new Set(), lastUsed: 0 });
      u.count += 1;
      u.projects.add(p.id);
      u.lastUsed = Math.max(u.lastUsed, p.updated || 0);
    }));
  }

  const keys = await db.idbKeys('files');
  const files = [];
  for (const id of keys) {
    const rec = await db.loadFile(id); // eslint-disable-line no-await-in-loop
    if (!rec) continue;
    const u = usage[id];
    files.push({
      id,
      name: rec.name || rec.file?.name || 'archivo',
      type: rec.type === 'video' ? 'video' : 'photo',
      size: rec.file?.size || 0,
      uses: u?.count || 0,
      projects: u ? u.projects.size : 0,
      lastUsed: u?.lastUsed || 0,
    });
  }

  const sum = (t) => files.filter((f) => f.type === t).reduce((a, f) => a + f.size, 0);
  return {
    files,
    totals: {
      photos: sum('photo'),
      videos: sum('video'),
      total: files.reduce((a, f) => a + f.size, 0),
      count: files.length,
      unused: files.filter((f) => f.uses === 0).length,
    },
  };
}

/** Comparadores de orden para la lista. */
export const SORTS = {
  size: (a, b) => b.size - a.size,
  uses: (a, b) => b.uses - a.uses || b.size - a.size,
  recent: (a, b) => b.lastUsed - a.lastUsed || b.size - a.size,
};

/**
 * FLUJO de persistencia (round-trip real sobre IndexedDB, con fake-indexeddb).
 *
 * Blinda el bug que perdía la foto de un grupo al refrescar: el barrido de huérfanas
 * solo miraba las fotos de las celdas, así que la foto compartida de un grupo se
 * borraba del disco. Aquí se guarda un proyecto con un grupo, se simula el arranque
 * (sweepFiles contra la lista de proyectos) y se comprueba que la foto sobrevive.
 */
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import * as db from '../../src/core/db.js';
import { newPost, newSlide } from '../../src/core/post.js';

const blob = (n) => new Blob([new Uint8Array(n)]); // fichero de mentira de n bytes
const saveRec = (id, bytes) => db.saveFile(id, { name: `${id}.png`, type: 'image', file: blob(bytes) });

/** Post con una foto de celda ('cellpic') y un grupo con SU foto ('grouppic'). */
function postWithGroup() {
  const p = newPost();
  const sl = newSlide('quad');
  sl.cells[0].imgId = 'cellpic';
  sl.cells[1].group = 'g1';
  sl.cells[2].group = 'g1';
  p.slides = [sl];
  p.groups = { g1: { imgId: 'grouppic', t: { scale: 1, fx: 0.5, fy: 0.5 } } };
  return p;
}

async function clearStores() {
  await db.idbDo('files', 'readwrite', (st) => st.clear());
  await db.idbDo('kv', 'readwrite', (st) => st.clear());
}

describe('persistencia: la foto del grupo sobrevive al barrido', () => {
  beforeEach(clearStores);

  it('sweepFiles NO borra la foto del grupo (solo las huérfanas de verdad)', async () => {
    await db.saveProject('p1', postWithGroup());
    await saveRec('cellpic', 1000);
    await saveRec('grouppic', 2000);
    await saveRec('huerfana', 3000); // no la referencia nadie

    const orphans = await db.sweepFiles([{ id: 'p1' }]);

    expect(orphans).toEqual(['huerfana']);
    expect(await db.loadFile('grouppic')).toBeTruthy(); // ← la clave: no se borró
    expect(await db.loadFile('cellpic')).toBeTruthy();
    expect(await db.loadFile('huerfana')).toBeFalsy();
  });

  it('measureProject cuenta también el peso de la foto del grupo', async () => {
    await db.saveProject('p2', postWithGroup());
    await saveRec('cellpic', 1000);
    await saveRec('grouppic', 2000);

    const { sizes } = await db.measureProject('p2');

    expect(sizes.cellpic).toBe(1000);
    expect(sizes.grouppic).toBe(2000); // antes se quedaba fuera
  });

  it('un proyecto sin grupos sigue barriendo bien', async () => {
    const p = newPost();
    const sl = newSlide('h2');
    sl.cells[0].imgId = 'solo';
    p.slides = [sl];
    await db.saveProject('p3', p);
    await saveRec('solo', 500);
    await saveRec('basura', 900);

    const orphans = await db.sweepFiles([{ id: 'p3' }]);

    expect(orphans).toEqual(['basura']);
    expect(await db.loadFile('solo')).toBeTruthy();
  });
});

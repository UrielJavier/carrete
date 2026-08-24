/**
 * MODELO DEL POST. Es JSON puro y minusculo, asi que clonarlo para el historial
 * de deshacer cuesta microsegundos. Las fotos no se clonan: se referencian por id.
 */

import { LAYOUTS, MAX_SLIDES, RATIOS, uid } from './layouts.js';
import { newT, postCells, drawnWidth, imageUnits, clampT } from './geometry.js';

export const newSlide = (layoutId = 'full') => ({
  id: uid(),
  layoutId,
  cells: LAYOUTS[layoutId].cells.map(() => ({ imgId: null, t: newT() })),
  texts: [],
});

export const newPost = () => ({
  ratio: '4:5',
  gap: 0,
  bg: '#ffffff',
  /* PNG por defecto: montar no deberia añadir una generacion de recompresion
     encima de la que ya trae el fichero de origen. Quien quiera archivos ligeros
     puede cambiarlo, pero la opcion cara es la que respeta la foto. */
  fmt: 'png',
  /* Área segura (guía de edición para el texto): 0 = desactivada. No se exporta. */
  safe: 0,
  /* Relleno de los huecos (contain): 'color' plano o 'blur' (la foto desenfocada). */
  fill: 'color',
  /* Grupos de celdas UNIDAS que comparten una foto: { [id]: { imgId } }. */
  groups: {},
  slides: [newSlide('full')],
});

/**
 * Ancho del fichero exportado. Fijo a 1080: es el ancho real con el que Instagram
 * sirve el feed organico, asi que subir mas (p.ej. 1440) solo fuerza que IG lo
 * vuelva a reducir a 1080, con una pasada extra de remuestreo. A 1080 se le da a IG
 * justo lo que va a mostrar y las fotos se amplian mucho menos.
 */
export const EXPORT_WIDTH = 1080;

/**
 * Tamaño en pixeles del fichero exportado. La PROPORCION sale de RATIOS; el ancho
 * solo decide cuantos pixeles tiene el fichero. Cambiar el ancho NO altera ningun
 * encuadre: todo el dibujo es relativo, asi que a cualquier ancho sale el mismo
 * recorte, solo con mas o menos resolucion.
 */
export function exportSize(ratio, width = EXPORT_WIDTH) {
  const R = RATIOS[ratio];
  const w = Math.max(1, Math.round(width || EXPORT_WIDTH));
  return { w, h: Math.round((w * R.h) / R.w) };
}

export const clonePost = (post) => JSON.parse(JSON.stringify(post));

/**
 * Cambiar de layout conserva las fotos por indice. Devuelve cuantas se
 * conservarian y cuantas se perderian, para poder avisar ANTES de hacerlo.
 */
export function layoutChangeImpact(slide, layoutId) {
  const n = LAYOUTS[layoutId].cells.length;
  let kept = 0;
  let lost = 0;
  slide.cells.forEach((c, i) => {
    if (!c.imgId) return;
    if (i < n) kept++;
    else lost++;
  });
  return { kept, lost, holes: n };
}

export function applyLayout(slide, layoutId) {
  const n = LAYOUTS[layoutId].cells.length;
  const cells = [];
  for (let i = 0; i < n; i++) cells.push(slide.cells[i] || { imgId: null, t: newT() });
  return { ...slide, layoutId, cells };
}

/** Reordenar es MOVER a una posicion, no intercambiar: se saca y se inserta. */
export function moveSlideTo(slides, from, to) {
  if (from === to || from < 0 || to < 0) return slides;
  if (from >= slides.length || to >= slides.length) return slides;
  const out = slides.slice();
  const moved = out.splice(from, 1)[0];
  out.splice(to, 0, moved);
  return out;
}

export function swapCells(slide, a, b) {
  if (a === b || !slide.cells[a] || !slide.cells[b]) return slide;
  const cells = slide.cells.slice();
  const tmp = cells[a];
  cells[a] = cells[b];
  cells[b] = tmp;
  return { ...slide, cells };
}

export function canAddSlide(post) {
  return post.slides.length < MAX_SLIDES;
}

/** Fotos que ocupan mas de una celda en todo el post, agrupadas por contenido. */
export function duplicates(post, images) {
  const byKey = {};
  post.slides.forEach((s, i) => {
    s.cells.forEach((c) => {
      const im = c.imgId ? images[c.imgId] : null;
      if (!im || !im.key) return;
      if (!byKey[im.key]) byKey[im.key] = { count: 0, pages: {} };
      byKey[im.key].count += 1;
      byKey[im.key].pages[i + 1] = true;
    });
  });
  const keys = {};
  const groups = [];
  Object.keys(byKey).forEach((k) => {
    if (byKey[k].count < 2) return;
    keys[k] = byKey[k].count;
    groups.push({
      key: k,
      count: byKey[k].count,
      pages: Object.keys(byKey[k].pages).map(Number).sort((a, b) => a - b),
    });
  });
  return { keys, groups };
}

/** IDs de TODAS las fotos que referencia un post: las de las celdas Y las de los
 *  grupos (cada grupo comparte una foto propia). Fuente ÚNICA para guardar, cargar
 *  y barrer ficheros: así la foto de un grupo nunca se trata como huérfana. */
export function docImageIds(doc) {
  const ids = new Set();
  (doc?.slides || []).forEach((s) => s.cells.forEach((c) => { if (c.imgId) ids.add(c.imgId); }));
  Object.values(doc?.groups || {}).forEach((g) => { if (g?.imgId) ids.add(g.imgId); });
  return ids;
}

/**
 * ¿La página `i` es UNA foto/vídeo a marco completo SIN recomponer? Entonces se puede
 * entregar el FICHERO ORIGINAL sin recomprimir (máxima calidad): Instagram hará su
 * única pasada sobre el mejor origen posible, sin una generación de pérdida nuestra
 * (canvas) por delante, y conservando gama amplia (P3), y en vídeo el códec/HDR/audio.
 *
 * Elegible = una sola celda que ocupa TODA la página, sin grupo, sin zoom (scale 1),
 * sin giro/espejo, y con el MISMO aspecto que el post (si no, la foto no llena el marco
 * y hay que recortar/encajar, lo que obliga a componer). Devuelve la foto o null.
 */
export function passthroughImage(post, images, i) {
  const sl = post?.slides?.[i];
  if (!sl) return null;
  const layout = LAYOUTS[sl.layoutId];
  if (!layout || layout.cells.length !== 1) return null;
  const r = layout.cells[0];
  if (r.x !== 0 || r.y !== 0 || r.w !== 1 || r.h !== 1) return null;
  const cell = sl.cells[0];
  if (!cell || cell.group || !cell.imgId) return null;
  const im = images?.[cell.imgId];
  if (!im || !im.file) return null;
  if ((cell.t?.scale ?? 1) !== 1) return null;            // sin zoom
  if ((im.rot || 0) % 360 !== 0 || im.flip) return null;  // sin giro/espejo
  const R = RATIOS[post.ratio];
  if (!R) return null;
  const iw = im.srcW || im.w;
  const ih = im.srcH || im.h;
  if (!iw || !ih) return null;
  if (Math.abs(iw / ih - R.w / R.h) > 0.01) return null;  // aspecto de la foto == ratio
  return im;
}

/** Fotos que ya no usa ninguna pagina ni ninguna entrada del historial. */
export function unusedImageIds(post, history, images) {
  const used = {};
  const mark = (p) => docImageIds(p).forEach((id) => { used[id] = true; });
  mark(post);
  history.forEach((h) => mark(h.post));
  return Object.keys(images).filter((id) => !used[id]);
}

/**
 * Descompone un giro en vuelta (0/90/180/270) y ajuste (-45..45). Son
 * independientes: cambiar de cuarto de vuelta conserva el enderezado.
 */
export function splitRotation(rot) {
  const q = Math.round((rot || 0) / 90) * 90;
  return {
    base: ((q % 360) + 360) % 360,
    off: Math.round(((rot || 0) - q) * 2) / 2,
  };
}

/* Por debajo de este factor la ampliación no se percibe; por encima, se avisa. */
export const UPSCALE_WARN = 1.15;

/**
 * ¿Cada celda amplía su foto por encima de la resolución del original? Es la causa
 * nº1 de carruseles borrosos: al partir una foto en trozos, cada trozo puede quedar
 * con menos píxeles de los que ocupa a 1080, e Instagram lo amplía.
 *
 * `need` = ancho en px que ocupa la foto en el export (drawnWidth, que ya respeta el
 * modelo *contain* y el zoom); `have` = ancho real del original; factor = need/have.
 */
export function upscaleReport(post, images) {
  const { w: EXW } = exportSize(post.ratio);
  const out = [];
  postCells(post).forEach((c) => {
    const grouped = c.group && c.groupImgId;
    const im = grouped ? images[c.groupImgId] : (c.imgId ? images[c.imgId] : null);
    if (!im || im.type === 'video' || !im.w) return; // el vídeo no se mide igual
    const ia = im.w / im.h;
    const need = grouped
      ? imageUnits(clampT(c.groupT, c.groupAspect, ia).scale, c.groupAspect, ia).dwU * c.groupRect.w * EXW
      : drawnWidth(c, ia, EXW);
    out.push({
      slideIndex: c.slideIndex,
      cellIndex: c.cellIndex,
      need: Math.round(need),
      have: im.w,
      factor: need / im.w,
    });
  });
  return out;
}

/**
 * Espacio que ocupa un proyecto. Las fotos se cuentan UNA VEZ aunque aparezcan en
 * varias celdas, porque en disco hay un solo fichero.
 *
 * Ojo con la lectura: el almacen de ficheros es COMPARTIDO entre proyectos, asi que
 * una foto usada en dos cuenta en los dos y la suma de todos los proyectos puede
 * ser mayor que el espacio realmente ocupado.
 */
export function projectBytes(post, sizes) {
  const seen = new Set();
  let photos = 0;
  docImageIds(post).forEach((id) => {
    if (seen.has(id)) return;
    seen.add(id);
    const n = sizes[id];
    if (n) photos += n;
  });
  /* El post es ASCII en la practica, asi que un caracter es un byte. */
  const doc = JSON.stringify(post).length;
  return { photos, doc, total: photos + doc, count: seen.size };
}

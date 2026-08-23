/**
 * ESTADO. Un reducer plano sobre `post`, mas el historial de deshacer.
 *
 * `post` es JSON puro, asi que clonarlo cuesta microsegundos. Las fotos viven
 * aparte en un mapa por id y NO se clonan: cada entrada del historial guarda
 * ademas la orientacion de cada foto (giro y espejo), porque eso vive en el
 * registro de la foto y no en el post.
 */

import { MAX_SLIDES, clamp, uid } from '../core/layouts.js';
import {
  newPost, newSlide, clonePost, applyLayout, moveSlideTo, swapCells,
} from '../core/post.js';
import { newT } from '../core/geometry.js';

export const HISTORY_MAX = 40;

export function initialState() {
  return {
    post: newPost(),
    images: {},          // id -> { file, name, cs, key, converted, rot, flip, w, h, srcW, srcH, url, el }
    history: [],         // [{ post, orient }] — para deshacer
    future: [],          // [{ post, orient }] — para rehacer (se vacía al hacer un cambio nuevo)
    current: 0,
    sel: null,           // { slideIndex, cellIndex }
    textSel: null,       // { slideIndex, id } del texto seleccionado
    level: 'page',       // post | page | photo
    tool: null,          // subnivel abierto
    mode: 'edit',        // edit | feed | grid | projects | log
  };
}

const orientMap = (images) => {
  const m = {};
  Object.keys(images).forEach((id) => {
    m[id] = { rot: images[id].rot || 0, flip: !!images[id].flip };
  });
  return m;
};

/** Se llama ANTES de modificar, con el estado que queremos poder recuperar. Guarda
 *  también la UBICACIÓN (nivel, página, selección) para que deshacer/rehacer lleven a
 *  donde se hizo el cambio y se vea. */
export function snapshot(state) {
  return {
    post: clonePost(state.post),
    orient: orientMap(state.images),
    level: state.level,
    current: state.current,
    sel: state.sel,
    textSel: state.textSel,
  };
}

/** Restaura post + ubicación de una entrada de historial/futuro. */
const restoreEntry = (state, entry, history, future) => ({
  ...state,
  post: entry.post,
  history,
  future,
  /* Volver a Editar y al nivel del cambio: así el deshacer/rehacer se VE donde ocurrió. */
  mode: 'edit',
  level: entry.level || 'page',
  current: clamp(entry.current || 0, 0, entry.post.slides.length - 1),
  sel: entry.sel || null,
  textSel: entry.textSel || null,
  tool: null,
  pendingOrient: entry.orient, // lo aplica App con un efecto asincrono
});

function withHistory(state, next) {
  const history = state.history.concat([snapshot(state)]);
  if (history.length > HISTORY_MAX) history.shift();
  /* Un cambio nuevo invalida el rehacer: se abandona la rama futura. */
  return { ...next, history, future: [] };
}

const replaceSlide = (post, i, slide) => ({
  ...post,
  slides: post.slides.map((s, k) => (k === i ? slide : s)),
});

/** Reemplaza el array de textos de una página, tolerando páginas antiguas sin él. */
const replaceTexts = (post, i, texts) =>
  replaceSlide(post, i, { ...post.slides[i], texts });

export function reducer(state, action) {
  switch (action.type) {
    case 'set':
      return { ...state, ...action.patch };

    case 'level':
      return { ...state, level: action.level, tool: null, textSel: null };

    case 'tool':
      return { ...state, tool: action.tool };

    case 'goPage':
      if (action.i < 0 || action.i >= state.post.slides.length) return state;
      return { ...state, current: action.i, sel: null, textSel: null };

    case 'select':
      /* Seleccionar una celda sale de la edición de texto (vuelve a Página) y quita
         la selección de texto. */
      return {
        ...state,
        sel: action.sel,
        textSel: action.sel ? null : state.textSel,
        level: state.level === 'text' && action.sel ? 'page' : state.level,
      };

    case 'layout':
      return withHistory(state, {
        ...state,
        post: replaceSlide(state.post, state.current, applyLayout(state.post.slides[state.current], action.layoutId)),
        sel: null,
      });

    case 'addSlide': {
      if (state.post.slides.length >= MAX_SLIDES) return state;
      const slides = state.post.slides.slice();
      slides.splice(state.current + 1, 0, newSlide('full'));
      return withHistory(state, {
        ...state,
        post: { ...state.post, slides },
        current: state.current + 1,
        sel: null,
      });
    }

    case 'duplicateSlide': {
      if (state.post.slides.length >= MAX_SLIDES) return state;
      const copy = JSON.parse(JSON.stringify(state.post.slides[state.current]));
      copy.id = Math.random().toString(36).slice(2, 9);
      const slides = state.post.slides.slice();
      slides.splice(state.current + 1, 0, copy);
      return withHistory(state, {
        ...state,
        post: { ...state.post, slides },
        current: state.current + 1,
        sel: null,
      });
    }

    case 'removeSlide': {
      const slides = state.post.slides.length === 1
        ? [newSlide('full')]
        : state.post.slides.filter((_, k) => k !== action.i);
      return withHistory(state, {
        ...state,
        post: { ...state.post, slides },
        current: clamp(action.i > 0 ? action.i - 1 : 0, 0, slides.length - 1),
        sel: null,
      });
    }

    case 'moveSlide': {
      const slides = moveSlideTo(state.post.slides, action.from, action.to);
      if (slides === state.post.slides) return state;
      return withHistory(state, {
        ...state,
        post: { ...state.post, slides },
        current: action.to,
        sel: null,
      });
    }

    case 'swapCells':
      return withHistory(state, {
        ...state,
        post: replaceSlide(state.post, state.current, swapCells(state.post.slides[state.current], action.a, action.b)),
        sel: null,
      });

    case 'patchCell': {
      const slide = state.post.slides[action.slideIndex];
      if (!slide) return state;
      const cells = slide.cells.map((c, i) => (i === action.cellIndex ? { ...c, ...action.patch } : c));
      const next = { ...state, post: replaceSlide(state.post, action.slideIndex, { ...slide, cells }) };
      return action.history ? withHistory(state, next) : next;
    }

    case 'addText': {
      const slide = state.post.slides[action.slideIndex];
      if (!slide) return state;
      const texts = (slide.texts || []).concat([action.text]);
      return withHistory(state, {
        ...state,
        post: replaceTexts(state.post, action.slideIndex, texts),
        textSel: { slideIndex: action.slideIndex, id: action.text.id },
        sel: null,
        level: 'text',
        tool: null,
      });
    }

    case 'patchText': {
      const slide = state.post.slides[action.slideIndex];
      if (!slide) return state;
      const texts = (slide.texts || []).map((t) => (t.id === action.id ? { ...t, ...action.patch } : t));
      const next = { ...state, post: replaceTexts(state.post, action.slideIndex, texts) };
      return action.history ? withHistory(state, next) : next;
    }

    case 'removeText': {
      const slide = state.post.slides[action.slideIndex];
      if (!slide) return state;
      const texts = (slide.texts || []).filter((t) => t.id !== action.id);
      return withHistory(state, {
        ...state,
        post: replaceTexts(state.post, action.slideIndex, texts),
        textSel: null,
        level: 'page',
        tool: null,
      });
    }

    case 'reorderText': {
      /* Un peldaño: intercambia el texto con su vecino. dir +1 = adelante (arriba). */
      const slide = state.post.slides[action.slideIndex];
      if (!slide) return state;
      const texts = (slide.texts || []).slice();
      const i = texts.findIndex((t) => t.id === action.id);
      const j = i + action.dir;
      if (i < 0 || j < 0 || j >= texts.length) return state;
      [texts[i], texts[j]] = [texts[j], texts[i]];
      return withHistory(state, {
        ...state,
        post: replaceTexts(state.post, action.slideIndex, texts),
      });
    }

    case 'selectText':
      return {
        ...state,
        textSel: action.id ? { slideIndex: action.slideIndex, id: action.id } : null,
        sel: null,
        level: action.id ? 'text' : 'page',
        tool: null,
      };

    case 'mergeCells': {
      /* Une celdas (de una o VARIAS páginas) en un grupo que comparte una foto. El
         grupo adopta la foto de la primera celda con imagen. La foto cubre la caja
         envolvente del grupo aunque cruce la costura entre páginas. */
      const ids = action.cells || []; // [{ slideIndex, cellIndex }]
      if (ids.length < 2) return state;
      const groupId = uid();
      let imgId = null;
      for (const { slideIndex, cellIndex } of ids) {
        const im = state.post.slides[slideIndex]?.cells[cellIndex]?.imgId;
        if (im) { imgId = im; break; }
      }
      const bySlide = {};
      ids.forEach(({ slideIndex, cellIndex }) => {
        (bySlide[slideIndex] = bySlide[slideIndex] || new Set()).add(cellIndex);
      });
      const slides = state.post.slides.map((s, si) => (bySlide[si]
        ? { ...s, cells: s.cells.map((c, ci) => (bySlide[si].has(ci) ? { ...c, group: groupId } : c)) }
        : s));
      const groups = { ...(state.post.groups || {}), [groupId]: { imgId, t: newT() } };
      return withHistory(state, { ...state, post: { ...state.post, slides, groups }, sel: null });
    }

    case 'patchGroupT': {
      const g = (state.post.groups || {})[action.groupId];
      if (!g) return state;
      const groups = { ...state.post.groups, [action.groupId]: { ...g, t: action.t } };
      const next = { ...state, post: { ...state.post, groups } };
      return action.history ? withHistory(state, next) : next;
    }

    case 'setGroupImage': {
      /* Añade la foto importada al almacén y la pone como imagen del grupo (una foto
         para todas las celdas unidas). */
      const g = (state.post.groups || {})[action.groupId];
      if (!g) return state;
      const imagesNext = { ...state.images };
      action.added.forEach((a) => { imagesNext[a.id] = a; });
      const groups = { ...state.post.groups, [action.groupId]: { ...g, imgId: action.added[0]?.id || null } };
      return withHistory(state, { ...state, images: imagesNext, post: { ...state.post, groups } });
    }

    case 'leaveGroup': {
      /* Saca UNA celda de su grupo (la que se toca). Si el grupo queda con menos de
         dos celdas, se disuelve del todo (un grupo de una no tiene sentido). */
      const slide = state.post.slides[action.slideIndex];
      const gid = slide?.cells[action.cellIndex]?.group;
      if (!gid) return state;
      let post = replaceSlide(state.post, action.slideIndex, {
        ...slide,
        cells: slide.cells.map((c, i) => (i === action.cellIndex ? { ...c, group: undefined } : c)),
      });
      const remaining = post.slides.reduce((n, s) => n + s.cells.filter((c) => c.group === gid).length, 0);
      if (remaining < 2) {
        const groups = { ...(post.groups || {}) };
        delete groups[gid];
        post = {
          ...post,
          groups,
          slides: post.slides.map((s) => ({
            ...s,
            cells: s.cells.map((c) => (c.group === gid ? { ...c, group: undefined } : c)),
          })),
        };
      }
      return withHistory(state, { ...state, post, sel: null });
    }

    case 'clearGroupImage': {
      /* Quita la foto del grupo Y las fotos propias de sus celdas, dejando un grupo
         vacío limpio (si no, las celdas volvían a enseñar su foto de antes de unir). */
      const g = (state.post.groups || {})[action.groupId];
      if (!g) return state;
      const groups = { ...state.post.groups, [action.groupId]: { ...g, imgId: null } };
      const slides = state.post.slides.map((s) => ({
        ...s,
        cells: s.cells.map((c) => (c.group === action.groupId ? { ...c, imgId: null, t: newT() } : c)),
      }));
      return withHistory(state, { ...state, post: { ...state.post, slides, groups }, sel: null });
    }

    case 'unmergeGroup': {
      const groups = { ...(state.post.groups || {}) };
      delete groups[action.groupId];
      const slides = state.post.slides.map((s) => ({
        ...s,
        cells: s.cells.map((c) => (c.group === action.groupId ? { ...c, group: undefined } : c)),
      }));
      return withHistory(state, { ...state, post: { ...state.post, slides, groups }, sel: null });
    }

    case 'putImages': {
      /* Coloca las fotos importadas en la celda indicada y las siguientes vacias. */
      const images = { ...state.images };
      action.added.forEach((a) => { images[a.id] = a; });
      const slide = state.post.slides[action.slideIndex];
      const cells = slide.cells.map((c) => ({ ...c }));
      let ci = action.cellIndex;
      let k = 0;
      while (k < action.added.length && ci < cells.length) {
        if (ci === action.cellIndex || !cells[ci].imgId) {
          cells[ci] = { imgId: action.added[k].id, t: newT() };
          k++;
        }
        ci++;
      }
      return withHistory(state, {
        ...state,
        images,
        post: replaceSlide(state.post, action.slideIndex, { ...slide, cells }),
        sel: { slideIndex: action.slideIndex, cellIndex: action.cellIndex },
      });
    }

    case 'patchImage': {
      const im = state.images[action.id];
      if (!im) return state;
      const images = { ...state.images, [action.id]: { ...im, ...action.patch } };
      const post = action.cellPatches
        ? action.cellPatches.reduce(
            (p, cp) => replaceSlide(p, cp.slideIndex, {
              ...p.slides[cp.slideIndex],
              cells: p.slides[cp.slideIndex].cells.map((c, i) => (i === cp.cellIndex ? { ...c, t: cp.t } : c)),
            }),
            state.post
          )
        : state.post;
      const next = { ...state, images, post };
      return action.history ? withHistory(state, next) : next;
    }

    case 'dropImages': {
      const images = { ...state.images };
      action.ids.forEach((id) => { delete images[id]; });
      return { ...state, images };
    }

    case 'postSetting':
      return withHistory(state, { ...state, post: { ...state.post, ...action.patch } });

    case 'gap':
      /* Sin historial en cada paso: lo empuja el gesto completo desde la UI. */
      return { ...state, post: { ...state.post, gap: action.gap } };

    case 'loadPost':
      return {
        ...state,
        post: action.post,
        images: action.images || {},
        history: [],
        future: [],
        current: clamp(action.current || 0, 0, action.post.slides.length - 1),
        sel: null,
        textSel: null,
        tool: null,
      };

    case 'undo': {
      if (!state.history.length) return state;
      const history = state.history.slice();
      const entry = history.pop();
      /* Guarda el estado ACTUAL en el futuro, para poder rehacer. */
      const future = state.future.concat([snapshot(state)]);
      return restoreEntry(state, entry, history, future);
    }

    case 'redo': {
      if (!state.future.length) return state;
      const future = state.future.slice();
      const entry = future.pop();
      /* Vuelve a apilar el estado ACTUAL en el historial de deshacer. */
      const history = state.history.concat([snapshot(state)]);
      return restoreEntry(state, entry, history, future);
    }

    case 'orientApplied': {
      const { pendingOrient, ...rest } = state;
      return { ...rest, images: action.images || state.images };
    }

    case 'pushHistory':
      return withHistory(state, state);

    default:
      return state;
  }
}

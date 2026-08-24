import React, { useEffect, useRef, useState } from 'react';
import { RATIOS, MAX_SLIDES, TRANSPARENT, clamp } from '../../core/layouts.js';
import { HAPTIC, haptic } from '../../hooks/useHaptics.js';
import { useElementWidth } from '../../hooks/useElementWidth.js';
import { Icon } from '../../ui/icons.jsx';
import RegionCanvas from './RegionCanvas.jsx';
import s from './PostRail.module.css';

const TARGET_VISIBLE = 4.3;
const GAP = 10;
const EDGE_ZONE = 56;

/**
 * Nivel Post: la vista alejada. Reordenar es MOVER a una posicion, no
 * intercambiar.
 *
 * Fuera de la herramienta de mover las miniaturas dejan pasar el gesto
 * (`touch-action: pan-x`), asi que el carrusel se desplaza arrastrando sobre
 * ellas y no solo por los huecos. Dentro, el arrastre reordena y el carrusel se
 * desplaza solo al llegar a los bordes: sin eso no habria forma de llevar la
 * pagina 10 a la primera posicion.
 */
export default function PostRail({
  post, cells, current, tool, areaH, getSource, enter,
  onSelect, onOpen, onMove, onDuplicate, onDelete, onAdd, onLimit, onBackground,
}) {
  const railRef = useRef(null);
  const railW = useElementWidth(railRef);
  const [from, setFrom] = useState(null);
  const [over, setOver] = useState(null);
  /* Congelado al montar: alejarse desde Página se anima una vez, sin repetir. */
  const [zoomEntry] = useState(enter);
  const auto = useRef({ dir: 0, speed: 0, raf: null, x: 0, y: 0 });
  const drag = useRef({ x: 0, y: 0, active: false });
  const centered = useRef(-1);

  const R = RATIOS[post.ratio];
  let tileW = Math.max(52, Math.floor((railW - GAP * Math.floor(TARGET_VISIBLE)) / TARGET_VISIBLE));
  let tileH = Math.round((tileW * R.h) / R.w);
  if (tileH > areaH) { tileH = areaH; tileW = Math.round((tileH * R.w) / R.h); }

  const movable = tool === 'move';
  const full = post.slides.length >= MAX_SLIDES;

  /* Deja la pagina abierta a la vista, y solo cuando cambia: si se ha desplazado
     el carrusel a mano, se respeta. */
  useEffect(() => {
    const el = railRef.current;
    if (!el || centered.current === current) return;
    centered.current = current;
    const max = Math.max(0, (tileW + GAP) * (post.slides.length + 1) - el.clientWidth);
    const target = clamp((tileW + GAP) * current + tileW / 2 - el.clientWidth / 2, 0, max);
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, [current, tileW, post.slides.length]);

  const pageAt = (x, y) => {
    const node = document.elementFromPoint(x, y);
    const t = node?.closest?.('[data-page]');
    return t ? parseInt(t.dataset.page, 10) : null;
  };

  const stopAuto = () => {
    auto.current.dir = 0;
    if (auto.current.raf) cancelAnimationFrame(auto.current.raf);
    auto.current.raf = null;
  };

  const edgeScroll = (x, y) => {
    const el = railRef.current;
    const r = el.getBoundingClientRect();
    auto.current.x = x;
    auto.current.y = y;
    let dir = 0;
    let deep = 0;
    if (x < r.left + EDGE_ZONE) { dir = -1; deep = (r.left + EDGE_ZONE - x) / EDGE_ZONE; }
    else if (x > r.right - EDGE_ZONE) { dir = 1; deep = (x - (r.right - EDGE_ZONE)) / EDGE_ZONE; }
    auto.current.dir = dir;
    auto.current.speed = clamp(deep, 0, 1) * 16;
    if (dir && !auto.current.raf) {
      const step = () => {
        if (!auto.current.dir) { auto.current.raf = null; return; }
        el.scrollLeft += auto.current.dir * auto.current.speed;
        /* Con el dedo quieto en el borde no llegan mas pointermove, asi que el
           destino se recalcula aqui mientras el contenido pasa por debajo. */
        setOver(pageAt(auto.current.x, auto.current.y));
        auto.current.raf = requestAnimationFrame(step);
      };
      auto.current.raf = requestAnimationFrame(step);
    }
  };

  return (
    <div
      className={[s.rail, zoomEntry && s.zoomout].filter(Boolean).join(' ')}
      ref={railRef}
      /* Tocar el fondo del rail (no una miniatura) cierra la herramienta abierta. */
      onClick={(e) => { if (e.target === railRef.current) onBackground?.(); }}
    >
      {post.slides.map((sl, i) => (
        <div
          key={sl.id}
          data-page={i}
          className={[s.tile, i === current && s.on, from === i && s.lift,
            over === i && from !== null && from !== i && s.drop,
            post.bg === TRANSPARENT && 'checker'].filter(Boolean).join(' ')}
          style={{ width: tileW, height: tileH, touchAction: movable ? 'none' : 'pan-x' }}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY, active: false };
            if (movable) e.currentTarget.setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            /* Fuera de la herramienta el gesto es del carrusel, pero el toque
               sigue valiendo: no se puede anular aqui, porque cualquier toque real
               mueve el dedo un pixel. Lo anula pointercancel si el navegador se
               queda el gesto para desplazar. */
            if (!movable) return;
            const d = drag.current;
            if (!d.active && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) {
              d.active = true;
              setFrom(i);
            }
            if (!d.active) return;
            e.preventDefault();
            const target = pageAt(e.clientX, e.clientY);
            if (target !== over) {
              if (target !== null && target !== i) haptic(HAPTIC.drop);
              setOver(target);
            }
            edgeScroll(e.clientX, e.clientY);
          }}
          onPointerUp={(e) => {
            const wasDragging = drag.current.active;
            drag.current.active = false;
            stopAuto();
            if (movable && wasDragging) {
              const to = pageAt(e.clientX, e.clientY);
              setFrom(null);
              setOver(null);
              if (to !== null && to !== i) onMove(i, to);
              return;
            }
            /* Un toque selecciona, el segundo abre. */
            if (i === current) onOpen(i); else onSelect(i);
          }}
          onPointerCancel={() => { drag.current.active = false; stopAuto(); setFrom(null); setOver(null); }}
          onDoubleClick={() => onOpen(i)}
        >
          <RegionCanvas
            cells={cells} index={i} ratio={post.ratio} bg={post.bg} getSource={getSource} texts={sl.texts} fill={post.fill} res={300}
            style={{ width: tileW, height: tileH }}
          />
          <span className={s.num}>{String(i + 1).padStart(2, '0')}</span>

          {i === current && !movable && (
            <div className={s.acts}>
              <button
                type="button"
                title="Duplicar página"
                className={full ? s.off : undefined}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); if (full) onLimit(); else onDuplicate(); }}
              >
                <Icon.copy />
              </button>
              <button
                type="button"
                title="Borrar página"
                className={s.danger}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onDelete(i); }}
              >
                <Icon.trash />
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        className={[s.add, full && s.off].filter(Boolean).join(' ')}
        style={{ width: tileW, height: tileH }}
        title={full ? `Máximo de ${MAX_SLIDES} páginas` : 'Añadir página al final'}
        onClick={() => (full ? onLimit() : onAdd())}
      >
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path d="M12 5.5v13M5.5 12h13" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
    </div>
  );
}

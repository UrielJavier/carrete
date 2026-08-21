import React, { useRef, useState } from 'react';
import { clamp } from '../../core/layouts.js';
import { fontCss, LINE_HEIGHT } from '../../core/text.js';
import { HAPTIC, haptic } from '../../hooks/useHaptics.js';
import s from './TextLayer.module.css';

const SNAP_PX = 8; // distancia de enganche del imán, en píxeles de pantalla

/** Guías de imán de una página: centro de la página y centro de cada celda. */
function guidesFor(cells) {
  const vx = new Set([0.5]);
  const hy = new Set([0.5]);
  (cells || []).forEach((c) => {
    vx.add(c.rect.xLocal + c.rect.w / 2);
    hy.add(c.rect.y + c.rect.h / 2);
  });
  return { vx: [...vx], hy: [...hy] };
}

/** Pega `v` a la guía más cercana dentro del umbral; devuelve valor y guía (o null). */
function snap(v, guides, thr) {
  let best = null;
  let bd = thr;
  for (const g of guides) {
    const d = Math.abs(v - g);
    if (d <= bd) { bd = d; best = g; }
  }
  return best == null ? { v, g: null } : { v: best, g: best };
}

/**
 * Capa de textos sobre una página, SIEMPRE por encima de las fotos. La raíz no
 * captura eventos (pointer-events: none), así los toques en zonas vacías siguen
 * llegando a las celdas de abajo; solo las cajas de texto capturan, y únicamente
 * cuando la página está activa.
 *
 * Al arrastrar, el CENTRO del texto se imanta a los centros (vertical/horizontal)
 * de la página y de cada foto: pasas cerca y se pega, sigues y se suelta. Mientras
 * está pegado se pinta una línea guía. Es DOM (no canvas) para poder seleccionar y
 * arrastrar; el estilo replica lo que hace `drawTexts` en canvas.
 */
export default function TextLayer({ texts, cells, selId, active, stageH, onSelect, onMove }) {
  const rootRef = useRef(null);
  const drag = useRef(null);
  const [guide, setGuide] = useState({ x: null, y: null });

  if (!texts || !texts.length) return null;

  const onDown = (e, t) => {
    if (!active) return;
    e.stopPropagation();
    onSelect(t.id);
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = {
      id: t.id, sx: e.clientX, sy: e.clientY, ox: t.x, oy: t.y,
      rw: rect.width || 1, rh: rect.height || 1, x: t.x, y: t.y, moved: false,
      guides: guidesFor(cells), gx: null, gy: null,
    };
  };

  const onMoveP = (e) => {
    const d = drag.current;
    if (!d) return;
    const rawX = clamp(d.ox + (e.clientX - d.sx) / d.rw, 0, 1);
    const rawY = clamp(d.oy + (e.clientY - d.sy) / d.rh, 0, 1);
    const sX = snap(rawX, d.guides.vx, SNAP_PX / d.rw);
    const sY = snap(rawY, d.guides.hy, SNAP_PX / d.rh);
    /* Toque háptico solo al ENGANCHAR (cuando aparece una guía que no estaba). */
    if ((sX.g != null && sX.g !== d.gx) || (sY.g != null && sY.g !== d.gy)) haptic(HAPTIC.step);
    d.gx = sX.g;
    d.gy = sY.g;
    d.x = sX.v;
    d.y = sY.v;
    d.moved = true;
    setGuide({ x: sX.g, y: sY.g });
    onMove(d.id, d.x, d.y, false);
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    setGuide({ x: null, y: null });
    if (d && d.moved) onMove(d.id, d.x, d.y, true);
  };

  return (
    <div ref={rootRef} className={s.layer}>
      {guide.x != null && <i className={s.guideV} style={{ left: `${guide.x * 100}%` }} />}
      {guide.y != null && <i className={s.guideH} style={{ top: `${guide.y * 100}%` }} />}
      {texts.map((t) => (
        <div
          key={t.id}
          className={[s.box, active && s.on, t.id === selId && s.sel].filter(Boolean).join(' ')}
          style={{
            left: `${(t.x ?? 0.5) * 100}%`,
            top: `${(t.y ?? 0.5) * 100}%`,
            width: `${(t.w ?? 0.8) * 100}%`,
            transform: `translate(-50%, -50%) rotate(${t.rot || 0}deg)`,
            fontFamily: fontCss(t.font),
            fontSize: `${(t.size || 0.09) * stageH}px`,
            lineHeight: t.lh ?? LINE_HEIGHT,
            fontWeight: t.bold ? 700 : 400,
            fontStyle: t.italic ? 'italic' : 'normal',
            color: t.color || '#111111',
            textAlign: t.align || 'center',
          }}
          onPointerDown={(e) => onDown(e, t)}
          onPointerMove={onMoveP}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}

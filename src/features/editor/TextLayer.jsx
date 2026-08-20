import React, { useRef } from 'react';
import { clamp } from '../../core/layouts.js';
import { fontCss, LINE_HEIGHT } from '../../core/text.js';
import s from './TextLayer.module.css';

/**
 * Capa de textos sobre una página, SIEMPRE por encima de las fotos. La raíz no
 * captura eventos (pointer-events: none), así los toques en zonas vacías siguen
 * llegando a las celdas de abajo; solo las cajas de texto capturan, y únicamente
 * cuando la página está activa. Mover = arrastrar la caja: se mide la página al
 * empezar y el desplazamiento se traduce a coordenadas normalizadas (0..1).
 *
 * Es DOM (no canvas) para poder seleccionar y arrastrar; el estilo replica lo que
 * hace `drawTexts` en canvas (misma familia, tamaño relativo a la altura de página,
 * interlineado y alineación) para que lo que ves sea lo que se exporta.
 */
export default function TextLayer({ texts, selId, active, stageH, onSelect, onMove }) {
  const rootRef = useRef(null);
  const drag = useRef(null);

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
    };
  };

  const onMoveP = (e) => {
    const d = drag.current;
    if (!d) return;
    d.x = clamp(d.ox + (e.clientX - d.sx) / d.rw, 0, 1);
    d.y = clamp(d.oy + (e.clientY - d.sy) / d.rh, 0, 1);
    d.moved = true;
    onMove(d.id, d.x, d.y, false);
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    /* Un arrastre completo es UN paso de deshacer; un toque sin mover solo
       selecciona. */
    if (d && d.moved) onMove(d.id, d.x, d.y, true);
  };

  return (
    <div ref={rootRef} className={s.layer}>
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
            lineHeight: LINE_HEIGHT,
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

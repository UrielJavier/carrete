import React, { useRef } from 'react';
import { clamp } from '../../core/layouts.js';
import { imageUnits, clampT, newT } from '../../core/geometry.js';
import s from './GroupFrameLayer.module.css';

/**
 * Encuadre del grupo EN SU SITIO (sin superfoco): una capa transparente sobre la
 * región del grupo que captura arrastrar (mover) y pinza (ampliar) y actualiza el
 * transform del grupo. Misma matemática que el encuadre de una foto, pero la "caja"
 * es toda la región del grupo, así que la composición se ve entera mientras ajustas.
 */
export default function GroupFrameLayer({ rect, t, ia, aspect, onTransform }) {
  const boxRef = useRef(null);
  const ptrs = useRef(new Map());
  const gesture = useRef(null);
  const before = useRef(null);
  const cur = clampT(t || newT(), aspect, ia);

  const centroid = () => {
    const pts = [...ptrs.current.values()];
    return {
      x: pts.reduce((a, q) => a + q.x, 0) / pts.length,
      y: pts.reduce((a, q) => a + q.y, 0) / pts.length,
      d: pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
    };
  };
  const snap = () => ({ c: centroid(), t: { ...cur }, box: boxRef.current.getBoundingClientRect() });

  return (
    <div
      ref={boxRef}
      className={s.frame}
      style={{
        left: `${rect.xLocal * 100}%`,
        top: `${rect.y * 100}%`,
        width: `${rect.w * 100}%`,
        height: `${rect.h * 100}%`,
      }}
      onPointerDown={(e) => {
        boxRef.current?.setPointerCapture?.(e.pointerId);
        ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        gesture.current = snap();
        if (!before.current) before.current = { ...cur };
      }}
      onPointerMove={(e) => {
        const g = gesture.current;
        if (!g || !ptrs.current.has(e.pointerId)) return;
        e.preventDefault();
        ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const c = centroid();
        let scale = g.t.scale;
        if (ptrs.current.size > 1 && g.c.d > 0 && c.d > 0) {
          scale = clamp((g.t.scale * c.d) / g.c.d, 1, 8);
        }
        const un = imageUnits(scale, aspect, ia);
        onTransform(
          clampT({
            scale,
            fx: g.t.fx - (c.x - g.c.x) / (un.dwU * g.box.width),
            fy: g.t.fy - (c.y - g.c.y) / (un.dhU * g.box.height),
          }, aspect, ia),
          false,
        );
      }}
      onPointerUp={(e) => {
        ptrs.current.delete(e.pointerId);
        if (ptrs.current.size) { gesture.current = snap(); return; }
        gesture.current = null;
        const b = before.current;
        before.current = null;
        if (b) onTransform(cur, true);
      }}
      onPointerCancel={() => { ptrs.current.clear(); gesture.current = null; before.current = null; }}
      onDoubleClick={() => onTransform(newT(), true)}
    />
  );
}

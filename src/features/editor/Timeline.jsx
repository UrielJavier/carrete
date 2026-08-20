import React, { useRef } from 'react';
import { clamp } from '../../core/layouts.js';
import s from './Timeline.module.css';

const MAX = 30; // tope de segundos que admite un clip
const fmt = (t) => `${(t || 0).toFixed(1)}s`;

/**
 * Recorte de un vídeo: dos manijas (inicio/fin) sobre una línea de tiempo, con el
 * clip limitado a MAX segundos. No hay previsualización propia: el vídeo del área de
 * trabajo reproduce el trozo elegido, así que ese es el preview. Solo fija start/end.
 */
export default function Timeline({ duration, value, onChange }) {
  const trackRef = useRef(null);
  const drag = useRef(null); // 'start' | 'end'

  const dur = duration || 0;
  const start = value?.start ?? 0;
  const end = value?.end ?? Math.min(dur, MAX);
  const pct = (t) => `${(dur ? t / dur : 0) * 100}%`;

  const timeAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    return clamp((clientX - r.left) / r.width, 0, 1) * dur;
  };

  const move = (e) => {
    if (!drag.current) return;
    e.preventDefault();
    const t = timeAt(e.clientX);
    let ns = start;
    let ne = end;
    if (drag.current === 'start') {
      ns = clamp(t, 0, end - 0.1);
      if (end - ns > MAX) ns = end - MAX; // mantener el clip ≤ MAX
    } else {
      ne = clamp(t, start + 0.1, dur);
      if (ne - start > MAX) ne = start + MAX;
    }
    onChange({ start: ns, end: ne });
  };

  const down = (which) => (e) => {
    drag.current = which;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const up = () => { drag.current = null; };

  return (
    <div className={s.wrap}>
      <div
        ref={trackRef}
        className={s.track}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div className={s.range} style={{ left: pct(start), right: `calc(100% - ${pct(end)})` }} />
        <button
          type="button" className={s.handle} style={{ left: pct(start) }}
          aria-label="Inicio" onPointerDown={down('start')}
        />
        <button
          type="button" className={s.handle} style={{ left: pct(end) }}
          aria-label="Fin" onPointerDown={down('end')}
        />
      </div>

      <div className={s.times}>
        <span>{fmt(start)}</span>
        <span className={s.len}>{fmt(end - start)}</span>
        <span>{fmt(end)}</span>
      </div>
    </div>
  );
}

import React, { useRef } from 'react';
import s from './NotchSlider.module.css';

/**
 * Selector de pasos cerrados. Emite el indice, nunca un valor continuo.
 *
 * `onStart` sirve para que quien lo use empuje UN paso de deshacer por gesto
 * completo, y no uno por punto recorrido.
 */
export default function NotchSlider({ steps, index, onChange, onStart, ariaLabel }) {
  const ref = useRef(null);
  const dragging = useRef(false);

  const pick = (clientX) => {
    const r = ref.current.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / (r.width || 1)));
    return Math.round(p * (steps.length - 1));
  };

  const move = (clientX) => {
    const i = pick(clientX);
    if (i !== index) onChange(i, i === 0 || i === steps.length - 1);
  };

  return (
    <div
      ref={ref}
      className={s.track}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={steps[0]}
      aria-valuemax={steps[steps.length - 1]}
      aria-valuenow={steps[index]}
      onPointerDown={(e) => {
        dragging.current = true;
        ref.current.setPointerCapture?.(e.pointerId);
        onStart?.();
        move(e.clientX);
      }}
      onPointerMove={(e) => { if (dragging.current) move(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (index < steps.length - 1) { onStart?.(); onChange(index + 1, index + 1 === steps.length - 1); }
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          if (index > 0) { onStart?.(); onChange(index - 1, index - 1 === 0); }
        }
      }}
    >
      {steps.map((v, i) => (
        <span key={v} className={[s.dot, i === index && s.on, i < index && s.past].filter(Boolean).join(' ')} />
      ))}
    </div>
  );
}

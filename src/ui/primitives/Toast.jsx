import React, { useEffect } from 'react';
import s from './Toast.module.css';

const TONES = {
  neutral: { line: 'var(--c-line-strong)', text: 'var(--c-text)', tint: 'transparent', bar: 'var(--c-text-dim)' },
  dup: { line: 'var(--c-dup)', text: '#ffedd5', tint: 'var(--c-dup-tint)', bar: 'var(--c-dup)' },
  warn: { line: 'var(--c-warn)', text: '#fde68a', tint: 'var(--c-warn-tint)', bar: 'var(--c-warn)' },
};

/** El tono lo hereda del elemento que lo abre, para que se entienda de donde
 *  viene sin leerlo. */
export default function Toast({ toast, duration, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onDone]);

  if (!toast) return null;
  const t = TONES[toast.tone] || TONES.neutral;
  return (
    <div
      key={toast.id}
      className={s.toast}
      style={{
        borderColor: t.line,
        background: `linear-gradient(${t.tint}, ${t.tint}), var(--c-surface)`,
      }}
    >
      <span className={s.msg} style={{ color: t.text }}>{toast.msg}</span>
      <i className={s.bar} style={{ background: t.bar, animationDuration: `${duration}ms` }} />
    </div>
  );
}

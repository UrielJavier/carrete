import React from 'react';
import s from './ToolBox.module.css';

export function ToolRow({ children }) {
  return <div className={s.row}>{children}</div>;
}

/**
 * Una herramienta. Si esta apagada con motivo sigue siendo pulsable, para poder
 * decir por que no esta disponible.
 */
export default function ToolBox({
  icon, label, on, danger, disabled, disabledReason, onClick, children,
}) {
  const muted = disabled && !!disabledReason;
  const cls = [s.box, on && s.on, danger && s.danger, disabled && s.off].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={cls}
      disabled={disabled && !disabledReason}
      onClick={muted ? disabledReason : onClick}
    >
      {icon}
      <span>{label}</span>
      {children}
    </button>
  );
}

export const Swatch = ({ color }) => (
  color === 'transparent'
    ? <span className={`${s.swatch} checker`} />
    : <span className={s.swatch} style={{ background: color }} />
);

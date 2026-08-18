import React from 'react';
import s from './Button.module.css';

/**
 * Boton unico de la aplicacion.
 *
 * `variant` decide el aspecto; `disabledReason` permite dejarlo apagado pero
 * pulsable para poder explicar por que no esta disponible, que es algo que un
 * boton con el atributo disabled no puede hacer.
 */
export default function Button({
  variant = 'outline',
  on = false,
  danger = false,
  disabled = false,
  disabledReason,
  className = '',
  style,
  title,
  children,
  onClick,
  ...rest
}) {
  const muted = disabled && !!disabledReason;
  const cls = [
    s.base,
    s[variant],
    on && s.on,
    danger && s.danger,
    muted && s.muted,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={cls}
      style={style}
      title={title}
      disabled={disabled && !disabledReason}
      onClick={muted ? disabledReason : onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

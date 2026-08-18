import React, { useEffect } from 'react';
import Button from './Button.jsx';
import s from './Dialog.module.css';

/** Confirmacion para acciones que destruyen trabajo ya hecho. */
export default function Dialog({ ask, onClose }) {
  useEffect(() => {
    if (!ask) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ask, onClose]);

  if (!ask) return null;
  return (
    <div className={s.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={s.box}>
        <h3 className={s.title}>{ask.title}</h3>
        <p className={s.body}>{ask.body}</p>
        <div className={s.actions}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => { onClose(); ask.onOk(); }}>{ask.ok}</Button>
        </div>
      </div>
    </div>
  );
}

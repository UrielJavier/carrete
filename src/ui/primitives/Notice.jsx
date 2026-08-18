import React from 'react';
import { Icon } from '../icons.jsx';
import s from './Notice.module.css';

export default function Notice({ tone = 'warn', children, actionLabel, onAction, onClose }) {
  return (
    <div className={`${s.notice} ${s[tone]}`}>
      <Icon.warn />
      <p>{children}</p>
      {actionLabel && <button type="button" className={s.action} onClick={onAction}>{actionLabel}</button>}
      {onClose && <button type="button" className={s.close} onClick={onClose}>✕</button>}
    </div>
  );
}

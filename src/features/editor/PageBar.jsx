import React from 'react';
import { Button } from '../../ui/primitives/index.js';
import { Icon } from '../../ui/icons.jsx';
import s from './PageBar.module.css';

export default function PageBar({ current, total, onPrev, onNext }) {
  return (
    <div className={s.bar}>
      <Button variant="ghost" title="Página anterior" disabled={current === 0} onClick={onPrev}>
        <Icon.left />
      </Button>
      <span className={s.num}>{String(current + 1).padStart(2, '0')} / {total}</span>
      <Button variant="ghost" title="Página siguiente" disabled={current === total - 1} onClick={onNext}>
        <Icon.right />
      </Button>
    </div>
  );
}

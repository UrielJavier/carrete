import React from 'react';
import { Label } from './Text.jsx';
import s from './Field.module.css';

export default function Field({ label, children, right }) {
  return (
    <div className={s.row}>
      <Label>{label}</Label>
      <div className={s.control}>{children}</div>
      {right}
    </div>
  );
}

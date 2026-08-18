import React from 'react';
import s from './Text.module.css';

export const Caption = ({ children, className = '' }) => (
  <p className={`${s.caption} ${className}`}>{children}</p>
);

export const Hint = ({ children, className = '' }) => (
  <p className={`${s.hint} ${className}`}>{children}</p>
);

export const Meta = ({ children, className = '' }) => (
  <p className={`${s.meta} ${className}`}>{children}</p>
);

export const Label = ({ children }) => <span className={s.label}>{children}</span>;

export const Value = ({ children, style }) => (
  <span className={s.value} style={style}>{children}</span>
);

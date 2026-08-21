import React from 'react';
import { Button } from '../primitives/index.js';
import { Icon } from '../icons.jsx';
import s from './AppShell.module.css';

export const Section = ({ children, className = '' }) => (
  <div className={`${s.section} ${className}`}>{children}</div>
);

export const Busy = ({ label }) => (label ? <div className={s.busy}>{label}</div> : null);

/**
 * `appBar` es de la aplicacion y esta siempre. `docBar` es del documento y solo
 * aparece cuando hay uno abierto.
 */
export default function AppShell({
  version, onHome, onMenu,
  fullscreen, onFullscreen,
  docBar, meta, notices, children,
}) {
  return (
    <>
      <header className={s.header}>
        <div className={s.bar}>
          {onMenu && (
            <Button variant="icon" title="Menú" onClick={onMenu}>
              <Icon.menu />
            </Button>
          )}
          <div className={s.brandwrap}>
            <button type="button" className={s.home} title="Inicio" onClick={onHome}>
              <h1 className={s.brand}>Maqueta</h1>
            </button>
            <span className={s.ver}>v{version}</span>
          </div>
          <span className={s.grow} />
          <Button variant="icon" title="Pantalla completa" onClick={onFullscreen}>
            {fullscreen ? <Icon.shrink /> : <Icon.expand />}
          </Button>
        </div>
        {docBar && <div className={s.docbar}>{docBar}</div>}
      </header>

      {meta && <p className={s.projmeta}>{meta}</p>}
      {notices}
      {children}
    </>
  );
}

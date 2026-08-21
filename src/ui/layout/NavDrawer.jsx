import React from 'react';
import { Icon } from '../icons.jsx';
import s from './NavDrawer.module.css';

/**
 * Cajón de navegación (hamburguesa) para los destinos "meta": proyectos, biblioteca,
 * feedback… El bucle de edición (Editar/Feed/Perfil + Exportar) NO vive aquí, para
 * que la barra principal siga limpia. Se cierra tocando fuera o un elemento.
 */
export default function NavDrawer({ open, items, footer, onClose }) {
  return (
    <div className={[s.wrap, open && s.on].filter(Boolean).join(' ')} aria-hidden={!open}>
      <div className={s.backdrop} onClick={onClose} />
      <nav className={s.panel} aria-label="Menú">
        <div className={s.head}>
          <span className={s.title}>Maqueta</span>
          <button type="button" className={s.close} title="Cerrar" onClick={onClose}>
            <Icon.close />
          </button>
        </div>
        <ul className={s.list}>
          {items.map((it) => (
            <li key={it.key}>
              <button
                type="button"
                className={[s.item, it.active && s.active].filter(Boolean).join(' ')}
                onClick={() => { it.onClick(); onClose(); }}
              >
                <span className={s.ico}>{it.icon}</span>
                <span className={s.labels}>
                  <span className={s.label}>{it.label}</span>
                  {it.sub && <span className={s.sub}>{it.sub}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {footer && <div className={s.foot}>{footer}</div>}
      </nav>
    </div>
  );
}

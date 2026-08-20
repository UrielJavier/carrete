import React from 'react';
import PostPanel from './panels/PostPanel.jsx';
import PagePanel from './panels/PagePanel.jsx';
import PhotoPanel from './panels/PhotoPanel.jsx';
import s from './LevelPanel.module.css';

/**
 * Un solo panel para los tres niveles, con un BREADCRUMB en lugar de pestañas. La
 * jerarquía es real: Carrusel › Página › Foto. Se baja tocando contenido (una página
 * en Carrusel, una foto en Página) y se sube tocando un tramo del camino. Así no hay
 * un nivel de navegación abstracto: la selección y el camino lo cuentan todo.
 *
 * Aqui solo va el breadcrumb y se elige el panel; cada nivel trae sus herramientas.
 */
function Breadcrumb({ level, current, onGo }) {
  const segs = [{ label: 'Carrusel', to: 'post' }];
  if (level === 'page' || level === 'photo') segs.push({ label: `Página ${current + 1}`, to: 'page' });
  if (level === 'photo') segs.push({ label: 'Foto', to: 'photo' });

  return (
    <nav className={s.crumbs} aria-label="Navegación">
      {segs.map((seg, i) => {
        const last = i === segs.length - 1;
        return (
          <React.Fragment key={seg.to}>
            {i > 0 && <span className={s.sep} aria-hidden="true">›</span>}
            {last ? (
              <span className={s.crumbNow} aria-current="page">{seg.label}</span>
            ) : (
              <button type="button" className={s.crumb} onClick={() => onGo(seg.to)}>
                {seg.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default function LevelPanel({ level, current, onGo, children }) {
  return (
    <div className={s.panel}>
      <Breadcrumb level={level} current={current} onGo={onGo} />
      {/* key por nivel: al cambiar de nivel el cuerpo se remonta y reproduce la
          animación de entrada, para que se note que las herramientas han cambiado. */}
      <div className={s.body} key={level}>{children}</div>
    </div>
  );
}

export { PostPanel, PagePanel, PhotoPanel };

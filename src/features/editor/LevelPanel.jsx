import React from 'react';
import { SegmentedControl } from '../../ui/primitives/index.js';
import PostPanel from './panels/PostPanel.jsx';
import PagePanel from './panels/PagePanel.jsx';
import PhotoPanel from './panels/PhotoPanel.jsx';
import s from './LevelPanel.module.css';

/**
 * Un solo panel para los tres niveles. El nivel es a la vez QUE editas y A QUE
 * DISTANCIA lo miras, y lo decide la seleccion: tocar una foto baja a Foto,
 * deseleccionar sube a Página.
 *
 * Aqui solo se elige el panel; cada nivel se encarga de sus herramientas.
 */
export default function LevelPanel({ level, onLevel, photoAvailable, onNeedPhoto, children }) {
  return (
    <div className={s.panel}>
      <SegmentedControl
        wide
        value={level}
        onChange={onLevel}
        options={[
          { value: 'post', label: 'Post' },
          { value: 'page', label: 'Página' },
          { value: 'photo', label: 'Foto', disabledReason: photoAvailable ? undefined : onNeedPhoto },
        ]}
      />
      {/* key por nivel: al cambiar de nivel el cuerpo se remonta y reproduce la
          animación de entrada, para que se note que las herramientas han cambiado. */}
      <div className={s.body} key={level}>{children}</div>
    </div>
  );
}

export { PostPanel, PagePanel, PhotoPanel };

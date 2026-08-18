import React from 'react';
import { LAYOUTS } from '../../../core/layouts.js';
import { ToolBox, ToolRow, Hint } from '../../../ui/primitives/index.js';
import { Icon, LayoutGlyph } from '../../../ui/icons.jsx';
import { Back } from './PostPanel.jsx';
import s from '../LevelPanel.module.css';

/** Nivel Página: la rejilla y el orden de las fotos dentro de ella. */
export default function PagePanel({
  slide, current, totalPages, photoCount, tool, ratio,
  onTool, onBack, onLayout, onNeedTwo,
}) {
  if (tool === 'layout') {
    return (
      <>
        <Back label="layout" onBack={onBack} />
        <div className={s.layouts}>
          {Object.keys(LAYOUTS).map((k) => (
            <button
              key={k}
              type="button"
              title={LAYOUTS[k].name}
              className={[s.glyph, slide.layoutId === k && s.on].filter(Boolean).join(' ')}
              onClick={() => onLayout(k)}
            >
              <LayoutGlyph layoutId={k} ratio={ratio} box={22} />
            </button>
          ))}
        </div>
        <Hint>la rejilla de la página {current + 1}</Hint>
      </>
    );
  }

  if (tool === 'move') {
    return (
      <>
        <Back label="mover" onBack={onBack} />
        <Hint>arrastra una foto sobre otra para intercambiarlas</Hint>
      </>
    );
  }

  return (
    <>
      <ToolRow>
        <ToolBox icon={<LayoutGlyph layoutId={slide.layoutId} ratio={ratio} />} label="layout"
          onClick={() => onTool('layout')} />
        <ToolBox icon={<Icon.move />} label="mover" disabled={photoCount < 2}
          disabledReason={onNeedTwo} onClick={() => onTool('move')} />
      </ToolRow>
      <Hint>
        {totalPages > 1
          ? 'desliza para cambiar de página · toca una foto y otra vez para editarla'
          : 'toca un hueco para poner una foto · toca otra vez para editarla'}
      </Hint>
    </>
  );
}

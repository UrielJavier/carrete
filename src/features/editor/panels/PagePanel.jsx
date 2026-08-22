import React from 'react';
import { LAYOUTS } from '../../../core/layouts.js';
import { ToolBox, ToolRow, Hint, Button } from '../../../ui/primitives/index.js';
import { Icon, LayoutGlyph } from '../../../ui/icons.jsx';
import { Back } from './PostPanel.jsx';
import s from '../LevelPanel.module.css';

/** Nivel Página: la rejilla, el orden de las fotos y las celdas unidas. */
export default function PagePanel({
  slide, current, totalPages, photoCount, tool, ratio, mergeCount, group,
  onTool, onBack, onLayout, onNeedTwo, onDelete, onAddText, onMerge, onUnmerge,
}) {
  if (tool === 'layout') {
    return (
      <>
        <Back label="layout" sub="cómo se reparten las fotos" onBack={onBack} />
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
      </>
    );
  }

  if (tool === 'move') {
    return (
      <>
        <Back label="mover" sub="arrastra una foto sobre otra" onBack={onBack} />
      </>
    );
  }

  if (tool === 'merge') {
    return (
      <>
        <Back label="grupos" sub="unir y separar celdas" onBack={onBack} />
        <Button variant="primary" disabled={mergeCount < 2} onClick={onMerge} style={{ width: '100%' }}>
          {mergeCount < 2 ? 'toca 2 o más celdas' : `Unir ${mergeCount} celdas`}
        </Button>
        <Hint>toca celdas contiguas para unirlas (compartirán una foto) · toca una celda ya unida para separarla.</Hint>
      </>
    );
  }

  const cellCount = LAYOUTS[slide.layoutId].cells.length;

  return (
    <>
      <ToolRow>
        <ToolBox icon={<LayoutGlyph layoutId={slide.layoutId} ratio={ratio} />} label="layout"
          onClick={() => onTool('layout')} />
        <ToolBox icon={<Icon.move />} label="mover" disabled={photoCount < 2}
          disabledReason={onNeedTwo} onClick={() => onTool('move')} />
        <ToolBox icon={<Icon.merge />} label="grupos" disabled={cellCount < 2}
          onClick={() => onTool('merge')} />
        <ToolBox icon={<Icon.text />} label="texto" onClick={onAddText} />
        <ToolBox icon={<Icon.trash />} label="borrar" danger onClick={onDelete} />
      </ToolRow>
      {group ? (
        <Hint>celdas unidas · grupo de {group.count} · usa <strong>grupos</strong> para separarlas.</Hint>
      ) : (
        <Hint>
          {totalPages > 1
            ? 'desliza para cambiar de página · toca una foto y otra vez para editarla'
            : 'toca un hueco para poner una foto · toca otra vez para editarla'}
        </Hint>
      )}
    </>
  );
}

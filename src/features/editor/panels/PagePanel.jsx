import React from 'react';
import { LAYOUTS } from '../../../core/layouts.js';
import { ToolBox, ToolRow, Hint, Button } from '../../../ui/primitives/index.js';
import { Icon, LayoutGlyph } from '../../../ui/icons.jsx';
import { Back } from './PostPanel.jsx';
import s from '../LevelPanel.module.css';

/** Nivel Página: la rejilla, el orden de las fotos y las celdas unidas. */
export default function PagePanel({
  slide, current, totalPages, photoCount, tool, ratio, mergeCount, group,
  groups = [], activeGid = null,
  onTool, onBack, onLayout, onNeedTwo, onDelete, onAddText, onMerge, onPickGroup,
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
    const active = groups.find((g) => g.id === activeGid) || null;
    const hasGroups = groups.length > 0;
    return (
      <>
        <Back label="grupos" sub="celdas que comparten una foto" onBack={onBack} />

        {/* Grupos existentes pintados como herramientas: booleano tipo radio (solo uno
            activo). Elegir uno lo enciende para editarlo; no abre ningún subpanel. */}
        {hasGroups && (
          <ToolRow>
            {groups.map((g) => (
              <ToolBox
                key={g.id}
                icon={<span className={s.groupdot} style={{ background: g.color }}>{g.num}</span>}
                label={`${g.count} celdas`}
                on={g.id === activeGid}
                onClick={() => onPickGroup(g.id)}
              />
            ))}
          </ToolRow>
        )}

        {active ? (
          <Hint>toca una celda libre para añadirla · una del grupo para quitarla · toca el grupo otra vez para salir.</Hint>
        ) : hasGroups ? (
          /* Ya hay grupos: sin el aviso de «toca 2…». El botón Unir solo aparece
             cuando ya hay 2+ celdas marcadas para un grupo nuevo. */
          mergeCount >= 2 && (
            <Button variant="primary" onClick={onMerge} style={{ width: '100%' }}>
              Unir {mergeCount} celdas
            </Button>
          )
        ) : (
          /* Estado vacío (aún sin grupos): se explica cómo crear el primero. */
          <>
            <Button variant="primary" disabled={mergeCount < 2} onClick={onMerge} style={{ width: '100%' }}>
              {mergeCount < 2 ? 'toca 2 o más celdas' : `Unir ${mergeCount} celdas`}
            </Button>
            <Hint>une celdas para que compartan una foto, como una máscara · puedes deslizar a otras páginas.</Hint>
          </>
        )}
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
        <Hint>
          grupo de {group.count} celdas · <strong>doble toque</strong> para encuadrar la foto ·
          usa <strong>grupos</strong> para separar.
        </Hint>
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

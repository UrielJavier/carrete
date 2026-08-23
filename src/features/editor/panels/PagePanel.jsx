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
    return (
      <>
        <Back label="grupos" sub="celdas que comparten una foto" onBack={onBack} />

        {/* Grupos existentes como radios: solo uno activo. Tocar uno lo enciende para
            editarlo (añadir/quitar celdas); tocarlo otra vez lo apaga. */}
        {groups.length > 0 && (
          <div className={s.groupradios} role="radiogroup" aria-label="grupos">
            {groups.map((g) => {
              const on = g.id === activeGid;
              return (
                <button
                  key={g.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={[s.grouprow, on && s.on].filter(Boolean).join(' ')}
                  onClick={() => onPickGroup(g.id)}
                >
                  <span className={[s.radio, on && s.on].filter(Boolean).join(' ')} />
                  <span className={s.groupdot} style={{ background: g.color }}>{g.num}</span>
                  <span className={s.grouprowlbl}>grupo {g.num}</span>
                  <span className={s.grouprowcount}>{g.count} celdas</span>
                </button>
              );
            })}
          </div>
        )}

        {active ? (
          <Hint>
            editando el <strong>grupo {active.num}</strong> · toca una celda libre para
            añadirla · toca una del grupo para quitarla · toca el grupo otra vez para salir.
          </Hint>
        ) : (
          <>
            <Button variant="primary" disabled={mergeCount < 2} onClick={onMerge} style={{ width: '100%' }}>
              {mergeCount < 2 ? 'toca 2 o más celdas' : `Unir ${mergeCount} celdas`}
            </Button>
            <Hint>
              {groups.length > 0
                ? 'toca celdas libres para un grupo nuevo · o elige un grupo para editarlo.'
                : 'une celdas para que compartan una foto, como una máscara · puedes deslizar a otras páginas.'}
            </Hint>
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

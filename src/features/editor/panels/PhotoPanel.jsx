import React from 'react';
import { splitRotation } from '../../../core/post.js';
import { newT } from '../../../core/geometry.js';
import { ToolBox, ToolRow, Hint, Field, FileInput } from '../../../ui/primitives/index.js';
import { Icon, RotGlyph } from '../../../ui/icons.jsx';
import { Back } from './PostPanel.jsx';
import s from '../LevelPanel.module.css';

/** Nivel Foto: lo que antes eran botones encima de la imagen. Fuera del lienzo,
 *  la foto se ve entera mientras la encuadras. */
export default function PhotoPanel({
  image, tool, showThirds,
  onTool, onBack, onRotate, onMirror, onThirds, onCenter, onReplace, onRemove,
}) {
  if (tool === 'rotate') {
    return (
      <>
        <Back label="girar" onBack={onBack} />
        <RotateControls rot={image.rot || 0} onSet={onRotate} />
        <Hint>
          toca el ángulo para volver a recto · al inclinar, las esquinas quedan
          vacías: amplía para taparlas
        </Hint>
      </>
    );
  }

  return (
    <>
      <ToolRow>
        <ToolBox icon={<RotGlyph deg={image.rot || 0} />} label="girar" onClick={() => onTool('rotate')} />
        <ToolBox icon={<Icon.mirror />} label="espejo" on={!!image.flip} onClick={onMirror} />
        <ToolBox icon={<Icon.grid />} label="tercios" on={showThirds} onClick={onThirds} />
        <ToolBox icon={<Icon.center />} label="centrar" onClick={() => onCenter(newT())} />
        <ToolBox icon={<Icon.swap />} label="cambiar">
          <FileInput onFiles={onReplace} />
        </ToolBox>
        <ToolBox icon={<Icon.trash />} label="quitar" danger onClick={onRemove} />
      </ToolRow>
      <Hint>
        {image.name} · {image.w}×{image.h}
        {image.rot ? ` · ${image.rot}°` : ''}{image.flip ? ' · espejo' : ''}
        {'  —  arrastra para encuadrar, pinza para ampliar'}
      </Hint>
    </>
  );
}

/**
 * Vuelta y ajuste son INDEPENDIENTES: si has enderezado +1,5° y pulsas 90°,
 * quedas en 91,5° en lugar de perder el ajuste. El valor del medio es tambien el
 * boton de volver a recto, asi que no hace falta un control aparte.
 */
function RotateControls({ rot, onSet }) {
  const { base, off } = splitRotation(rot);
  const label = `${off > 0 ? '+' : off < 0 ? '−' : ''}${String(Math.abs(off)).replace('.', ',')}°`;
  return (
    <>
      <Field label="vuelta">
        <div className={s.rotgrid}>
          {[0, 90, 180, 270].map((deg) => (
            <button key={deg} type="button" className={deg === base ? s.on : undefined}
              onClick={() => onSet(deg + off)}>{deg}°</button>
          ))}
        </div>
      </Field>
      <Field label="ajuste">
        <div className={s.rotgrid}>
          <button type="button" disabled={Math.abs(off - 0.5) > 20}
            onClick={() => onSet(base + off - 0.5)}>−½°</button>
          <button
            type="button"
            className={[s.deg, off !== 0 && s.tilted].filter(Boolean).join(' ')}
            disabled={off === 0}
            title={off === 0 ? 'Sin inclinación' : 'Volver a recto'}
            onClick={() => onSet(base)}
          >
            {label}
          </button>
          <button type="button" disabled={Math.abs(off + 0.5) > 20}
            onClick={() => onSet(base + off + 0.5)}>+½°</button>
        </div>
      </Field>
    </>
  );
}

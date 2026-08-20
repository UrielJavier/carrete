import React from 'react';
import { FONTS } from '../../../core/text.js';
import { ToolBox, ToolRow, Field, Hint, ColorSwatches } from '../../../ui/primitives/index.js';
import { Icon } from '../../../ui/icons.jsx';
import { Back } from './PostPanel.jsx';
import s from './TextPanel.module.css';

const COLORS = ['#ffffff', '#000000', '#e11d48', '#2563eb', '#f59e0b'];
const ALIGNS = [
  { key: 'left', label: '⯇' },
  { key: 'center', label: '≡' },
  { key: 'right', label: '⯈' },
];

/**
 * Panel de un texto seleccionado. Cada texto elige su fuente, color, tamaño y giro
 * por separado. El orden entre textos se mueve de uno en uno (adelante/atrás), no
 * de golpe al extremo. Mover por la página se hace arrastrando la caja.
 */
export default function TextPanel({ text, onPatch, onReorder, onRemove, onBack }) {
  return (
    <>
      <Back label="texto" sub="fuente, color, tamaño y giro" onBack={onBack} />

      <Field label="texto">
        <textarea
          className={s.area}
          rows={2}
          value={text.content}
          placeholder="Escribe aquí…"
          onChange={(e) => onPatch({ content: e.target.value }, false)}
          onBlur={() => onPatch({}, true)}
        />
      </Field>

      <Field label="fuente">
        <div className={s.fonts}>
          {FONTS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={[s.fontbtn, text.font === f.key && s.on].filter(Boolean).join(' ')}
              style={{ fontFamily: f.css }}
              onClick={() => onPatch({ font: f.key }, true)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="color">
        <ColorSwatches
          value={text.color}
          presets={COLORS}
          custom={COLORS.includes(text.color) ? '#111111' : text.color}
          onPick={(c) => onPatch({ color: c }, true)}
          onCustom={(c) => onPatch({ color: c }, false)}
        />
      </Field>

      <Field label="tamaño">
        <input
          className={s.range}
          type="range"
          min={0.03}
          max={0.3}
          step={0.005}
          value={text.size}
          onChange={(e) => onPatch({ size: Number(e.target.value) }, false)}
          onPointerUp={() => onPatch({}, true)}
        />
      </Field>

      <Field label="giro">
        <input
          className={s.range}
          type="range"
          min={-180}
          max={180}
          step={1}
          value={text.rot || 0}
          onChange={(e) => onPatch({ rot: Number(e.target.value) }, false)}
          onPointerUp={() => onPatch({}, true)}
        />
      </Field>

      <Field label="alineación">
        <div className={s.aligns}>
          {ALIGNS.map((a) => (
            <button
              key={a.key}
              type="button"
              className={[s.alignbtn, (text.align || 'center') === a.key && s.on].filter(Boolean).join(' ')}
              onClick={() => onPatch({ align: a.key }, true)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </Field>

      <ToolRow>
        <ToolBox icon={<Icon.front />} label="adelante" onClick={() => onReorder(1)} />
        <ToolBox icon={<Icon.back />} label="atrás" onClick={() => onReorder(-1)} />
        <ToolBox icon={<Icon.trash />} label="quitar" danger onClick={onRemove} />
      </ToolRow>
      <Hint>arrastra el texto sobre la página para colocarlo · va siempre encima de las fotos</Hint>
    </>
  );
}

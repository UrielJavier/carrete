import React from 'react';
import { contrastOn } from '../../core/color.js';
import { TRANSPARENT } from '../../core/layouts.js';
import { Icon } from '../icons.jsx';
import s from './ColorSwatches.module.css';

const titulo = (c) => (
  c === '#ffffff' ? 'Fondo blanco'
    : c === '#000000' ? 'Fondo negro'
      : 'Sin fondo (transparente)'
);

/**
 * El tick se dibuja con la tinta que contrasta con el propio color, calculada por
 * luminancia: negro sobre claros, blanco sobre oscuros. El transparente se
 * representa con un damero y lleva tinta clara.
 */
export default function ColorSwatches({ value, presets, custom, onPick, onCustom }) {
  const isCustom = !presets.includes(value);
  return (
    <div className={s.row}>
      {presets.map((c) => {
        const transparente = c === TRANSPARENT;
        return (
          <button
            key={c}
            type="button"
            className={[s.swatch, transparente && 'checker', value === c && s.on]
              .filter(Boolean).join(' ')}
            style={transparente ? undefined : { background: c }}
            title={titulo(c)}
            onClick={() => onPick(c)}
          >
            {value === c && Icon.tick(transparente ? 'var(--c-text)' : contrastOn(c))}
          </button>
        );
      })}
      <span
        className={[s.swatch, isCustom && s.on].filter(Boolean).join(' ')}
        style={{ background: custom }}
        title="Color personalizado"
      >
        {isCustom && Icon.tick(contrastOn(custom))}
        <input
          type="color"
          className={s.picker}
          value={custom}
          onChange={(e) => onCustom(e.target.value)}
        />
      </span>
    </div>
  );
}

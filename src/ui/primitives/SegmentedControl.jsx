import React from 'react';
import s from './SegmentedControl.module.css';

/**
 * Selector segmentado. Lo usan las vistas, los niveles, la proporcion y el
 * formato: al ser el mismo componente, todos se comportan igual.
 *
 * Cada opcion puede venir apagada con un motivo, y entonces sigue siendo
 * pulsable para poder explicarse.
 */
export default function SegmentedControl({ value, options, onChange, wide = false, stacked = false }) {
  return (
    <div className={[s.group, wide && s.wide].filter(Boolean).join(' ')}>
      {options.map((o) => {
        const off = !!o.disabledReason;
        return (
          <button
            key={o.value}
            type="button"
            title={o.title}
            className={[s.item, stacked && s.stacked, value === o.value && s.on, off && s.off]
              .filter(Boolean).join(' ')}
            onClick={() => (off ? o.disabledReason() : onChange(o.value))}
          >
            {o.icon}
            {o.label != null && <span>{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

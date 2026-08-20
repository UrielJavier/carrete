import React from 'react';
import { FONTS, fontCss } from '../../../core/text.js';
import { ToolBox, ToolRow, Field, Hint, ColorSwatches, Swatch } from '../../../ui/primitives/index.js';
import { Icon, RotGlyph } from '../../../ui/icons.jsx';
import { Back } from './PostPanel.jsx';
import s from './TextPanel.module.css';

const COLORS = ['#ffffff', '#000000', '#e11d48', '#2563eb', '#f59e0b'];
const ALIGNS = [
  { key: 'left', label: 'izq.' },
  { key: 'center', label: 'centro' },
  { key: 'right', label: 'der.' },
];

/** "Aa" pintado con la fuente elegida: el glifo ES el valor de la herramienta. */
const AaGlyph = ({ font }) => (
  <span className={s.aa} style={{ fontFamily: fontCss(font) }}>Aa</span>
);

/**
 * Nivel Texto: mismas mecánicas que Foto. Una fila de herramientas y cada una abre
 * su propio mini-panel, así no hay que hacer scroll vertical en una caja pequeña.
 * Subir a Página se hace por el breadcrumb; el orden (z-index) entre textos es una
 * herramienta más, de uno en uno.
 */
export default function TextPanel({ text, tool, onTool, onPatch, onReorder, onRemove }) {
  if (tool === 'write') {
    return (
      <>
        <Back label="escribir" sub="contenido y alineación" onBack={() => onTool(null)} />
        <Field label="texto">
          <textarea
            className={s.area}
            rows={2}
            autoFocus
            value={text.content}
            placeholder="Escribe aquí…"
            onChange={(e) => onPatch({ content: e.target.value }, false)}
            onBlur={() => onPatch({}, true)}
          />
        </Field>
        <Field label="alineación">
          <div className={s.seg}>
            {ALIGNS.map((a) => (
              <button
                key={a.key}
                type="button"
                className={[s.segbtn, (text.align || 'center') === a.key && s.on].filter(Boolean).join(' ')}
                onClick={() => onPatch({ align: a.key }, true)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </Field>
      </>
    );
  }

  if (tool === 'font') {
    return (
      <>
        <Back label="fuente" sub="tipografía del texto" onBack={() => onTool(null)} />
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
      </>
    );
  }

  if (tool === 'size') {
    return (
      <>
        <Back label="tamaño" sub="alto de la letra" onBack={() => onTool(null)} />
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
      </>
    );
  }

  if (tool === 'rot') {
    return (
      <>
        <Back label="giro" sub="inclina el texto" onBack={() => onTool(null)} />
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
        <Hint>{`${text.rot || 0}°`}</Hint>
      </>
    );
  }

  if (tool === 'color') {
    return (
      <>
        <Back label="color" sub="color del texto" onBack={() => onTool(null)} />
        <ColorSwatches
          value={text.color}
          presets={COLORS}
          custom={COLORS.includes(text.color) ? '#111111' : text.color}
          onPick={(c) => onPatch({ color: c }, true)}
          onCustom={(c) => onPatch({ color: c }, false)}
        />
      </>
    );
  }

  if (tool === 'order') {
    return (
      <>
        <Back label="orden" sub="capa entre textos" onBack={() => onTool(null)} />
        <div className={s.seg}>
          <button type="button" className={s.segbtn} onClick={() => onReorder(1)}>
            <Icon.front /> adelante
          </button>
          <button type="button" className={s.segbtn} onClick={() => onReorder(-1)}>
            <Icon.back /> atrás
          </button>
        </div>
        <Hint>los textos se apilan en orden; adelante/atrás lo mueve un peldaño (siempre encima de las fotos).</Hint>
      </>
    );
  }

  return (
    <>
      <ToolRow>
        <ToolBox icon={<Icon.text />} label="escribir" onClick={() => onTool('write')} />
        <ToolBox icon={<AaGlyph font={text.font} />} label="fuente" onClick={() => onTool('font')} />
        <ToolBox icon={<Icon.size />} label="tamaño" onClick={() => onTool('size')} />
        <ToolBox icon={<Swatch color={text.color} />} label="color" onClick={() => onTool('color')} />
        <ToolBox icon={<RotGlyph deg={text.rot || 0} />} label="giro" onClick={() => onTool('rot')} />
        <ToolBox icon={<Icon.front />} label="orden" onClick={() => onTool('order')} />
        <ToolBox icon={<Icon.trash />} label="quitar" danger onClick={onRemove} />
      </ToolRow>
      <Hint>arrastra el texto sobre la página para colocarlo · toca una herramienta para editarlo</Hint>
    </>
  );
}

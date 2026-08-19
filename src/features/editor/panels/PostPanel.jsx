import React from 'react';
import { RATIOS, BGS, GAPS, TRANSPARENT } from '../../../core/layouts.js';
import {
  SegmentedControl, ToolBox, ToolRow, Swatch, Field, Hint,
  NotchSlider, ColorSwatches,
} from '../../../ui/primitives/index.js';
import { Icon, RatioGlyph, GapGlyph } from '../../../ui/icons.jsx';
import { HAPTIC, haptic } from '../../../hooks/useHaptics.js';
import s from '../LevelPanel.module.css';

/** Cabecera de subnivel: título (la acción, que vuelve al tocarlo) y un subtítulo
 *  con una explicación muy breve. Compartida por los tres paneles. */
export function Back({ label, sub, onBack }) {
  return (
    <button type="button" className={s.back} onClick={onBack}>
      <Icon.left />
      <span className={s.title}>{label}</span>
      {sub && <span className={s.sub}>{sub}</span>}
    </button>
  );
}

/**
 * Nivel Post: los ajustes que se fijan una vez por carrusel, mas el orden de las
 * paginas. Cada caja muestra su valor DENTRO del dibujo, asi que no hay que entrar
 * para saber en que estado esta: el rectangulo tiene la forma del ratio, la cota
 * del gap lleva la cifra, y el cuadrado de color es del color elegido.
 */
export default function PostPanel({
  post, current, tool, customBg,
  onTool, onBack, onSetting, onGap, onGapStart, onCustomBg, onMove, onJpgBlocked,
}) {
  if (tool === 'move') {
    return (
      <>
        <Back label="mover" sub="reordena las páginas" onBack={onBack} />
        <ToolRow>
          <ToolBox
            icon={<Icon.left />} label="izq" disabled={current === 0}
            onClick={() => onMove(current, current - 1)}
          />
          <ToolBox
            icon={<Icon.right />} label="der" disabled={current === post.slides.length - 1}
            onClick={() => onMove(current, current + 1)}
          />
        </ToolRow>
        <Hint>o arrastra una página directamente a su sitio.</Hint>
      </>
    );
  }

  if (tool === 'ratio') {
    return (
      <>
        <Back label="proporción" sub="la forma de cada página" onBack={onBack} />
        <Field>
          <div className={s.ratiogrid}>
            {Object.keys(RATIOS).map((k) => (
              <button
                key={k}
                type="button"
                title={k}
                className={post.ratio === k ? s.on : undefined}
                onClick={() => onSetting({ ratio: k })}
              >
                <RatioGlyph ratio={k} />
                <span>{RATIOS[k].label}{k === '3:4' ? ' *' : ''}</span>
              </button>
            ))}
          </div>
        </Field>
        <Hint>* 3:4 es la más alargada.</Hint>
      </>
    );
  }

  if (tool === 'gap') {
    const index = Math.max(0, GAPS.indexOf(post.gap));
    return (
      <>
        <Back label="gap" sub="el espacio entre fotos" onBack={onBack} />
        <Field right={<span className={s.gapval}>{post.gap}px</span>}>
          <NotchSlider
            steps={GAPS}
            index={index}
            ariaLabel="Separación entre fotos"
            onStart={onGapStart}
            onChange={(i, atStop) => {
              haptic(atStop ? HAPTIC.stop : HAPTIC.step);
              onGap(GAPS[i]);
            }}
          />
        </Field>
      </>
    );
  }

  if (tool === 'bg') {
    return (
      <>
        <Back label="color" sub="el fondo del post" onBack={onBack} />
        <Field>
          <ColorSwatches
            value={post.bg}
            presets={BGS}
            custom={customBg}
            onPick={(c) => onSetting({ bg: c })}
            onCustom={(c) => { onCustomBg(c); onSetting({ bg: c }); }}
          />
        </Field>
        {post.bg === TRANSPARENT && (
          <Hint>
            los huecos quedan vacíos y se exporta en PNG. Instagram aplana la
            transparencia: sirve para componer sobre vídeo en otra app, no para
            subirlo tal cual
          </Hint>
        )}
      </>
    );
  }

  if (tool === 'fmt') {
    return (
      <>
        <Back label="formato" sub="el tipo de archivo al exportar" onBack={onBack} />
        <Field>
          <SegmentedControl
            value={post.bg === TRANSPARENT ? 'png' : (post.fmt || 'png')}
            onChange={(v) => onSetting({ fmt: v })}
            options={[
              {
                value: 'jpeg',
                label: 'JPG',
                disabledReason: post.bg === TRANSPARENT ? onJpgBlocked : undefined,
              },
              { value: 'png', label: 'PNG' },
            ]}
          />
        </Field>
        {post.bg === TRANSPARENT && (
          <Hint>con fondo transparente es PNG: JPEG pintaría los huecos de negro.</Hint>
        )}
      </>
    );
  }

  const fmt = post.bg === TRANSPARENT ? 'png' : (post.fmt || 'png');
  const ext = fmt === 'jpeg' ? '.jpg' : '.png';
  return (
    <>
      <ToolRow>
        <ToolBox icon={<Icon.move />} label="mover" onClick={() => onTool('move')} />
        <ToolBox icon={<span className={s.toolval}>{RATIOS[post.ratio].label}</span>} label="ratio" onClick={() => onTool('ratio')} />
        <ToolBox icon={<GapGlyph gap={post.gap} />} label="gap" onClick={() => onTool('gap')} />
        <ToolBox icon={<Swatch color={post.bg} />} label="color" onClick={() => onTool('bg')} />
        <ToolBox icon={<span className={s.toolval}>{ext}</span>} label="formato" onClick={() => onTool('fmt')} />
      </ToolRow>
      <Hint>arrastra una página, o muévela con izq/der · tócala para abrirla</Hint>
    </>
  );
}

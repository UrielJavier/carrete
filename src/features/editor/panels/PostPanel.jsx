import React from 'react';
import { RATIOS, BGS, GAPS, TRANSPARENT } from '../../../core/layouts.js';
import {
  SegmentedControl, ToolBox, ToolRow, Swatch, Field, Hint,
  NotchSlider, ColorSwatches,
} from '../../../ui/primitives/index.js';
import { Icon, RatioGlyph, GapGlyph, FmtGlyph } from '../../../ui/icons.jsx';
import { HAPTIC, haptic } from '../../../hooks/useHaptics.js';
import s from '../LevelPanel.module.css';

/** Cabecera de subnivel, compartida por los tres paneles. */
export function Back({ label, onBack }) {
  return (
    <button type="button" className={s.back} onClick={onBack}>
      <Icon.left />
      <span>{label}</span>
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
        <Back label="mover" onBack={onBack} />
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
        <Hint>arrastra una página a su nueva posición, o usa izq/der</Hint>
      </>
    );
  }

  if (tool === 'ratio') {
    return (
      <>
        <Back label="proporción" onBack={onBack} />
        <Field label="proporción">
          <SegmentedControl
            stacked
            value={post.ratio}
            onChange={(v) => onSetting({ ratio: v })}
            options={Object.keys(RATIOS).map((k) => ({
              value: k,
              title: k,
              label: RATIOS[k].label,
              icon: <RatioGlyph ratio={k} />,
            }))}
          />
        </Field>
      </>
    );
  }

  if (tool === 'gap') {
    const index = Math.max(0, GAPS.indexOf(post.gap));
    return (
      <>
        <Back label="gap" onBack={onBack} />
        <Field label="gap" right={<span className={s.gapval}>{post.gap}px</span>}>
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
        <Hint>el valor es la separación real: la misma entre fotos y en el borde</Hint>
      </>
    );
  }

  if (tool === 'bg') {
    return (
      <>
        <Back label="color" onBack={onBack} />
        <Field label="color">
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
        <Back label="formato" onBack={onBack} />
        <Field label="formato">
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
        <Hint>
          {post.bg === TRANSPARENT
            ? 'con fondo transparente el formato es PNG: JPEG no tiene canal alfa y pintaría los huecos de negro.'
            : post.fmt === 'png'
              ? 'PNG no recomprime: no añade pérdida al montar, pero cada página pesa unos 4 MB.'
              : 'JPG al 95%. Suficiente en casi todo, y unos 800 kB por página.'}
        </Hint>
      </>
    );
  }

  return (
    <>
      <ToolRow>
        <ToolBox icon={<Icon.move />} label="mover" onClick={() => onTool('move')} />
        <ToolBox icon={<RatioGlyph ratio={post.ratio} />} label="ratio" onClick={() => onTool('ratio')} />
        <ToolBox icon={<GapGlyph gap={post.gap} />} label="gap" onClick={() => onTool('gap')} />
        <ToolBox icon={<Swatch color={post.bg} />} label="color" onClick={() => onTool('bg')} />
        <ToolBox icon={<FmtGlyph fmt={post.fmt} />} label="formato" onClick={() => onTool('fmt')} />
      </ToolRow>
      <Hint>arrastra una página, o muévela con izq/der · tócala para abrirla</Hint>
    </>
  );
}

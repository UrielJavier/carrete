/**
 * ICONOS Y GLIFOS DE VALOR.
 *
 * Los iconos llevan tamaño propio para que, si algun dia falta su CSS, salgan
 * pequeños en lugar de estirarse hasta llenar la pantalla: un fallo cosmetico en
 * lugar de uno catastrofico.
 *
 * Los "glifos de valor" son la idea central de la interfaz: el dibujo ES el estado
 * actual y la etiqueta el nombre de la herramienta. Asi una caja de 64px dice las
 * dos cosas sin una sola palabra de texto extra.
 */
import React from 'react';
import { RATIOS, LAYOUTS } from '../core/layouts.js';

const S = ({ children, w = 16, h = 16, cls }) => (
  <svg className={cls} viewBox="0 0 24 24" width={w} height={h}>{children}</svg>
);

export const Icon = {
  undo: () => <S><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 3v6h6" /></S>,
  expand: () => <S><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></S>,
  shrink: () => <S><path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5" /></S>,
  left: () => <S><path d="M15 18l-6-6 6-6" /></S>,
  right: () => <S><path d="M9 18l6-6-6-6" /></S>,
  up: () => <S><path d="M18 15l-6-6-6 6" /></S>,
  down: () => <S><path d="M6 9l6 6 6-6" /></S>,
  trim: () => <S><path d="M7 3v18M17 3v18M7 8h10M7 16h10" /></S>,
  plus: () => <S><path d="M12 5v14M5 12h14" /></S>,
  copy: () => <S><path d="M9 9h11v11H9z" /><path d="M15 5H4v11" /></S>,
  trash: () => <S><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></S>,
  center: () => <S><path d="M12 3v18M3 12h18" /></S>,
  grid: () => <S><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></S>,
  swap: () => <S><path d="M3 9h13l-4-4M21 15H8l4 4" /></S>,
  close: () => <S><path d="M18 6L6 18M6 6l12 12" /></S>,
  check: () => <S><path d="M4 12.5l5 5L20 6.5" /></S>,
  download: () => <S><path d="M12 3v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></S>,
  share: () => (
    <S>
      <path d="M12 3v13" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </S>
  ),
  mirror: () => (
    <S>
      <path d="M12 3v18" strokeDasharray="2 2.5" />
      <path d="M8.5 8L4.5 12l4 4" />
      <path d="M15.5 8l4 4-4 4" />
    </S>
  ),
  move: () => (
    <S>
      <path d="M12 3v18M3 12h18" />
      <path d="M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
    </S>
  ),
  text: () => <S><path d="M5 6V4h14v2M12 4v16M9 20h6" /></S>,
  size: () => <S><path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" /></S>,
  align: () => <S><path d="M4 6h16M7 12h10M5 18h14" /></S>,
  leading: () => <S><path d="M10 6h10M10 12h10M10 18h10" /><path d="M4 5v14M2 7l2-2 2 2M2 17l2 2 2-2" /></S>,
  safe: () => (
    <S>
      <rect x="3" y="3" width="18" height="18" />
      <rect x="7" y="7" width="10" height="10" strokeDasharray="2 2" />
    </S>
  ),
  front: () => <S><path d="M4 8l8-4 8 4-8 4-8-4z" /><path d="M4 14l8 4 8-4" /></S>,
  back: () => <S><path d="M4 16l8 4 8-4-8-4-8 4z" /><path d="M4 10l8-4 8 4" /></S>,
  mute: () => (
    <S>
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </S>
  ),
  warn: () => (
    <S>
      <path d="M12 4l8.5 16h-17z" />
      <path d="M12 10.5v4" />
      <circle cx="12" cy="17.4" r=".9" fill="currentColor" stroke="none" />
    </S>
  ),
  tick: (stroke) => (
    <svg viewBox="0 0 24 24" width="12" height="12">
      <path d="M4 12.5l5 5L20 6.5" fill="none" stroke={stroke} strokeWidth="2.6" />
    </svg>
  ),
};

/**
 * Rectangulo a la proporcion real. Todos se ajustan al mismo cuadro, asi que la
 * comparacion entre ellos es directa: se ve cual es mas vertical y cual mas
 * apaisada. Si cada uno rellenara su propia caja, el dibujo no diria nada.
 */
export function RatioGlyph({ ratio }) {
  const R = RATIOS[ratio];
  const BOX = 18;
  const MAX = 16;
  const k = Math.min(MAX / R.w, MAX / R.h);
  const w = R.w * k;
  const h = R.h * k;
  return (
    <svg viewBox={`0 0 ${BOX} ${BOX}`} width={BOX} height={BOX}>
      <rect
        x={(BOX - w) / 2} y={(BOX - h) / 2} width={w} height={h}
        fill="none" stroke="currentColor" strokeWidth="1.2"
      />
    </svg>
  );
}

/** La rejilla elegida, con su proporcion real centrada en el cuadro para que no se
 *  aplaste al forzar un tamaño cuadrado. */
export function LayoutGlyph({ layoutId, ratio, box = 20 }) {
  const R = RATIOS[ratio];
  const MAX = box - 1;
  const k = Math.min(MAX / R.w, MAX / R.h);
  const w = R.w * k;
  const h = R.h * k;
  const ox = (box - w) / 2;
  const oy = (box - h) / 2;
  return (
    <svg viewBox={`0 0 ${box} ${box}`} width={box} height={box}>
      {LAYOUTS[layoutId].cells.map((c, i) => (
        <rect
          key={i}
          x={ox + c.x * w + 0.55} y={oy + c.y * h + 0.55}
          width={Math.max(0, c.w * w - 1.1)} height={Math.max(0, c.h * h - 1.1)}
          fill="currentColor" stroke="none"
        />
      ))}
    </svg>
  );
}

/** Cota de plano: bloque, linea, la cifra, linea, bloque. El hueco es fijo para
 *  que el numero quepa siempre; el valor exacto lo dice la cifra. */
export function GapGlyph({ gap }) {
  const W = 42;
  const H = 20;
  const gutter = 15;
  const bw = (W - gutter) / 2;
  return (
    <svg className="wide" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <rect x="0" y="3" width={bw} height="14" fill="currentColor" opacity=".45" stroke="none" />
      <rect x={bw + gutter} y="3" width={bw} height="14" fill="currentColor" opacity=".45" stroke="none" />
      <path d={`M${bw} 1v18M${bw + gutter} 1v18`} stroke="var(--c-accent)" strokeWidth="1.1" fill="none" />
      <text
        x={W / 2} y="14" textAnchor="middle" stroke="none" fill="currentColor"
        fontFamily="ui-monospace, monospace" fontSize="10"
      >
        {gap}
      </text>
    </svg>
  );
}

/** La foto orientada como esta, con una marca en el borde que era el de arriba: a
 *  90 grados la marca queda a la derecha. */
export function RotGlyph({ deg }) {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18">
      <g transform={`rotate(${deg || 0} 9 9)`}>
        <rect x="4" y="1.5" width="10" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 4.5h5" stroke="currentColor" strokeWidth="1.6" fill="none" />
      </g>
    </svg>
  );
}

export function FmtGlyph({ fmt }) {
  return (
    <svg className="wide" viewBox="0 0 42 20" width="42" height="20">
      <rect x="1" y="2" width="40" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text
        x="21" y="14.5" textAnchor="middle" stroke="none" fill="currentColor"
        fontFamily="ui-monospace, monospace" fontSize="9"
      >
        {fmt === 'png' ? 'PNG' : 'JPG'}
      </text>
    </svg>
  );
}

import React, { useEffect, useRef } from 'react';
import { RATIOS } from '../../core/layouts.js';
import { drawRegion } from '../../core/geometry.js';

/**
 * Una region del lienzo del post dibujada en canvas. La usan el feed, la
 * cuadricula del perfil, las miniaturas y los asomos: una sola fuente de verdad,
 * asi que lo que se ve en cualquiera de esos sitios es lo que se exporta.
 *
 * La resolucion interna es fija y el CSS la escala: asi no depende de mediciones.
 */
export default function RegionCanvas({ cells, index, ratio, bg, getSource, res = 1080, style, className }) {
  const ref = useRef(null);
  const R = RATIOS[ratio];

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    cv.width = res;
    cv.height = Math.round((res * R.h) / R.w);
    drawRegion(cv.getContext('2d'), cells, index, cv.width, cv.height, bg, getSource);
  }, [cells, index, ratio, bg, getSource, res, R.h, R.w]);

  return <canvas ref={ref} className={className} style={style} />;
}

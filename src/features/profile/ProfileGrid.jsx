import React from 'react';
import { RATIOS } from '../../core/layouts.js';
import { Caption, Hint } from '../../ui/primitives/index.js';
import RegionCanvas from '../editor/RegionCanvas.jsx';
import s from './ProfileGrid.module.css';

export default function ProfileGrid({ post, cells, getSource }) {
  const R = RATIOS[post.ratio];
  const cropPct = Math.min(1, (R.h * 3) / 4 / R.w);
  return (
    <>
      <Caption>Cuadrícula del perfil · recorte 3:4</Caption>
      <div className={s.mosaic} style={{ marginTop: 'var(--s-4)' }}>
        <div className={s.tile}>
          <RegionCanvas
            cells={cells} index={0} ratio={post.ratio} bg={post.bg} getSource={getSource} texts={post.slides[0]?.texts} res={540}
            style={{
              width: `${100 / cropPct}%`,
              left: `${-50 * (1 / cropPct - 1)}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              height: 'auto',
            }}
          />
        </div>
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className={s.tile} />)}
      </div>
      <Hint>
        Instagram recorta la portada a 3:4 centrado. Con 4:5 pierdes las franjas
        laterales, así que no dejes caras ni texto en los bordes.
      </Hint>
    </>
  );
}

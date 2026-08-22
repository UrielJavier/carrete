import React, { useEffect, useState } from 'react';
import { clamp, TRANSPARENT } from '../../core/layouts.js';
import { Hint } from '../../ui/primitives/index.js';
import RegionCanvas from '../editor/RegionCanvas.jsx';
import s from './StoriesView.module.css';

/**
 * Vista de STORIES: no es un carrusel de feed, sino páginas a pantalla completa que
 * se pasan de una en una (tap a los lados), con las barritas de progreso arriba, como
 * en Instagram. Cada página del proyecto es una story independiente.
 */
export default function StoriesView({ post, cells, getSource }) {
  const [index, setIndex] = useState(0);
  const total = post.slides.length;
  useEffect(() => { setIndex((i) => clamp(i, 0, total - 1)); }, [total]);
  const go = (d) => setIndex((i) => clamp(i + d, 0, total - 1));
  const sl = post.slides[index];

  return (
    <>
      <div className={s.stage}>
        <div className={[s.frame, post.bg === TRANSPARENT && 'checker'].filter(Boolean).join(' ')}>
          <RegionCanvas
            cells={cells} index={index} ratio={post.ratio} bg={post.bg}
            getSource={getSource} texts={sl?.texts} className={s.canvas}
          />

          {/* Barritas de progreso: llenas hasta la story actual. */}
          <div className={s.bars}>
            {post.slides.map((p, i) => (
              <span key={p.id} className={s.bar}>
                <span className={[s.fill, i <= index && s.on].filter(Boolean).join(' ')} />
              </span>
            ))}
          </div>

          <div className={s.head}>
            <span className={s.avatar} />
            <span className={s.user}>tu_cuenta</span>
            <span className={s.now}>ahora</span>
          </div>

          {/* Zonas de toque: izquierda retrocede, derecha avanza. */}
          <button type="button" className={`${s.tap} ${s.prev}`} aria-label="Anterior" onClick={() => go(-1)} />
          <button type="button" className={`${s.tap} ${s.next}`} aria-label="Siguiente" onClick={() => go(1)} />
        </div>
      </div>
      <Hint>toca a los lados para pasar · {index + 1}/{total} · cada página es una story</Hint>
    </>
  );
}

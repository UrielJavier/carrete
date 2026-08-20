import React, { useEffect, useRef, useState } from 'react';
import { clamp, TRANSPARENT } from '../../core/layouts.js';
import { Hint } from '../../ui/primitives/index.js';
import RegionCanvas from '../editor/RegionCanvas.jsx';
import s from './FeedView.module.css';

/**
 * Una pagina por gesto. Al soltar solo se avanza o retrocede UNO, por muy fuerte
 * que haya sido el deslizamiento; con la inercia nativa se saltaban varias y la
 * vista dejaba de predecir lo que hace Instagram.
 */
export default function FeedView({ post, cells, getSource }) {
  const viewport = useRef(null);
  const track = useRef(null);
  const [index, setIndex] = useState(0);
  const gesture = useRef(null);
  const [drag, setDrag] = useState(0);

  const total = post.slides.length;
  useEffect(() => { setIndex((i) => clamp(i, 0, total - 1)); }, [total]);

  const width = () => viewport.current?.clientWidth || 1;
  const offset = -index * width() + drag;

  const release = () => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || g.axis !== 'x') { setDrag(0); return; }
    const ms = Math.max(1, Date.now() - g.t);
    const speed = Math.abs(drag) / ms;
    const enough = Math.abs(drag) > width() * 0.15 || speed > 0.35;
    const step = enough ? (drag < 0 ? 1 : -1) : 0;
    setDrag(0);
    setIndex((i) => clamp(i + step, 0, total - 1));
  };

  return (
    <>
      <div className={s.frame}>
        <div className={s.head}>
          <div className={s.avatar} />
          <span className={s.user}>tu_cuenta</span>
        </div>
        <div
          ref={viewport}
          className={s.viewport}
          onPointerDown={(e) => {
            gesture.current = { x: e.clientX, y: e.clientY, t: Date.now(), axis: null, id: e.pointerId };
          }}
          onPointerMove={(e) => {
            const g = gesture.current;
            if (!g || e.pointerId !== g.id) return;
            const dx = e.clientX - g.x;
            const dy = e.clientY - g.y;
            if (!g.axis) {
              if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
              g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
              if (g.axis === 'x') viewport.current.setPointerCapture?.(e.pointerId);
            }
            if (g.axis !== 'x') return;
            e.preventDefault();
            const edge = (dx > 0 && index === 0) || (dx < 0 && index === total - 1);
            setDrag(edge ? dx * 0.3 : dx);
          }}
          onPointerUp={release}
          onPointerCancel={release}
        >
          <div
            ref={track}
            className={s.track}
            style={{
              transform: `translate3d(${offset}px,0,0)`,
              transition: drag ? 'none' : 'transform .3s cubic-bezier(.22,.61,.36,1)',
            }}
          >
            {post.slides.map((sl, i) => (
              <div key={sl.id} className={post.bg === TRANSPARENT ? 'checker' : undefined}>
                <RegionCanvas cells={cells} index={i} ratio={post.ratio} bg={post.bg} getSource={getSource} texts={sl.texts} />
              </div>
            ))}
          </div>
        </div>
        <div className={s.dots}>
          {post.slides.map((sl, i) => (
            <button
              key={sl.id}
              type="button"
              title={`Página ${i + 1}`}
              className={[s.dot, i === index && s.on].filter(Boolean).join(' ')}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
      <Hint>desliza para ver la secuencia</Hint>
    </>
  );
}

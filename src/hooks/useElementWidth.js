import { useEffect, useState } from 'react';

/** Ancho real de un elemento. Se mide una sola vez por cambio de tamaño, no en
 *  cada render, y todo lo que dependa de el se deriva de este numero. */
export function useElementWidth(ref, fallback = 340) {
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(160, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** Alto del viewport. Cambia al girar el movil y al ocultarse la barra del
 *  navegador, y de el depende la altura del area de trabajo. */
export function useViewportHeight() {
  const [h, setH] = useState(() => (typeof window === 'undefined' ? 800 : window.innerHeight));
  useEffect(() => {
    const on = () => setH(window.innerHeight);
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
    };
  }, []);
  return h;
}

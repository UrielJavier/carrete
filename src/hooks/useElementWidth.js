import { useEffect, useState } from 'react';

/** Ancho real de un elemento. Se mide una sola vez por cambio de tamaño, no en
 *  cada render, y todo lo que dependa de el se deriva de este numero. */
export function useElementWidth(ref, fallback = 340) {
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => {
      /* Al desmontarse el elemento (p. ej. al abrir el historial) el observer
         dispara con ancho 0: se ignora para no colapsar la medida y arrastrar un
         area diminuta al volver. Solo cuentan anchos reales. */
      const nw = Math.floor(e.contentRect.width);
      if (nw > 0) setW(Math.max(160, nw));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** Alto real de un elemento, con la misma cautela que el ancho: se ignoran las
 *  medidas 0 (que dispara el desmontaje) para no arrastrar un area diminuta. */
export function useElementHeight(ref, fallback = 400) {
  const [h, setH] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => {
      const nh = Math.floor(e.contentRect.height);
      if (nh > 0) setH(Math.max(120, nh));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return h;
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

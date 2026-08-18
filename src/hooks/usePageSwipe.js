import { useCallback, useRef, useState } from 'react';

/**
 * Una pagina por gesto. Los gestos se separan por TIPO y no por modo: arrastrar
 * pertenece al lienzo y cambia de pagina; tocar pertenece a la foto y la
 * selecciona. Por eso las celdas escuchan click y no pointerdown.
 *
 * El eje se decide en los primeros 6 px: si el gesto es mas vertical, se deja
 * pasar y la pagina hace scroll normal.
 */
export function usePageSwipe({ enabled, pageWidth, atStart, atEnd, onStep, threshold = 0.45 }) {
  const [drag, setDrag] = useState(0);
  const state = useRef(null);

  const onPointerDown = useCallback((e) => {
    if (!enabled) return;
    state.current = { x: e.clientX, y: e.clientY, axis: null, id: e.pointerId, target: e.currentTarget };
  }, [enabled]);

  const onPointerMove = useCallback((e) => {
    const st = state.current;
    if (!st || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x;
    const dy = e.clientY - st.y;
    if (!st.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      st.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (st.axis === 'x') st.target.setPointerCapture?.(e.pointerId);
    }
    if (st.axis !== 'x') return;
    e.preventDefault();
    /* Resistencia en los extremos: se puede tirar, pero cuesta y no avanza. */
    const edge = (dx > 0 && atStart) || (dx < 0 && atEnd);
    setDrag(edge ? dx * 0.3 : dx);
  }, [atStart, atEnd]);

  const release = useCallback(() => {
    const st = state.current;
    state.current = null;
    if (!st || st.axis !== 'x') { setDrag(0); return; }
    const enough = Math.abs(drag) > (pageWidth || 200) * threshold;
    const step = enough ? (drag < 0 ? 1 : -1) : 0;
    setDrag(0);
    if (step) onStep(step);
  }, [drag, pageWidth, threshold, onStep]);

  return {
    drag,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerCancel: release,
    },
  };
}

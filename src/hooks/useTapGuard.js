import { useCallback, useRef } from 'react';

/**
 * El toque que abre una pagina se resuelve DESPUES de repintar, y donde estaba la
 * miniatura aparece una celda vacia con su input de fichero cubriendola. Sin esta
 * guarda, ese mismo toque abre el selector de fotos sin haberlo pedido.
 *
 * 400 ms cubre el intervalo de un doble toque real (120-300 ms) y no estorba a un
 * toque deliberado posterior.
 */
export function useTapGuard(ms = 400) {
  const until = useRef(0);
  const arm = useCallback(() => { until.current = Date.now() + ms; }, [ms]);
  return { guardRef: until, arm };
}

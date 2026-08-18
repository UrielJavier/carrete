import { useEffect, useState } from 'react';
import { storageEstimate } from '../core/db.js';

/**
 * Lo que el navegador dice que llevamos ocupado y cuanto nos deja. Es SU
 * estimacion, no la suma de nuestros proyectos: incluye lo que aun no ha liberado
 * y puede no cuadrar con nuestros numeros.
 */
export function useStorageEstimate(deps = []) {
  const [est, setEst] = useState(null);
  useEffect(() => {
    let alive = true;
    storageEstimate().then((e) => { if (alive && e) setEst(e); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return est;
}

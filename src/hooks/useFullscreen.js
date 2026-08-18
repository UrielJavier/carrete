import { useCallback, useEffect, useState } from 'react';

/**
 * La API de pantalla completa exige un gesto del usuario: no se puede pedir al
 * cargar. Con la aplicacion servida por HTTPS se podria instalar como PWA en modo
 * standalone y no haria falta el boton.
 */
export function useFullscreen(onError) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const on = () => setActive(!!(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => {
      document.removeEventListener('fullscreenchange', on);
      document.removeEventListener('webkitfullscreenchange', on);
    };
  }, []);

  const toggle = useCallback(async () => {
    const root = document.documentElement;
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        await (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen());
      } else if (root.requestFullscreen) {
        await root.requestFullscreen({ navigationUI: 'hide' });
      } else if (root.webkitRequestFullscreen) {
        root.webkitRequestFullscreen();
      } else {
        onError?.('Este navegador no permite pantalla completa desde la web.');
      }
    } catch (e) {
      onError?.('No se pudo cambiar a pantalla completa.');
    }
  }, [onError]);

  return { active, toggle };
}

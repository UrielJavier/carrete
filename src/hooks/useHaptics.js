/**
 * navigator.vibrate es la API tosca del motor: no hay amplitud ni curva, asi que
 * lo unico que se puede modular es la duracion. Por debajo de ~10 ms muchos
 * motores no llegan a arrancar. En iOS no existe.
 */
export const HAPTIC = { step: 12, stop: 22, drop: 10 };

export function haptic(ms) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
  } catch (e) {
    /* no disponible */
  }
}

export const hapticsAvailable = () =>
  typeof navigator !== 'undefined' && !!navigator.vibrate;

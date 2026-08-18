import React from 'react';
import { Caption, Hint } from '../../ui/primitives/index.js';
import { HAPTIC, haptic, hapticsAvailable } from '../../hooks/useHaptics.js';

/**
 * La marca de version es de la aplicacion, no del carrusel. Sirve para saber sobre
 * que build se esta reportando algo, que es lo que importa cuando se itera rapido.
 *
 * La prueba de vibracion esta aqui a proposito: si no se nota, dice si el problema
 * es el navegador o los ajustes del movil.
 */
export default function ChangelogView({ version, build }) {
  return (
    <>
      <Caption>Historial</Caption>
      <div style={{ marginTop: 'var(--s-6)', display: 'grid', gap: 'var(--s-6)' }}>
        <Hint>
          v{version} · build {build}. Port a React + Vite. La lógica pura vive en
          src/core con tests; el historial completo de la versión de un solo fichero
          está en reference/carrete-3.13.2.html.
        </Hint>
        <Hint>
          <span
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => haptic([0, HAPTIC.step, 90, HAPTIC.step, 90, HAPTIC.stop])}
          >
            {hapticsAvailable()
              ? 'vibración: disponible · toca aquí para probarla'
              : 'vibración: no disponible en este navegador'}
          </span>
        </Hint>
      </div>
    </>
  );
}

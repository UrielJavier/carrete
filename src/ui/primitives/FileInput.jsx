import React from 'react';
import s from './FileInput.module.css';

/**
 * `guardRef` sostiene una marca de tiempo. Mientras no se ha cumplido, el clic se
 * cancela: el toque que abre una pagina se resuelve DESPUES de repintar y caeria
 * sobre el input de la celda vacia que aparece en su lugar.
 */
export default function FileInput({ onFiles, multiple = false, guardRef }) {
  return (
    <input
      type="file"
      accept="image/*,video/*"
      multiple={multiple}
      className={s.input}
      onClick={(e) => {
        if (guardRef && Date.now() < guardRef.current) e.preventDefault();
      }}
      onChange={(e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (files.length) onFiles(files);
      }}
    />
  );
}

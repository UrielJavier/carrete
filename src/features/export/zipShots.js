import JSZip from 'jszip';

/**
 * EMPAQUETADO. Diez descargas de una en una es lo primero que hace abandonar la
 * aplicacion, sobre todo en movil, donde cada una abre su propio dialogo.
 *
 * Las imagenes se meten SIN comprimir (`store`): ya son PNG o JPEG, o sea que ya
 * estan comprimidas, y volver a pasarlas por deflate gasta segundos de CPU para no
 * ahorrar practicamente nada.
 */
export async function zipShots(shots, name, onProgress) {
  const zip = new JSZip();
  shots.forEach((sh) => {
    if (sh.blob) zip.file(sh.name, sh.blob, { compression: 'STORE' });
  });
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'STORE' },
    (m) => onProgress?.(Math.round(m.percent))
  );
  return { blob, url: URL.createObjectURL(blob), name: `${name}.zip`, bytes: blob.size };
}

/** Nombre de fichero seguro a partir del nombre del proyecto. */
export function safeName(text) {
  const base = (text || 'maqueta')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  return base || 'maqueta';
}

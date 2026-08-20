/**
 * SPIKE de export a vídeo. Objetivo: MEDIR en un móvil real si componer + codificar
 * a MP4 (H.264) con WebCodecs + Mediabunny es viable en rendimiento y memoria, antes
 * de construir la feature completa (foto + vídeo en un layout → un vídeo).
 *
 * Aquí solo se codifican las PÁGINAS ya exportadas como un pase de diapositivas: cada
 * una unos segundos. No decodifica vídeo de origen todavía; eso es el siguiente paso
 * si el spike sale bien. Todo ocurre en el dispositivo: nada sale del navegador.
 *
 * Mediabunny se importa DINÁMICAMENTE (solo al codificar), para no cargar ~48 KB en
 * el arranque de quien no exporta vídeo.
 */

/* H.264 exige dimensiones pares. */
const even = (n) => Math.max(2, Math.round(n / 2) * 2);

/**
 * Codifica las páginas como un MP4 (cada una `perPage` segundos). Devuelve el blob y
 * cuánto ha tardado, para saber si el móvil aguanta.
 */
export async function encodeSlideshow({ shots, width, height, fps = 30, perPage = 1.5, onProgress }) {
  const {
    Output, Mp4OutputFormat, BufferTarget, CanvasSource, QUALITY_HIGH,
  } = await import('mediabunny');

  const W = even(width);
  const H = even(height);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';

  const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
  const source = new CanvasSource(canvas, { codec: 'avc', quality: QUALITY_HIGH, keyFrameInterval: 2 });
  output.addVideoTrack(source, { frameRate: fps });
  await output.start();

  const framesPerPage = Math.max(1, Math.round(fps * perPage));
  const dur = 1 / fps;
  let f = 0;
  const t0 = performance.now();

  for (let p = 0; p < shots.length; p++) {
    const bmp = await createImageBitmap(shots[p].blob);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bmp, 0, 0, W, H);
    if (bmp.close) bmp.close();
    for (let i = 0; i < framesPerPage; i++) {
      /* Se espera cada add: respeta la contrapresión del codificador (clave para no
         reventar la memoria en el móvil). */
      await source.add(f / fps, dur); // eslint-disable-line no-await-in-loop
      f += 1;
    }
    onProgress?.(p + 1, shots.length);
  }

  await output.finalize();
  const ms = Math.round(performance.now() - t0);
  const blob = new Blob([output.target.buffer], { type: 'video/mp4' });
  return { blob, ms, bytes: blob.size, frames: f };
}

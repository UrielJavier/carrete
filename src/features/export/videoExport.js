import { drawRegion } from '../../core/geometry.js';

/**
 * Export de una PÁGINA que tiene un vídeo, a MP4. Se decodifica el vídeo de origen
 * (recortado a [start, end]) fotograma a fotograma con Mediabunny, se compone cada
 * uno con las demás celdas (fotos estáticas) usando `drawRegion` —la misma fuente de
 * verdad que el preview y el export de imagen— y se codifica a H.264.
 *
 * v1 sin audio (el AudioEncoder de WebCodecs es iOS 26+). Todo en el dispositivo.
 */
const CLIP_MAX = 30;

export async function encodePageVideo({ pageIndex, cells, images, W, H, bg, vidCell, staticSrc, fps = 30, onProgress }) {
  const {
    Output, Mp4OutputFormat, BufferTarget, CanvasSource, QUALITY_HIGH,
    Input, BlobSource, ALL_FORMATS, VideoSampleSink,
  } = await import('mediabunny');

  const vid = images[vidCell.imgId];
  const start = vidCell.trim?.start ?? 0;
  const end = vidCell.trim?.end ?? Math.min(vid.duration || CLIP_MAX, CLIP_MAX);
  const clip = Math.max(0.1, Math.min(CLIP_MAX, (end - start) || Math.min(vid.duration || 1, CLIP_MAX)));

  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(vid.file) });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error('el vídeo no tiene pista de vídeo');
  const sink = new VideoSampleSink(track);

  /* Lienzo persistente con el fotograma actual del vídeo, a las dimensiones del
     vídeo: así drawRegion lo encuadra igual que una foto, y se puede reutilizar si un
     timestamp no trae fotograma nuevo. */
  const frameCv = document.createElement('canvas');
  frameCv.width = vid.w;
  frameCv.height = vid.h;
  const fctx = frameCv.getContext('2d');
  let hasFrame = false;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
  const cvSource = new CanvasSource(canvas, { codec: 'avc', quality: QUALITY_HIGH, keyFrameInterval: 2 });
  output.addVideoTrack(cvSource, { frameRate: fps });
  await output.start();

  /* Las demás celdas (fotos estáticas) se componen con el mismo decode a resolución
     de export que usa el export de imagen; si no llega, se cae al preview. */
  const posterFor = (id) => {
    if (staticSrc && staticSrc.get(id)) return staticSrc.get(id);
    return images[id]?.el ? { el: images[id].el, w: images[id].w, h: images[id].h } : null;
  };

  const total = Math.max(1, Math.round(clip * fps));
  const timestamps = [];
  for (let k = 0; k < total; k++) timestamps.push(start + k / fps);

  const dur = 1 / fps;
  let k = 0;
  for await (const sample of sink.samplesAtTimestamps(timestamps)) {
    if (sample) {
      /* draw() aplica la rotación de los metadatos (los móviles graban en
         horizontal + marca "rota 90°"); toCanvasImageSource() da el fotograma crudo
         sin rotar, y como frameCv está a dimensiones ya rotadas (vid.w/vid.h, de
         <video>.videoWidth/Height) el vídeo salía girado y estirado. */
      sample.draw(fctx, 0, 0, vid.w, vid.h);
      sample.close();
      hasFrame = true;
    } else if (!hasFrame && vid.el) {
      fctx.drawImage(vid.el, 0, 0, vid.w, vid.h);
      hasFrame = true;
    }
    const frame = hasFrame ? { el: frameCv, w: vid.w, h: vid.h } : null;
    const getSrc = (id) => (id === vidCell.imgId ? frame : posterFor(id));
    drawRegion(ctx, cells, pageIndex, W, H, bg, getSrc);
    await cvSource.add(k / fps, dur); // eslint-disable-line no-await-in-loop
    k += 1;
    onProgress?.(k, total);
  }

  await output.finalize();
  if (input.dispose) input.dispose();
  return new Blob([output.target.buffer], { type: 'video/mp4' });
}

/** La (primera) celda de vídeo de una página, o null si no hay ninguna. */
export function videoCellOf(cells, pageIndex, images) {
  return cells.find((c) => (
    c.rect.x + c.rect.w > pageIndex + 1e-4
    && c.rect.x < pageIndex + 1 - 1e-4
    && c.imgId && images[c.imgId]?.type === 'video'
  )) || null;
}

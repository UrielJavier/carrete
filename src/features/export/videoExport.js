import { drawRegion } from '../../core/geometry.js';
import { drawTexts } from '../../core/text.js';

/**
 * Export de una PÁGINA que tiene un vídeo, a MP4. Se decodifica el vídeo de origen
 * (recortado a [start, end]) fotograma a fotograma con Mediabunny, se compone cada
 * uno con las demás celdas (fotos estáticas) usando `drawRegion` —la misma fuente de
 * verdad que el preview y el export de imagen— y se codifica a H.264.
 *
 * v1 sin audio (el AudioEncoder de WebCodecs es iOS 26+). Todo en el dispositivo.
 */
const CLIP_MAX = 30;

export async function encodePageVideo({ pageIndex, cells, images, W, H, bg, vidCell, staticSrc, texts, fill, onProgress }) {
  const {
    Output, Mp4OutputFormat, BufferTarget, CanvasSource, QUALITY_VERY_HIGH,
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

  /* FPS del propio vídeo (para la barra de progreso y como pista al muxer). Se
     estima muestreando unos paquetes; si falla, 30. Los fotogramas de verdad se
     añaden con su timestamp/duración reales, así que se respeta la cadencia
     original (incluida VFR) sin remuestrear a una rejilla fija. */
  let srcFps = 30;
  try {
    const stats = await track.computePacketStats(60);
    if (stats?.averagePacketRate) srcFps = stats.averagePacketRate;
  } catch (e) { /* estimación no disponible */ }

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
  const cvSource = new CanvasSource(canvas, { codec: 'avc', quality: QUALITY_VERY_HIGH, keyFrameInterval: 2 });
  output.addVideoTrack(cvSource, { frameRate: Math.max(1, Math.round(srcFps)) });
  await output.start();

  /* Las demás celdas (fotos estáticas) se componen con el mismo decode a resolución
     de export que usa el export de imagen; si no llega, se cae al preview. */
  const posterFor = (id) => {
    if (staticSrc && staticSrc.get(id)) return staticSrc.get(id);
    return images[id]?.el ? { el: images[id].el, w: images[id].w, h: images[id].h } : null;
  };

  const composite = () => {
    const frame = hasFrame ? { el: frameCv, w: vid.w, h: vid.h } : null;
    const getSrc = (id) => (id === vidCell.imgId ? frame : posterFor(id));
    drawRegion(ctx, cells, pageIndex, W, H, bg, getSrc, fill);
    /* Textos encima, repintados en cada fotograma (son estáticos, es barato). */
    drawTexts(ctx, texts, W, H);
  };

  /* Denominador solo para la barra; la cuenta real de fotogramas la marca el vídeo. */
  const est = Math.max(1, Math.round(clip * srcFps));
  let t0 = null;
  let k = 0;
  for await (const sample of sink.samples(start, end)) {
    /* draw() aplica la rotación de los metadatos (los móviles graban en horizontal +
       marca "rota 90°"); toCanvasImageSource() da el fotograma crudo sin rotar, y como
       frameCv está a dimensiones ya rotadas (vid.w/vid.h) el vídeo salía girado. */
    sample.draw(fctx, 0, 0, vid.w, vid.h);
    hasFrame = true;
    composite();
    /* Cada fotograma entra con su timestamp/duración reales (reajustados para que el
       primero sea 0): así el MP4 conserva la cadencia original del vídeo. */
    if (t0 == null) t0 = sample.timestamp;
    const ts = Math.max(0, sample.timestamp - t0);
    const d = sample.duration || 1 / srcFps;
    sample.close();
    await cvSource.add(ts, d); // eslint-disable-line no-await-in-loop
    k += 1;
    onProgress?.(Math.min(k, est), est);
  }

  /* Sin ningún fotograma (raro), al menos el póster para no dejar el MP4 vacío. */
  if (k === 0 && vid.el) {
    fctx.drawImage(vid.el, 0, 0, vid.w, vid.h);
    hasFrame = true;
    composite();
    await cvSource.add(0, clip);
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

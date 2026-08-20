import React from 'react';
import { weight } from '../../core/format.js';
import { Button, Hint } from '../../ui/primitives/index.js';
import { encodeSlideshow } from './videoSpike.js';
import s from './ExportSheet.module.css';

/**
 * Bloque de PRUEBA (beta) para medir el export a vídeo en el móvil real. Codifica las
 * páginas como un MP4 y muestra cuánto tarda y el resultado, para decidir si merece
 * la pena construir la feature completa. Se puede compartir para ver si Instagram lo
 * acepta. Todo en el dispositivo.
 */
export default function VideoSpike({ shots, width, height }) {
  const [busy, setBusy] = React.useState(false);
  const [prog, setProg] = React.useState(null);
  const [res, setRes] = React.useState(null); // { url, ms, bytes, frames, blob }
  const [err, setErr] = React.useState(null);

  const run = async () => {
    setBusy(true); setErr(null); setProg(null);
    if (res?.url) URL.revokeObjectURL(res.url);
    setRes(null);
    try {
      const r = await encodeSlideshow({
        shots, width, height,
        onProgress: (i, n) => setProg(`${i}/${n}`),
      });
      setRes({ ...r, url: URL.createObjectURL(r.blob) });
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
      setProg(null);
    }
  };

  const share = async () => {
    try {
      const file = new File([res.blob], 'maqueta.mp4', { type: 'video/mp4' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Maqueta' });
      }
    } catch (e) { /* cancelado */ }
  };

  return (
    <div className={s.beta}>
      <p className={s.betaTitle}>Prueba de vídeo (beta)</p>
      <Button variant="outline" className={s.zipbtn} disabled={busy} onClick={run}>
        {busy ? 'Exportando vídeo…' : 'Exportar las páginas como vídeo MP4'}
      </Button>

      {busy && (
        <div className={s.loading}>
          <span className={s.spinner} aria-hidden="true" />
          <span>{prog ? `Codificando… ${prog}` : 'Preparando…'}</span>
        </div>
      )}

      {err && <Hint>error: {err}</Hint>}

      {res && (
        <>
          <Hint>
            Listo en {(res.ms / 1000).toFixed(1)} s · {weight(res.bytes)} · {res.frames} fotogramas
          </Hint>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video className={s.betaVideo} src={res.url} controls playsInline />
          <Button variant="primary" className={s.zipbtn} onClick={share}>
            Compartir el vídeo
          </Button>
        </>
      )}

      <Hint>
        Mide si tu móvil aguanta el export a vídeo. Si va bien, montamos la función
        de verdad (foto + vídeo en un layout).
      </Hint>
    </div>
  );
}

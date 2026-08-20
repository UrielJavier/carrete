import React from 'react';
import { weight } from '../../core/format.js';
import { Button, Hint } from '../../ui/primitives/index.js';
import { Icon } from '../../ui/icons.jsx';
import s from './ExportSheet.module.css';

/**
 * Las imagenes llegan como blobs y no como cadenas base64: un PNG de 1440x1800 en
 * base64 son varios megas de texto, y diez de esos no caben en memoria en un movil.
 * Quien abre esta hoja es responsable de liberarlos al cerrarla.
 */
export default function ExportSheet({
  shots, zip, zipping, width, height, format, onZip, onClose,
}) {
  const total = shots.reduce((a, sh) => a + (sh.bytes || 0), 0);

  /* Ficheros para la hoja de compartir nativa (Web Share API). En móvil, elegir
     Instagram → Feed sube las varias imágenes como un carrusel. */
  const shareFiles = React.useMemo(
    () => shots
      .filter((sh) => sh.blob)
      .map((sh) => new File([sh.blob], sh.name, { type: sh.blob.type || 'image/png' })),
    [shots],
  );
  const canShare = React.useMemo(() => {
    if (typeof navigator === 'undefined' || !navigator.canShare || !shareFiles.length) return false;
    try { return navigator.canShare({ files: shareFiles }); } catch (e) { return false; }
  }, [shareFiles]);

  const doShare = async () => {
    try {
      await navigator.share({ files: shareFiles, title: 'Maqueta' });
    } catch (e) {
      /* El usuario cancela, o el navegador no lo permite: no hacemos nada. */
    }
  };

  return (
    <div className={s.sheet}>
      <div className={s.bar}>
        <Icon.check />
        <span>
          {shots.length} {shots.length === 1 ? 'imagen' : 'imágenes'} · {width}×{height}
          {' · '}{format === 'jpeg' ? 'JPG' : 'PNG'} · {weight(total)}
        </span>
        <span className={s.grow} />
        <Button variant="ghost" onClick={onClose}><Icon.close /></Button>
      </div>

      <div className={s.zone}>
        {canShare && (
          <Button variant="primary" className={s.zipbtn} onClick={doShare}>
            <Icon.share />
            {`Compartir las ${shots.length}`}
          </Button>
        )}
        {zip ? (
          <a className={s.zip} href={zip.url} download={zip.name}>
            <Icon.download />
            <span>{zip.name} · {weight(zip.bytes)}</span>
          </a>
        ) : (
          <Button
            variant={canShare ? 'outline' : 'primary'}
            className={s.zipbtn}
            disabled={!!zipping}
            onClick={onZip}
          >
            {zipping ? `Empaquetando… ${zipping}%` : `Descargar las ${shots.length} en un ZIP`}
          </Button>
        )}
        <Hint>
          {canShare
            ? 'Compartir → Instagram → Feed las sube como un carrusel, en este orden.'
            : 'o guárdalas de una en una y súbelas en ese orden'}
        </Hint>
      </div>

      <div className={s.shots}>
        {shots.map((sh) => (
          <a key={sh.name} href={sh.url} download={sh.name}>
            <img src={sh.url} alt="" />
            <span>{sh.name} · {weight(sh.bytes)} ↓</span>
          </a>
        ))}
      </div>

      <p className={s.foot}>
        En Android puedes mantener pulsada cada imagen para guardarla en la galería.
        El ZIP va a Descargas y hay que abrirlo desde ahí.
      </p>
    </div>
  );
}

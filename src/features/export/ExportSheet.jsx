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
  shots, zip, zipping, width, height, format, stories, lowRes = 0, onZip, onClose,
}) {
  const total = shots.reduce((a, sh) => a + (sh.bytes || 0), 0);
  const nVideo = shots.filter((sh) => sh.video).length;
  const hasOriginal = shots.some((sh) => sh.original);
  /* El carrusel mezcla fotos y vídeos: la etiqueta se adapta a lo que hay. */
  const kind = nVideo === 0 ? (shots.length === 1 ? 'imagen' : 'imágenes')
    : nVideo === shots.length ? (shots.length === 1 ? 'vídeo' : 'vídeos')
      : 'archivos';

  /* Ficheros para la hoja de compartir nativa (Web Share API). En móvil, elegir
     Instagram → Feed sube las varias imágenes/vídeos como un carrusel. */
  const shareFiles = React.useMemo(
    () => shots
      .filter((sh) => sh.blob)
      .map((sh) => new File([sh.blob], sh.name, { type: sh.blob.type || (sh.video ? 'video/mp4' : 'image/png') })),
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
          {shots.length} {kind} · {width}×{height}
          {nVideo === 0 ? ` · ${format === 'jpeg' ? 'JPG' : 'PNG'}` : nVideo === shots.length ? ' · MP4' : ' · foto+vídeo'} · {weight(total)}
        </span>
        <span className={s.grow} />
        <Button variant="ghost" onClick={onClose}><Icon.close /></Button>
      </div>

      <div className={s.zone}>
        {canShare && (
          <>
            {stories ? (
              <p className={s.lead}>
                Cada página es una <strong>story</strong> (9:16). Toca <strong>Compartir</strong>,
                elige <strong>Instagram</strong> y dentro <strong>Historia</strong>, y súbelas
                <strong> en orden</strong>{nVideo > 0 && <> (las de vídeo van como clip)</>}.
              </p>
            ) : (
              <p className={s.lead}>
                Para subirlas a Instagram sin descargar nada: toca <strong>Compartir</strong>,
                elige <strong>Instagram</strong> y dentro <strong>Feed</strong>. Se publican
                las {shots.length} como un <strong>carrusel</strong>, en el orden que montaste
                {nVideo > 0 && <> (las páginas con vídeo van como clip)</>}.
              </p>
            )}
            <Button variant="primary" className={s.zipbtn} onClick={doShare}>
              <Icon.share />
              {`Compartir las ${shots.length}`}
            </Button>
          </>
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
            {zipping
              ? `Empaquetando… ${zipping}%`
              : (canShare ? 'o descárgalas en un ZIP' : `Descargar las ${shots.length} en un ZIP`)}
          </Button>
        )}
        <Hint>
          {canShare
            ? (stories
              ? 'Instagram te preguntará Reels / Stories / Feed al compartir: elige Stories.'
              : 'Instagram te preguntará Reels / Stories / Feed al compartir: elige Feed.')
            : 'o guárdalas de una en una y súbelas en ese orden'}
        </Hint>
      </div>

      <div className={s.shots}>
        {shots.map((sh) => (
          <a key={sh.name} href={sh.url} download={sh.name}>
            {sh.video
              ? <video src={sh.url} muted loop playsInline autoPlay preload="metadata" />
              : <img src={sh.thumb || sh.url} alt="" />}
            <span>{sh.name} · {weight(sh.bytes)}{sh.original ? ' · original' : ''} ↓</span>
          </a>
        ))}
      </div>

      {lowRes > 0 && (
        <p className={s.foot}>
          ⚠︎ {lowRes === 1 ? 'Una foto no llega' : `${lowRes} fotos no llegan`} a la resolución
          de su hueco a 1080&nbsp;px: Instagram {lowRes === 1 ? 'la' : 'las'} ampliará y
          puede{lowRes === 1 ? '' : 'n'} verse borrosa{lowRes === 1 ? '' : 's'}. Usa una foto
          más grande o dale un hueco más pequeño.
        </p>
      )}
      {hasOriginal && (
        <p className={s.foot}>
          Los archivos marcados <strong>original</strong> se suben <strong>sin recomprimir</strong>:
          es la mejor calidad posible (la foto/vídeo tal cual la hiciste, con su color y su audio).
        </p>
      )}
      <p className={s.foot}>
        <strong>Truco de calidad:</strong> en Instagram, activa Ajustes › Calidad de carga ›
        <strong> Subir con la máxima calidad</strong>, y sube con Wi-Fi. Aun así, Instagram
        recomprime una vez por su cuenta.
      </p>
      <p className={s.foot}>
        En Android puedes mantener pulsada cada imagen para guardarla en la galería.
        El ZIP va a Descargas y hay que abrirlo desde ahí.
      </p>
    </div>
  );
}

import React, { useRef, useEffect } from 'react';
import { clamp } from '../../core/layouts.js';
import { imageUnits, clampT, newT } from '../../core/geometry.js';
import { weight } from '../../core/format.js';
import { FileInput } from '../../ui/primitives/index.js';
import { Icon } from '../../ui/icons.jsx';
import s from './Cell.module.css';

/**
 * Los gestos se reparten por NIVEL, y cada uno es exclusivo:
 *
 *   Post / Página   tocar selecciona; el arrastre pertenece al lienzo
 *   Página + mover  arrastrar la foto la intercambia
 *   Foto            arrastrar encuadra, pinza amplia
 *
 * En los dos primeros la celda escucha CLICK y no pointerdown, porque un click
 * solo se dispara si nadie ha interceptado el gesto: asi arrastrar para cambiar de
 * pagina nunca selecciona por accidente.
 */
export default function Cell({
  cell, image, selected, isDrop, isLifting, dupCount, level, tool, showThirds, guardRef, faded, dimmed,
  fill, blurPx = 8,
  onSelect, onOpen, onFiles, onTransform, onDupInfo, onSwapStart, onSwapOver, onSwapEnd,
}) {
  const boxRef = useRef(null);
  const ptrs = useRef(new Map());
  const gesture = useRef(null);
  const before = useRef(null);
  const vidRef = useRef(null);

  /* Si el medio es un vídeo recortado, la reproducción se ciñe al trozo [start, end]:
     así el área de trabajo previsualiza justo lo que se exportará. */
  const trimStart = cell.trim?.start ?? 0;
  const trimEnd = cell.trim?.end;
  useEffect(() => {
    const v = vidRef.current;
    if (!v || image?.type !== 'video') return undefined;
    const keepInRange = () => {
      if (trimEnd != null && (v.currentTime >= trimEnd || v.currentTime < trimStart - 0.05)) {
        try { v.currentTime = trimStart; } catch (e) { /* seek no disponible aún */ }
      }
    };
    try {
      if (v.currentTime < trimStart || (trimEnd != null && v.currentTime > trimEnd)) {
        v.currentTime = trimStart;
      }
    } catch (e) { /* seek */ }
    v.addEventListener('timeupdate', keepInRange);
    return () => v.removeEventListener('timeupdate', keepInRange);
  }, [image, trimStart, trimEnd]);

  const pos = {
    left: `${cell.rect.xLocal * 100}%`,
    top: `${cell.rect.y * 100}%`,
    width: `${cell.rect.w * 100}%`,
    height: `${cell.rect.h * 100}%`,
  };

  if (!image) {
    return (
      <div
        className={[s.cell, s.empty, faded && s.faded, dimmed && s.dimmed].filter(Boolean).join(' ')}
        data-cell={cell.cellIndex}
        style={pos}
      >
        <div className={s.placeholder}>
          <span className={s.sign}>+</span>
          <span className={s.lbl}>añadir</span>
        </div>
        <FileInput onFiles={onFiles} guardRef={guardRef} />
      </div>
    );
  }

  const ia = image.w / image.h;
  const t = clampT(cell.t, cell.cellAspect, ia);
  const u = imageUnits(t.scale, cell.cellAspect, ia);

  const imgStyle = {
    left: `${(0.5 - t.fx * u.dwU) * 100}%`,
    top: `${(0.5 - t.fy * u.dhU) * 100}%`,
    width: `${u.dwU * 100}%`,
    height: `${u.dhU * 100}%`,
  };

  /* La celda pinta un <video> si el medio es vídeo, y una <img> si es foto; el
     encuadre (posición/escala) es idéntico. Si el relleno es 'blur', detrás va una
     capa a COVER, ampliada y desenfocada, que tapa los huecos con la propia foto (en
     vídeo se usa el póster para no montar dos vídeos por celda). */
  const media = (
    <>
      {fill === 'blur' && (
        <img
          className={s.blurfill}
          src={image.type === 'video' ? image.el?.src : image.url}
          alt=""
          draggable={false}
          style={{ filter: `blur(${blurPx}px)` }}
        />
      )}
      {image.type === 'video' ? (
        <video ref={vidRef} src={image.url} style={imgStyle} muted loop playsInline autoPlay preload="auto" />
      ) : (
        <img src={image.url} alt="" draggable={false} style={imgStyle} />
      )}
    </>
  );

  const moving = level === 'page' && tool === 'move';
  const framing = level === 'photo';
  const cls = [
    s.cell, s.filled,
    selected && s.selected,
    isDrop && s.dropzone,
    isLifting && s.lifting,
    moving && s.movable,
    framing && s.framing,
    /* En Página (sin encuadre ni mover) la celda deja pasar el paneo horizontal,
       para poder desplazar la tira aunque el gesto empiece sobre una foto. */
    !framing && !moving && s.scrollable,
    /* En Foto solo se ve la celda que editas: el resto del layout se desvanece. */
    faded && s.faded,
    /* En Página, al seleccionar una, las demás se atenúan (siguen tocables). */
    dimmed && s.dimmed,
  ].filter(Boolean).join(' ');

  const chrome = (
    <>
      {/* Avisos arriba-derecha, lejos de los metadatos (abajo-izquierda) para que no
          se pisen. */}
      <div className={s.flags}>
        {dupCount > 1 && (
          <button
            type="button"
            className={s.dupflag}
            title="Foto repetida — toca para ver dónde"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDupInfo(); }}
          >
            <Icon.warn />
          </button>
        )}
        {image.type === 'video' && (
          <span className={s.mutedflag} title="Esta versión exporta el vídeo sin audio">
            <Icon.mute />
          </span>
        )}
      </div>
      <div className={s.badges}>
        <div className={s.sizetag}>
          {image.w}×{image.h}
          {image.file?.size ? ` · ${weight(image.file.size)}` : ''}
        </div>
      </div>
      <i className={s.mark} />
      {framing && selected && showThirds && (
        <div className={s.thirds}>
          <i className="v" style={{ left: '33.333%' }} />
          <i className="v" style={{ left: '66.666%' }} />
          <i className="h" style={{ top: '33.333%' }} />
          <i className="h" style={{ top: '66.666%' }} />
        </div>
      )}
    </>
  );

  /* Herramienta de mover: se arrastra la foto entera, sin asa, porque en ese modo
     ningun otro gesto compite. */
  if (moving) {
    return (
      <div
        ref={boxRef}
        className={cls}
        data-cell={cell.cellIndex}
        style={pos}
        onPointerDown={(e) => {
          boxRef.current?.setPointerCapture?.(e.pointerId);
          onSwapStart(cell.cellIndex);
        }}
        onPointerMove={(e) => { e.preventDefault(); onSwapOver(e.clientX, e.clientY); }}
        onPointerUp={onSwapEnd}
        onPointerCancel={onSwapEnd}
      >
        {media}
        {chrome}
      </div>
    );
  }

  if (!framing) {
    return (
      <div
        ref={boxRef}
        className={cls}
        data-cell={cell.cellIndex}
        style={pos}
        onClick={() => (selected ? onOpen() : onSelect())}
      >
        {media}
        {chrome}
      </div>
    );
  }

  const centroid = () => {
    const pts = [...ptrs.current.values()];
    return {
      x: pts.reduce((a, q) => a + q.x, 0) / pts.length,
      y: pts.reduce((a, q) => a + q.y, 0) / pts.length,
      d: pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
    };
  };
  /* El rect solo se mide al empezar el gesto: es lo unico que necesita pixeles. */
  const snap = () => ({ c: centroid(), t: { ...t }, box: boxRef.current.getBoundingClientRect() });

  return (
    <div
      ref={boxRef}
      className={cls}
      data-cell={cell.cellIndex}
      style={pos}
      onPointerDown={(e) => {
        if (!selected) { onSelect(); return; }
        boxRef.current?.setPointerCapture?.(e.pointerId);
        ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        gesture.current = snap();
        if (!before.current) before.current = { ...t };
      }}
      onPointerMove={(e) => {
        const g = gesture.current;
        if (!g || !ptrs.current.has(e.pointerId)) return;
        ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const c = centroid();
        let scale = g.t.scale;
        if (ptrs.current.size > 1 && g.c.d > 0 && c.d > 0) {
          scale = clamp((g.t.scale * c.d) / g.c.d, 1, 8);
        }
        const un = imageUnits(scale, cell.cellAspect, ia);
        onTransform(
          clampT({
            scale,
            fx: g.t.fx - (c.x - g.c.x) / (un.dwU * g.box.width),
            fy: g.t.fy - (c.y - g.c.y) / (un.dhU * g.box.height),
          }, cell.cellAspect, ia),
          false
        );
      }}
      onPointerUp={(e) => {
        ptrs.current.delete(e.pointerId);
        if (ptrs.current.size) { gesture.current = snap(); return; }
        gesture.current = null;
        /* Un encuadre completo es UN paso de deshacer, no uno por pixel. */
        const b = before.current;
        before.current = null;
        if (b && (b.scale !== t.scale || b.fx !== t.fx || b.fy !== t.fy)) onTransform(t, true);
      }}
      onPointerCancel={() => { ptrs.current.clear(); gesture.current = null; before.current = null; }}
      onWheel={(e) => {
        e.preventDefault();
        onTransform(clampT({ ...t, scale: t.scale * (e.deltaY < 0 ? 1.08 : 1 / 1.08) }, cell.cellAspect, ia), true);
      }}
      onDoubleClick={() => onTransform(newT(), true)}
    >
      {media}
      {chrome}
    </div>
  );
}

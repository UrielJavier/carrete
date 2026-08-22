import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { RATIOS, TRANSPARENT, PEEK_GAP, MAX_SLIDES } from '../../core/layouts.js';
import { safeRect } from '../../core/text.js';
import Cell from './Cell.jsx';
import TextLayer from './TextLayer.jsx';
import RegionCanvas from './RegionCanvas.jsx';
import s from './PageStrip.module.css';

/**
 * Área de trabajo de los niveles Página y Foto. TODAS las páginas están montadas
 * en una tira con scroll horizontal: se ven unas tres a la vez (la centrada entera
 * y un tercio de cada vecina) y se desplaza a cualquiera.
 *
 * Los dos niveles comparten componente A PROPÓSITO, para que las transiciones sean
 * suaves sin sincronizar nada: al pasar a Foto la página activa ESCALA (zoom) y las
 * vecinas se desvanecen (opacidad), y al volver a Página ocurre lo inverso. Como el
 * layout se mantiene siempre a tamaño de Página y el acercamiento es un `transform`,
 * el centrado por scroll nunca se descuadra.
 *
 * La centrada es la ACTIVA: en Página las vecinas quedan atenuadas y sin interacción
 * hasta que el scroll las trae al centro; en Foto se ocultan y solo la activa recibe
 * los gestos de encuadre.
 */
export default function PageStrip({
  post, cells, current, level, images, sel, tool, dropIdx, liftIdx, dupKeys,
  showThirds, metrics, guardRef, enter, areaW, workH, textSel,
  onSelect, onOpen, onFiles, onTransform, onDupInfo, onCenter, onAdd, onLimit,
  onSwapStart, onSwapOver, onSwapEnd, onSelectText, onMoveText, onExitFocus,
}) {
  const scrollRef = useRef(null);
  const centered = useRef(-1);
  const lock = useRef(false);
  const settle = useRef(null);
  const lastStep = useRef(0);
  /* Congelado al montar: acercarse desde Post se anima una vez, sin repetir en cada
     render ni al alternar Página↔Foto (que no desmontan este componente). */
  const [zoomEntry] = useState(enter);

  const R = RATIOS[post.ratio];
  const { stageW, stageH } = metrics;
  const step = stageW + PEEK_GAP;
  const cropPct = Math.min(1, (R.h * 3) / 4 / R.w);
  const photo = level === 'photo';
  /* En Texto se enfoca la PÁGINA entera en un lienzo PROPIO (fuera de la tira, que
     recorta), dimensionado para llenar el área a su proporción: la misma técnica que
     el foco de Foto. Así ocupa el máximo sin recortarse arriba/abajo. */
  const textFocus = level === 'text';
  let pageFocusW = 0;
  let pageFocusH = 0;
  if (textFocus && areaW && workH) {
    const pa = R.w / R.h; // proporción de la página (ancho/alto)
    pageFocusH = Math.min(workH, areaW / pa);
    pageFocusW = pageFocusH * pa;
  }
  const safe = safeRect(post.safe, post.ratio);
  const locked = photo || textFocus || tool === 'move';
  const full = post.slides.length >= MAX_SLIDES;
  /* En Página, si hay una foto seleccionada en la página activa, las demás se
     atenúan (estilo Figma): la selección habla sin necesidad de más navegación. */
  const selHere = !photo && tool !== 'move' && !!sel && sel.slideIndex === current;

  /* Fuente de imagen para el lienzo del foco de texto: el preview ya decodificado. */
  const focusSrc = useCallback(
    (id) => (images[id]?.el ? { el: images[id].el, w: images[id].w, h: images[id].h } : null),
    [images],
  );

  /* Las celdas de cada página en espacio local: x relativa al inicio de su página. */
  const byPage = useMemo(() => {
    const m = post.slides.map(() => []);
    for (const c of cells) {
      m[c.slideIndex]?.push({ ...c, rect: { ...c.rect, xLocal: c.rect.x - c.slideIndex } });
    }
    return m;
  }, [cells, post.slides.length]);

  /* En Foto se muestra SOLO la celda seleccionada, en un lienzo propio (fuera de la
     tira) dimensionado por la FORMA de la celda: se agranda hasta llenar el área real
     según su proporción (apaisada → ancho; vertical → alto). Así se edita al máximo
     detalle y sin distracciones. Reutiliza Cell, con la celda ocupando todo el marco. */
  const focusCell = photo && sel
    ? byPage[current]?.find((c) => c.cellIndex === sel.cellIndex)
    : null;
  const focusImage = focusCell?.imgId ? images[focusCell.imgId] : null;
  let focusW = 0;
  let focusH = 0;
  if (focusCell && areaW && workH) {
    const ca = focusCell.cellAspect; // ancho / alto de la celda
    focusH = Math.min(workH, areaW / ca);
    focusW = focusH * ca;
  }

  /* Centrar la página activa. Al MONTAR (llegando desde Post) se coloca sin animar.
     Después, suave si el cambio vino de fuera (‹ ›, seleccionar) e instantáneo si
     solo cambió el tamaño (resize). Cambiar entre Página y Foto NO desmonta, así que
     el scroll se conserva y la transición la hace el zoom, no un salto. */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = current * step;
    const resized = lastStep.current !== step;
    lastStep.current = step;
    /* Montaje o resize: colocar sin animar. */
    if (centered.current === -1 || resized) { centered.current = current; el.scrollLeft = target; return; }
    /* El scroll propio ya dejó la activa en el centro (onScroll actualiza `centered`
       antes de avisar), así que no hay que re-desplazar y pelear con el dedo. */
    if (centered.current === current) return;
    /* Cambio externo (‹ ›, seleccionar): desplazar suave. */
    centered.current = current;
    lock.current = true;
    el.scrollTo({ left: target, behavior: 'smooth' });
    clearTimeout(settle.current);
    settle.current = setTimeout(() => { lock.current = false; }, 380);
  }, [current, step]);

  /* La página que cruza el centro pasa a ser la activa EN VIVO, no al soltar. */
  const onScroll = useCallback(() => {
    if (lock.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / step);
    if (i !== current && i >= 0 && i < post.slides.length) {
      centered.current = i;
      onCenter(i);
    }
  }, [current, step, post.slides.length, onCenter]);

  return (
    <div className={s.holder}>
      {/* En foco (Texto o Foto), un backdrop cubre TODA el área: tocar cualquier
          parte del negro sube un nivel (vuelve a Página). El lienzo del foto/texto va
          por encima (z mayor), así que sus gestos no lo disparan. */}
      {(photo || textFocus) && (
        <div className={s.backdrop} onClick={() => onExitFocus?.()} />
      )}
      <div
        ref={scrollRef}
        className={[s.strip, locked && s.locked, (photo || textFocus) && s.dim, zoomEntry && s.zoomin]
          .filter(Boolean).join(' ')}
        style={{ gap: PEEK_GAP, paddingInline: `calc((100% - ${stageW}px) / 2)` }}
        onScroll={onScroll}
      >
      {post.slides.map((sl, i) => {
        const active = i === current;
        return (
          <div
            key={sl.id}
            data-page={i}
            className={[s.page, !active && s.inactive, post.bg === TRANSPARENT && 'checker']
              .filter(Boolean).join(' ')}
            style={{
              width: stageW,
              height: stageH,
              background: post.bg === TRANSPARENT ? undefined : post.bg,
            }}
          >
            {byPage[i].map((c) => {
              const image = c.imgId ? images[c.imgId] : null;
              return (
                <Cell
                  key={`${sl.id}-${c.cellIndex}`}
                  cell={c}
                  image={image}
                  selected={sel?.slideIndex === i && sel?.cellIndex === c.cellIndex}
                  isDrop={active && dropIdx === c.cellIndex}
                  isLifting={active && liftIdx === c.cellIndex}
                  dupCount={image ? dupKeys[image.key] || 0 : 0}
                  level="page"
                  tool={tool}
                  showThirds={showThirds}
                  guardRef={guardRef}
                  fill={post.fill}
                  blurPx={c.rect.w * stageW * 0.022}
                  dimmed={active && selHere && c.cellIndex !== sel.cellIndex}
                  onSelect={() => onSelect(c.cellIndex)}
                  onOpen={() => onOpen(c.cellIndex)}
                  onFiles={(files) => onFiles(files, c.cellIndex)}
                  onDupInfo={() => onDupInfo(image)}
                  onSwapStart={onSwapStart}
                  onSwapOver={onSwapOver}
                  onSwapEnd={onSwapEnd}
                />
              );
            })}

            {/* Líneas del recorte 3:4 sobre la 1ª página; el rótulo va fuera del
                layout (abajo). Solo en Página. */}
            {i === 0 && cropPct < 1 && !photo && !textFocus && (
              <div className={s.cropline}
                style={{ left: `${((1 - cropPct) / 2) * 100}%`, width: `${cropPct * 100}%` }} />
            )}

            {/* Área segura: guía de edición (no se exporta), sobre la que el texto
                se imanta. Se ve mientras editas (niveles Página/Texto). */}
            {!photo && !textFocus && safe && (
              <div
                className={s.safe}
                style={{
                  left: `${safe.l * 100}%`,
                  top: `${safe.t * 100}%`,
                  width: `${(safe.r - safe.l) * 100}%`,
                  height: `${(safe.b - safe.t) * 100}%`,
                }}
              />
            )}

            {/* Textos por encima de las fotos. Solo se editan en la página activa y
                en el nivel Página (en Foto se ve solo la celda enfocada). */}
            <TextLayer
              texts={sl.texts}
              cells={byPage[i]}
              safe={safe}
              selId={textSel && textSel.slideIndex === i ? textSel.id : null}
              active={active && !photo && !textFocus}
              stageH={stageH}
              onSelect={(id) => onSelectText(i, id)}
              onMove={(id, x, y, commit) => onMoveText(i, id, x, y, commit)}
            />
          </div>
        );
      })}

      {/* Al final de la tira, del tamaño de una página: se llega deslizando hasta
          el final y añade una página nueva al carrusel. Solo en el nivel Página. */}
      {!photo && !textFocus && (
        <button
          type="button"
          className={[s.add, full && s.addoff].filter(Boolean).join(' ')}
          style={{ width: stageW, height: stageH }}
          title={full ? `Máximo de ${MAX_SLIDES} páginas` : 'Añadir página al final'}
          onClick={() => (full ? onLimit() : onAdd())}
        >
          <svg viewBox="0 0 24 24" width="40" height="40">
            <path d="M12 5.5v13M5.5 12h13" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
      )}
      </div>

      {/* Foto: la celda seleccionada sola, a su forma, llenando el área. Reutiliza
          Cell con la celda ocupando todo el marco (rect 0,0,1,1); la proporción y el
          encuadre salen de cellAspect, igual que en el export. */}
      {photo && focusCell && focusImage && (
        <div
          className={[s.focus, post.bg === TRANSPARENT && 'checker'].filter(Boolean).join(' ')}
          style={{
            width: Math.round(focusW),
            height: Math.round(focusH),
            background: post.bg === TRANSPARENT ? undefined : post.bg,
          }}
        >
          <Cell
            cell={{ ...focusCell, rect: { ...focusCell.rect, x: 0, y: 0, xLocal: 0, w: 1, h: 1 } }}
            image={focusImage}
            selected
            dupCount={dupKeys[focusImage.key] || 0}
            level="photo"
            tool={tool}
            showThirds={showThirds}
            guardRef={guardRef}
            fill={post.fill}
            blurPx={focusW * 0.022}
            onSelect={() => onSelect(focusCell.cellIndex)}
            onOpen={() => {}}
            onTransform={(t, history) => onTransform(focusCell.cellIndex, t, history)}
            onDupInfo={() => onDupInfo(focusImage)}
          />
        </div>
      )}

      {/* Texto: la PÁGINA entera en un lienzo propio (como el foco de Foto pero con la
          página completa), llenando el área a su proporción. Las fotos van por canvas
          (estáticas) y el texto por encima, arrastrable. */}
      {textFocus && pageFocusW > 0 && (
        <div
          className={[s.focus, post.bg === TRANSPARENT && 'checker'].filter(Boolean).join(' ')}
          style={{
            width: Math.round(pageFocusW),
            height: Math.round(pageFocusH),
            background: post.bg === TRANSPARENT ? undefined : post.bg,
          }}
        >
          <RegionCanvas
            cells={cells}
            index={current}
            ratio={post.ratio}
            bg={post.bg}
            getSource={focusSrc}
            fill={post.fill}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
          {safe && (
            <div
              className={s.safe}
              style={{
                left: `${safe.l * 100}%`,
                top: `${safe.t * 100}%`,
                width: `${(safe.r - safe.l) * 100}%`,
                height: `${(safe.b - safe.t) * 100}%`,
              }}
            />
          )}
          <TextLayer
            texts={post.slides[current].texts}
            cells={byPage[current]}
            safe={safe}
            selId={textSel && textSel.slideIndex === current ? textSel.id : null}
            active
            stageH={Math.round(pageFocusH)}
            onSelect={(id) => onSelectText(current, id)}
            onMove={(id, x, y, commit) => onMoveText(current, id, x, y, commit)}
          />
        </div>
      )}

      {/* Aviso del recorte 3:4: FUERA del layout, en la banda inferior vacía del
          área (las páginas son más bajas), cuando estás en la 1ª página. */}
      {!photo && !textFocus && current === 0 && cropPct < 1 && (
        <span className={s.cropnote}>recorte 3:4 · cuadrícula</span>
      )}
    </div>
  );
}

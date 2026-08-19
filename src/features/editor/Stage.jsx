import React from 'react';
import { RATIOS, TRANSPARENT } from '../../core/layouts.js';
import RegionCanvas from './RegionCanvas.jsx';
import Cell from './Cell.jsx';
import s from './Stage.module.css';

/** El borde de la pagina vecina. No hay que montar nada: se le pide al
 *  renderizador la region [i, i+1] del lienzo del post y el area la recorta. */
function Peek({ index, slides, cells, ratio, bg, getSource, metrics, visible, onClick, title }) {
  const empty = !visible || index < 0 || index >= slides.length;
  return (
    <div
      className={[s.peek, empty && s.empty, bg === TRANSPARENT && 'checker'].filter(Boolean).join(' ')}
      style={{ width: visible ? metrics.stageW : 0, height: metrics.stageH }}
      onClick={empty ? undefined : onClick}
      title={title}
    >
      {!empty && (
        <RegionCanvas
          cells={cells} index={index} ratio={ratio} bg={bg} getSource={getSource} res={360}
          style={{ width: metrics.stageW, height: metrics.stageH }}
        />
      )}
    </div>
  );
}

/**
 * La pagina abierta, con las vecinas asomando. El area mantiene su altura en los
 * tres niveles: lo que cambia es el tamaño del contenido, no el hueco.
 */
export default function Stage({
  post, cells, localCells, current, level, tool, images, sel, dropIdx, liftIdx,
  showThirds, metrics, guardRef, getSource, swipe,
  onSelect, onOpen, onFiles, onTransform, onDupInfo, onGoPage,
  onSwapStart, onSwapOver, onSwapEnd, dupKeys,
}) {
  const R = RATIOS[post.ratio];
  const cropPct = Math.min(1, (R.h * 3) / 4 / R.w);
  const slide = post.slides[current];
  const peeksVisible = level === 'page';

  return (
    <div className={[s.row, swipe.drag && s.dragging].filter(Boolean).join(' ')}
      style={{ transform: swipe.drag ? `translateX(${swipe.drag}px)` : '' }}
      {...swipe.handlers}
    >
      <Peek
        index={current - 1} slides={post.slides} cells={cells} ratio={post.ratio} bg={post.bg}
        getSource={getSource} metrics={metrics} visible={peeksVisible}
        onClick={() => onGoPage(current - 1)} title="Página anterior"
      />

      {/* Con fondo transparente se pinta un damero detras, para que el hueco se
          lea como "sin fondo" y no como negro. */}
      <div
        className={[s.stage, post.bg === TRANSPARENT && 'checker'].filter(Boolean).join(' ')}
        style={{
          width: metrics.stageW,
          height: metrics.stageH,
          background: post.bg === TRANSPARENT ? undefined : post.bg,
        }}
      >
        {localCells.map((c) => {
          const image = c.imgId ? images[c.imgId] : null;
          return (
            <Cell
              key={`${slide.id}-${c.cellIndex}`}
              cell={c}
              image={image}
              selected={sel?.slideIndex === current && sel?.cellIndex === c.cellIndex}
              isDrop={dropIdx === c.cellIndex}
              isLifting={liftIdx === c.cellIndex}
              dupCount={image ? dupKeys[image.key] || 0 : 0}
              level={level}
              tool={tool}
              showThirds={showThirds}
              guardRef={guardRef}
              onSelect={() => onSelect(c.cellIndex)}
              onOpen={() => onOpen(c.cellIndex)}
              onFiles={(files) => onFiles(files, c.cellIndex)}
              onTransform={(t, history) => onTransform(c.cellIndex, t, history)}
              onDupInfo={() => onDupInfo(image)}
              onSwapStart={onSwapStart}
              onSwapOver={onSwapOver}
              onSwapEnd={onSwapEnd}
            />
          );
        })}

        {current === 0 && cropPct < 1 && (
          <>
            <div className={s.cropline}
              style={{ left: `${((1 - cropPct) / 2) * 100}%`, width: `${cropPct * 100}%` }} />
            <span className={s.croptag}>recorte 3:4 · cuadrícula</span>
          </>
        )}
      </div>

      <Peek
        index={current + 1} slides={post.slides} cells={cells} ratio={post.ratio} bg={post.bg}
        getSource={getSource} metrics={metrics} visible={peeksVisible}
        onClick={() => onGoPage(current + 1)} title="Página siguiente"
      />
    </div>
  );
}

export const StageWrap = ({ children, innerRef }) => (
  <div className={s.wrap} ref={innerRef}>
    <div className={s.area}>{children}</div>
  </div>
);

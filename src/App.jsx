/**
 * MAQUETA — composicion de la aplicacion.
 *
 * Este fichero no calcula nada: reune el estado, los hooks y las vistas. Toda la
 * geometria, el color y el modelo del post viven en src/core, cubiertos por tests;
 * los gestos y la persistencia en src/hooks; el aspecto en src/ui y src/features.
 */

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { RATIOS, MAX_SLIDES, PEEK_FRAC, PEEK_GAP, FOTO_ZOOM } from './core/layouts.js';
import { postCells, stageMetrics, newT, clampT } from './core/geometry.js';
import { CS_LABEL, OFF_PROFILE } from './core/color.js';
import { buildPreview } from './core/image.js';
import { newPost, duplicates, layoutChangeImpact, exportSize } from './core/post.js';
import { newText } from './core/text.js';
import { reducer, initialState } from './state/store.js';

import { useElementWidth, useElementHeight, useViewportHeight } from './hooks/useElementWidth.js';
import { useFullscreen } from './hooks/useFullscreen.js';
import { useToast, TOAST_MS } from './hooks/useToast.js';
import { useTapGuard } from './hooks/useTapGuard.js';
import { usePageSwipe } from './hooks/usePageSwipe.js';
import { useProjects } from './hooks/useProjects.js';
import { useImageLibrary } from './hooks/useImageLibrary.js';
import { useStorageEstimate } from './hooks/useStorageEstimate.js';
import { HAPTIC, haptic } from './hooks/useHaptics.js';

import AppShell, { Section, Busy } from './ui/layout/AppShell.jsx';
import NavDrawer from './ui/layout/NavDrawer.jsx';
import { Button, SegmentedControl, Notice, Toast, Dialog } from './ui/primitives/index.js';
import { Icon } from './ui/icons.jsx';

import { StageWrap } from './features/editor/Stage.jsx';
import PageStrip from './features/editor/PageStrip.jsx';
import PostRail from './features/editor/PostRail.jsx';
import PageBar from './features/editor/PageBar.jsx';
import LevelPanel, { PostPanel, PagePanel, PhotoPanel } from './features/editor/LevelPanel.jsx';
import TextPanel from './features/editor/panels/TextPanel.jsx';
import FeedView from './features/feed/FeedView.jsx';
import StoriesView from './features/feed/StoriesView.jsx';
import ProfileGrid from './features/profile/ProfileGrid.jsx';
import ProjectsView from './features/projects/ProjectsView.jsx';
import LibraryView from './features/library/LibraryView.jsx';
import ExportSheet from './features/export/ExportSheet.jsx';
import { exportPost } from './features/export/exportPost.js';
import { zipShots, safeName } from './features/export/zipShots.js';

import './styles/tokens.css';
import './styles/base.css';

export const VERSION = '4.25.0';

/* Altura que consumen cabecera, datos, barra de pagina, pestañas y herramientas.
   Todo lo que queda es para el area de trabajo, que mide lo mismo en los tres
   niveles: lo que cambia es el tamaño del contenido, no el hueco. */
const RESERVED = 366;

export default function App() {
  const [st, dispatch] = useReducer(reducer, undefined, initialState);
  const { post, images, history, current, sel, textSel, level, tool, mode } = st;

  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState(null);
  const [ask, setAsk] = useState(null);
  const [shots, setShots] = useState(null);
  const [zip, setZip] = useState(null);
  const [zipping, setZipping] = useState(null);
  const [showThirds, setShowThirds] = useState(false);
  const [customBg, setCustomBg] = useState('#e7e2d8');
  const [dropIdx, setDropIdx] = useState(null);
  const [liftIdx, setLiftIdx] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  const wrapRef = useRef(null);
  const swapFrom = useRef(null);
  const dropRef = useRef(null);
  const lastDrop = useRef(null);
  /* Nivel del render anterior: da la DIRECCIÓN de la transición post↔página, para
     que la vista que entra sepa si acercarse (desde Post) o alejarse (desde Página). */
  const prevLevel = useRef(level);

  const wrapW = useElementWidth(wrapRef);
  const workH = useElementHeight(wrapRef);
  const viewH = useViewportHeight();
  const { toast, say, clear } = useToast();
  const { guardRef, arm } = useTapGuard();
  const fullscreen = useFullscreen((m) => say(m, 'warn'));

  const projects = useProjects({
    post,
    images,
    current,
    ui: { customBg, showThirds },
    onLoad: (doc, imgs, cur) => dispatch({ type: 'loadPost', post: doc, images: imgs, current: cur }),
    onError: setErr,
    setBusy,
  });

  const library = useImageLibrary({ post, images, dispatch, setBusy, onError: setErr });
  const estimate = useStorageEstimate([mode, projects.projects.length]);

  /* ── arranque ── */
  useEffect(() => {
    projects.boot().then(({ ui, empty }) => {
      if (ui.customBg) setCustomBg(ui.customBg);
      setShowThirds(!!ui.showThirds);
      if (empty) dispatch({ type: 'set', patch: { mode: 'projects' } });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── derivados ── */
  /* Siempre a tamaño de Página: el acercamiento del nivel Foto lo hace un transform
     sobre la página activa, no el layout, así el centrado por scroll no se descuadra.
     areaH es idéntica en los tres niveles, así que fijar 'page' no cambia el alto. */
  const metrics = useMemo(
    () => stageMetrics(wrapW, viewH, post.ratio, 'page', {
      peekFrac: PEEK_FRAC, peekGap: PEEK_GAP, fotoZoom: FOTO_ZOOM, reserved: RESERVED,
    }),
    [wrapW, viewH, post.ratio]
  );
  const cells = useMemo(() => postCells(post), [post]);
  const localCells = useMemo(
    () => cells
      .filter((c) => c.slideIndex === current)
      .map((c) => ({ ...c, rect: { ...c.rect, xLocal: c.rect.x - current } })),
    [cells, current]
  );
  const dup = useMemo(() => duplicates(post, images), [post, images]);
  const getSource = useCallback(
    /* Sin `el` (p.ej. un vídeo cuyo póster no se pudo capturar) no hay nada que
       dibujar en canvas: se trata como celda vacía en miniaturas/feed/export. */
    (id) => (images[id]?.el ? { el: images[id].el, w: images[id].w, h: images[id].h } : null),
    [images]
  );

  const slide = post.slides[current];
  const selCell = sel
    ? localCells.find((c) => c.slideIndex === sel.slideIndex && c.cellIndex === sel.cellIndex)
    : null;
  const selImage = selCell?.imgId ? images[selCell.imgId] : null;
  const selText = textSel
    ? post.slides[textSel.slideIndex]?.texts?.find((t) => t.id === textSel.id)
    : null;
  const R = RATIOS[post.ratio];
  /* Tamaño real del fichero al exportar (el ratio da la forma; el ancho es fijo, 1080). */
  const exSize = exportSize(post.ratio);
  /* 9:16 es formato Stories: no hay carrusel de feed ni cuadrícula de perfil, así que
     las vistas previas y el texto del export se adaptan. */
  const isStories = post.ratio === '9:16';

  /* El nivel Foto no puede existir sin foto: es el unico ajuste automatico que
     queda. Lo demas lo decide el usuario con las pestañas. */
  useEffect(() => {
    if (level === 'photo' && !selImage) dispatch({ type: 'level', level: 'page' });
    /* Igual con el texto: si el seleccionado deja de existir (p.ej. tras deshacer),
       se sube a Página en vez de quedar en un nivel Texto vacío. */
    if (level === 'text' && !selText) dispatch({ type: 'level', level: 'page' });
  }, [level, selImage, selText]);

  /* Se actualiza DESPUÉS del render, así que al montar la vista nueva `prevLevel`
     aún conserva el nivel del que se viene. */
  useEffect(() => { prevLevel.current = level; }, [level]);

  /* En Stories no hay pestaña Perfil: si estabas ahí y cambias a 9:16, vuelve a la
     vista de stories para no quedarte en un modo sin pestaña. */
  useEffect(() => {
    if (isStories && mode === 'grid') dispatch({ type: 'set', patch: { mode: 'feed' } });
  }, [isStories, mode]);

  /* Deshacer puede requerir regenerar previews, porque el giro y el espejo viven en
     el registro de la foto y no en el post. */
  useEffect(() => {
    const pend = st.pendingOrient;
    if (!pend) return;
    (async () => {
      const ids = Object.keys(pend).filter((id) => images[id]
        && ((images[id].rot || 0) !== pend[id].rot || !!images[id].flip !== !!pend[id].flip));
      if (!ids.length) { dispatch({ type: 'orientApplied' }); return; }
      setBusy('Deshaciendo…');
      const next = { ...images };
      for (const id of ids) {
        const im = images[id];
        const o = pend[id];
        const pv = await buildPreview(im.file, im.cs, im.converted, o.rot, o.flip);
        if (im.url?.startsWith('blob:')) URL.revokeObjectURL(im.url);
        next[id] = { ...im, ...pv, rot: o.rot, flip: o.flip, saved: false };
      }
      dispatch({ type: 'orientApplied', images: next });
      setBusy(null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st.pendingOrient]);

  /* ── gestos ── */
  const swipe = usePageSwipe({
    enabled: mode === 'edit' && level === 'page' && tool !== 'move',
    pageWidth: metrics.stageW,
    atStart: current === 0,
    atEnd: current === post.slides.length - 1,
    onStep: (step) => dispatch({ type: 'goPage', i: current + step }),
  });

  const cellAt = (x, y) => {
    const node = document.elementFromPoint(x, y);
    const box = node?.closest?.('[data-cell]');
    return box ? parseInt(box.dataset.cell, 10) : null;
  };

  const onSwapOver = (x, y) => {
    const idx = cellAt(x, y);
    const valid = idx !== null && idx !== swapFrom.current ? idx : null;
    if (valid !== lastDrop.current) {
      if (valid !== null) haptic(HAPTIC.drop);
      lastDrop.current = valid;
    }
    dropRef.current = valid;
    setDropIdx(valid);
  };

  const onSwapEnd = () => {
    /* El destino se lee ANTES de limpiar las marcas: al arrastrar la celda entera,
       el dedo puede acabar fuera de cualquier celda al soltar. */
    const target = dropRef.current;
    const from = swapFrom.current;
    swapFrom.current = null;
    dropRef.current = null;
    lastDrop.current = null;
    setDropIdx(null);
    setLiftIdx(null);
    if (target !== null && from !== null && target !== from) {
      dispatch({ type: 'swapCells', a: from, b: target });
    }
  };

  /* ── acciones ── */
  const chooseLayout = (layoutId) => {
    if (slide.layoutId === layoutId) return;
    const { kept, lost, holes } = layoutChangeImpact(slide, layoutId);
    /* Solo molesta si de verdad se pierde trabajo: un aviso que salta sin riesgo
       enseña a ignorar la zona de avisos. */
    if (!lost) { dispatch({ type: 'layout', layoutId }); return; }
    const keptTxt = kept === 0 ? 'No se conservará ninguna foto'
      : kept === 1 ? 'Se conservará la primera foto'
        : `Se conservarán las ${kept} primeras`;
    setAsk({
      title: '¿Cambiar de layout?',
      body: `Este layout tiene ${holes === 1 ? '1 hueco' : `${holes} huecos`}. `
        + `${keptTxt} y se ${lost === 1 ? 'quitará 1' : `quitarán ${lost}`}.`,
      ok: 'Cambiar y quitar',
      onOk: () => dispatch({ type: 'layout', layoutId }),
    });
  };

  const runExport = async () => {
    try {
      setBusy('Exportando…');
      const out = await exportPost({
        post, cells, images,
        onProgress: (i, n, v) => setBusy(
          v ? `Exportando vídeo ${i}/${n} · ${Math.round((v.frame / v.frames) * 100)}%`
            : `Exportando ${i}/${n}…`,
        ),
      });
      setZip(null);
      setShots(out);
    } catch (e) {
      setErr('Falló el export: ' + (e?.message || e));
    } finally {
      setBusy(null);
    }
  };

  const runZip = async () => {
    if (!shots) return;
    try {
      setZipping(0);
      const name = safeName(projectName) + '-' + post.slides.length + 'p';
      setZip(await zipShots(shots, name, setZipping));
    } catch (e) {
      setErr('No se pudo empaquetar: ' + (e?.message || e));
    } finally {
      setZipping(null);
    }
  };

  const closeExport = () => {
    /* Los blobs se liberan a mano: si no, se quedan vivos hasta recargar y con PNG
       son varios megas por pagina. */
    shots?.forEach((sh) => { if (sh.url.startsWith('blob:')) URL.revokeObjectURL(sh.url); });
    if (zip?.url) URL.revokeObjectURL(zip.url);
    setShots(null);
    setZip(null);
  };

  /* Feedback por mailto SIN destinatario fijo: abre el correo con asunto y cuerpo
     rellenos y tú eliges a quién enviarlo. Así no hay ninguna dirección escrita en el
     código (el repo es público). Sin servidor, nada sale del dispositivo salvo lo que
     tú escribas y envíes. */
  const sendFeedback = () => {
    const subject = encodeURIComponent(`Maqueta v${VERSION} — comentario`);
    const body = encodeURIComponent(`\n\n———\nMaqueta v${VERSION}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const offProfile = Object.values(images).filter((im) => !im.converted && OFF_PROFILE.includes(im.cs));
  const docLevel = mode === 'edit' || mode === 'feed' || mode === 'grid';
  const projectName = projects.projects.find((p) => p.id === projects.projectId)?.name;

  const dupInfo = (image) => {
    const g = dup.groups.find((x) => x.key === image.key);
    const pages = g?.pages || [];
    const donde = pages.length === 1
      ? `dos veces en la página ${pages[0]}`
      : `en las páginas ${pages.slice(0, -1).join(', ')} y ${pages[pages.length - 1]}`;
    say(`La misma foto está ${donde}.`, 'dup');
  };

  return (
    <AppShell
      onMenu={() => setNavOpen(true)}
      fullscreen={fullscreen.active}
      onFullscreen={fullscreen.toggle}
      meta={docLevel && (!projects.projectId
        ? 'ningún proyecto abierto'
        : `${projectName ? `${projectName} · ` : ''}${post.slides.length}`
          + `${post.slides.length >= MAX_SLIDES - 4 ? `/${MAX_SLIDES}` : ''} `
          + `${post.slides.length === 1 ? 'página' : 'páginas'} · ${exSize.w}×${exSize.h}`)}
      docBar={docLevel && (
        <>
          <SegmentedControl
            value={mode}
            onChange={(v) => dispatch({ type: 'set', patch: { mode: v } })}
            options={isStories
              ? [
                { value: 'edit', label: 'Editar' },
                { value: 'feed', label: 'Stories' },
              ]
              : [
                { value: 'edit', label: 'Editar' },
                { value: 'feed', label: 'Feed' },
                { value: 'grid', label: 'Perfil' },
              ]}
          />
          <span style={{ flex: 1 }} />
          <Button
            variant="icon" title="Deshacer"
            disabled={!history.length || !projects.projectId}
            onClick={() => dispatch({ type: 'undo' })}
          >
            <Icon.undo />
          </Button>
          <Button variant="primary" disabled={!!busy || !projects.projectId} onClick={runExport}>
            Exportar
          </Button>
        </>
      )}
      notices={(
        <>
          {err && <Notice tone="danger" onClose={() => setErr(null)}>{err}</Notice>}
          {offProfile.length > 0 && (
            <Notice
              tone="warn"
              actionLabel="Convertir"
              onAction={() => library.convertToSRGB(offProfile)}
            >
              {offProfile.length} {offProfile.length === 1 ? 'foto no está' : 'fotos no están'} en sRGB
              {' '}({[...new Set(offProfile.map((i) => CS_LABEL[i.cs]))].join(', ')}).
              Instagram asume sRGB, así que los colores saldrán distintos a lo que ves aquí.
            </Notice>
          )}
        </>
      )}
    >
      {mode === 'edit' && (
        <main>
          <StageWrap innerRef={wrapRef}>
            {level === 'post' ? (
              <PostRail
                post={post} cells={cells} current={current} tool={tool}
                areaH={metrics.areaH} getSource={getSource}
                enter={prevLevel.current === 'page'}
                onSelect={(i) => dispatch({ type: 'goPage', i })}
                onOpen={(i) => {
                  arm();
                  dispatch({ type: 'set', patch: { current: i, level: 'page', sel: null, tool: null } });
                }}
                onMove={(from, to) => dispatch({ type: 'moveSlide', from, to })}
                onDuplicate={() => dispatch({ type: 'duplicateSlide' })}
                onDelete={(i) => setAsk({
                  title: `¿Borrar la página ${i + 1}?`,
                  body: 'Se quitará del post. Puedes deshacerlo después.',
                  ok: 'Borrar',
                  onOk: () => dispatch({ type: 'removeSlide', i }),
                })}
                onAdd={() => { arm(); dispatch({ type: 'addSlide' }); }}
                onLimit={() => say(`Instagram admite ${MAX_SLIDES} páginas como máximo en un carrusel.`, 'warn')}
              />
            ) : (
              <PageStrip
                post={post} cells={cells} current={current} level={level} tool={tool}
                images={images} sel={sel} textSel={textSel} enter={prevLevel.current === 'post'}
                dropIdx={dropIdx} liftIdx={liftIdx} dupKeys={dup.keys}
                showThirds={showThirds} metrics={metrics} guardRef={guardRef} areaW={wrapW} workH={workH}
                onSelect={(cellIndex) => dispatch({ type: 'select', sel: { slideIndex: current, cellIndex } })}
                onOpen={(cellIndex) => dispatch({
                  type: 'set',
                  patch: { level: 'photo', tool: null, sel: { slideIndex: current, cellIndex } },
                })}
                onFiles={(files, cellIndex) => library.ingest(files, current, cellIndex)}
                onTransform={(cellIndex, t, withHistory) => dispatch({
                  type: 'patchCell', slideIndex: current, cellIndex, patch: { t }, history: withHistory,
                })}
                onDupInfo={dupInfo}
                onCenter={(i) => dispatch({ type: 'goPage', i })}
                onAdd={() => dispatch({ type: 'addSlide' })}
                onLimit={() => say(`Instagram admite ${MAX_SLIDES} páginas como máximo en un carrusel.`, 'warn')}
                onSwapStart={(i) => {
                  swapFrom.current = i;
                  setLiftIdx(i);
                  dispatch({ type: 'select', sel: { slideIndex: current, cellIndex: i } });
                }}
                onSwapOver={onSwapOver}
                onSwapEnd={onSwapEnd}
                onSelectText={(slideIndex, id) => dispatch({ type: 'selectText', slideIndex, id })}
                onMoveText={(slideIndex, id, x, y, commit) => dispatch({
                  type: 'patchText', slideIndex, id, patch: { x, y }, history: commit,
                })}
                onExitFocus={() => dispatch({ type: 'level', level: 'page' })}
              />
            )}
          </StageWrap>

          <PageBar
            current={current}
            total={post.slides.length}
            onPrev={() => dispatch({ type: 'goPage', i: current - 1 })}
            onNext={() => dispatch({ type: 'goPage', i: current + 1 })}
          />

          <LevelPanel
            level={level}
            current={current}
            onGo={(v) => dispatch({ type: 'level', level: v })}
          >
            {level === 'post' && (
              <PostPanel
                post={post} current={current} tool={tool} customBg={customBg}
                onTool={(t) => dispatch({ type: 'tool', tool: t })}
                onBack={() => dispatch({ type: 'tool', tool: null })}
                onSetting={(patch) => dispatch({ type: 'postSetting', patch })}
                onGap={(gap) => dispatch({ type: 'gap', gap })}
                onGapStart={() => dispatch({ type: 'pushHistory' })}
                onCustomBg={setCustomBg}
                onMove={(from, to) => dispatch({ type: 'moveSlide', from, to })}
                onJpgBlocked={() => say('Con fondo transparente hace falta PNG: JPG no guarda transparencia.', 'warn')}
              />
            )}
            {level === 'page' && (
              <PagePanel
                slide={slide} current={current} totalPages={post.slides.length}
                photoCount={slide.cells.filter((c) => c.imgId).length}
                tool={tool} ratio={post.ratio}
                onTool={(t) => dispatch({ type: 'tool', tool: t })}
                onBack={() => dispatch({ type: 'tool', tool: null })}
                onAddText={() => dispatch({ type: 'addText', slideIndex: current, text: newText() })}
                onLayout={chooseLayout}
                onNeedTwo={() => say('Hacen falta al menos dos fotos en la página para intercambiarlas.', 'warn')}
                onDelete={() => setAsk({
                  title: `¿Borrar la página ${current + 1}?`,
                  body: 'Se quitará del post. Puedes deshacerlo después.',
                  ok: 'Borrar',
                  onOk: () => dispatch({ type: 'removeSlide', i: current }),
                })}
              />
            )}
            {level === 'text' && selText && (
              <TextPanel
                text={selText}
                tool={tool}
                onTool={(t) => dispatch({ type: 'tool', tool: t })}
                onPatch={(patch, withHistory) => dispatch({
                  type: 'patchText', slideIndex: textSel.slideIndex, id: textSel.id, patch, history: withHistory,
                })}
                onReorder={(dir) => dispatch({
                  type: 'reorderText', slideIndex: textSel.slideIndex, id: textSel.id, dir,
                })}
                onRemove={() => dispatch({ type: 'removeText', slideIndex: textSel.slideIndex, id: textSel.id })}
              />
            )}
            {level === 'photo' && selImage && (
              <PhotoPanel
                image={selImage} tool={tool} showThirds={showThirds}
                trim={post.slides[sel.slideIndex]?.cells[sel.cellIndex]?.trim}
                onTool={(t) => dispatch({ type: 'tool', tool: t })}
                onBack={() => dispatch({ type: 'tool', tool: null })}
                onAudio={() => say('Esta versión todavía no admite audio: el vídeo se exporta sin sonido.', 'warn')}
                onTrim={(trim) => dispatch({
                  type: 'patchCell', slideIndex: sel.slideIndex, cellIndex: sel.cellIndex,
                  patch: { trim }, history: false,
                })}
                onRotate={(deg) => library.reorient(selImage.id, ((deg % 360) + 360) % 360, !!selImage.flip)}
                onMirror={() => library.reorient(selImage.id, selImage.rot || 0, !selImage.flip)}
                onThirds={() => setShowThirds((v) => !v)}
                onCenter={() => dispatch({
                  type: 'patchCell', slideIndex: sel.slideIndex, cellIndex: sel.cellIndex,
                  patch: { t: newT() }, history: true,
                })}
                onReplace={(files) => library.ingest(files, sel.slideIndex, sel.cellIndex)}
                onRemove={() => dispatch({
                  type: 'patchCell', slideIndex: sel.slideIndex, cellIndex: sel.cellIndex,
                  patch: { imgId: null, t: newT() }, history: true,
                })}
                onNudge={(dx, dy) => {
                  if (!selCell || !selImage) return;
                  const t = selCell.t;
                  const next = clampT(
                    { scale: t.scale, fx: t.fx + dx, fy: t.fy + dy },
                    selCell.cellAspect, selImage.w / selImage.h,
                  );
                  dispatch({
                    type: 'patchCell', slideIndex: sel.slideIndex, cellIndex: sel.cellIndex,
                    patch: { t: next }, history: true,
                  });
                }}
              />
            )}
          </LevelPanel>
        </main>
      )}

      {mode === 'feed' && (
        <Section>
          {isStories
            ? <StoriesView post={post} cells={cells} getSource={getSource} />
            : <FeedView post={post} cells={cells} getSource={getSource} />}
        </Section>
      )}

      {mode === 'grid' && !isStories && (
        <Section><ProfileGrid post={post} cells={cells} getSource={getSource} /></Section>
      )}

      {mode === 'projects' && (
        <Section>
          <ProjectsView
            projects={projects.projects}
            estimate={estimate}
            onMeasure={projects.measureMissing}
            onOpen={async (id) => {
              if (id === projects.projectId) {
                dispatch({ type: 'set', patch: { mode: 'edit' } });
                return;
              }
              await projects.save();
              if (await projects.open(id)) dispatch({ type: 'set', patch: { mode: 'edit' } });
            }}
            onNew={async () => {
              await projects.save();
              const { id, doc } = await projects.create();
              projects.setProjectId(id);
              dispatch({ type: 'loadPost', post: doc, images: {}, current: 0 });
              dispatch({ type: 'set', patch: { mode: 'edit' } });
            }}
            onRename={projects.rename}
            onDuplicate={async (id) => {
              await projects.duplicate(id);
              dispatch({ type: 'set', patch: { mode: 'edit' } });
            }}
            onDelete={(id, name) => setAsk({
              title: '¿Borrar el proyecto?',
              body: `"${name}" y sus fotos se borrarán de este dispositivo. No se puede deshacer.`,
              ok: 'Borrar',
              onOk: () => projects.remove(id),
            })}
          />
        </Section>
      )}

      {mode === 'library' && (
        <Section>
          <LibraryView
            projects={projects.projects}
            estimate={estimate}
            onAsk={setAsk}
            say={say}
          />
        </Section>
      )}

      {shots && (
        <ExportSheet
          shots={shots}
          zip={zip}
          zipping={zipping}
          width={exSize.w}
          height={exSize.h}
          format={post.bg === 'transparent' ? 'png' : post.fmt}
          stories={isStories}
          onZip={runZip}
          onClose={closeExport}
        />
      )}

      <NavDrawer
        open={navOpen}
        onClose={() => setNavOpen(false)}
        footer={`Maqueta v${VERSION} · todo en tu dispositivo`}
        items={[
          { type: 'caption', key: 'c-work', label: 'Trabajo' },
          {
            key: 'projects',
            icon: <Icon.folder />,
            label: 'Proyectos',
            sub: 'abrir o crear',
            active: mode === 'projects',
            onClick: () => dispatch({ type: 'set', patch: { mode: 'projects', sel: null } }),
          },
          {
            key: 'library',
            icon: <Icon.library />,
            label: 'Biblioteca',
            sub: 'archivos y espacio',
            active: mode === 'library',
            onClick: () => dispatch({ type: 'set', patch: { mode: 'library', sel: null } }),
          },
          { type: 'caption', key: 'c-help', label: 'Ayuda' },
          {
            key: 'feedback',
            icon: <Icon.mail />,
            label: 'Comentarios',
            sub: 'por correo (tú eliges a quién)',
            onClick: sendFeedback,
          },
        ]}
      />

      <Busy label={busy} />
      <Toast toast={toast} duration={TOAST_MS} onDone={clear} />
      <Dialog ask={ask} onClose={() => setAsk(null)} />
    </AppShell>
  );
}

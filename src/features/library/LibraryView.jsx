import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { weight } from '../../core/format.js';
import * as db from '../../core/db.js';
import { Button, SegmentedControl, Caption, Hint } from '../../ui/primitives/index.js';
import { Icon } from '../../ui/icons.jsx';
import { loadLibrary, SORTS } from './loadLibrary.js';
import s from './LibraryView.module.css';

const stamp = (t) => {
  if (!t) return 'sin usar';
  const d = new Date(t);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' });
};

/** Object URL del blob, creado una vez y liberado al desmontar (no copia el fichero). */
function useBlobUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}

/** Fila con miniatura (póster en vídeos). Al tocar la miniatura se abre el visor. */
function LibraryRow({ f, onOpen, onDelete }) {
  const url = useBlobUrl(f.file);
  return (
    <div className={[s.row, f.uses === 0 && s.orphan].filter(Boolean).join(' ')}>
      <button type="button" className={s.thumb} onClick={() => url && onOpen(f)} title="Ver">
        {url && f.type === 'video' && (
          <>
            <video src={url} muted playsInline preload="metadata" />
            <span className={s.play}><Icon.play /></span>
          </>
        )}
        {url && f.type !== 'video' && <img src={url} alt="" />}
      </button>
      <div className={s.info}>
        <span className={s.name}>{f.name}</span>
        <span className={s.meta}>
          {weight(f.size)} · {f.uses === 0 ? 'sin usar' : `en ${f.projects} ${f.projects === 1 ? 'proyecto' : 'proyectos'}`}
          {f.uses > 0 && ` · ${stamp(f.lastUsed)}`}
        </span>
      </div>
      <Button onClick={onDelete} className={s.del}>borrar</Button>
    </div>
  );
}

/** Visor a pantalla: la foto entera o el vídeo con controles (para revisarlo). */
function Viewer({ file, onClose }) {
  const url = useBlobUrl(file?.file);
  if (!file) return null;
  return (
    <div className={s.viewer} onClick={onClose}>
      <button type="button" className={s.viewerClose} title="Cerrar"><Icon.close /></button>
      <div className={s.viewerBody} onClick={(e) => e.stopPropagation()}>
        {file.type === 'video'
          ? <video src={url} controls playsInline autoPlay className={s.viewerMedia} />
          : <img src={url} alt="" className={s.viewerMedia} />}
        <p className={s.viewerMeta}>{file.name} · {weight(file.size)}</p>
      </div>
    </div>
  );
}

/**
 * Biblioteca: TODO lo que ocupa espacio (fotos y vídeos), con su peso, en qué se usa
 * y cuándo se usó por última vez. Sirve para gestionar la memoria: una barra reparte
 * el espacio entre fotos y vídeos, y se puede ordenar por peso, uso o recencia y
 * borrar lo que no usa ningún proyecto.
 */
export default function LibraryView({ projects, estimate, onAsk, say }) {
  const [data, setData] = useState(null);
  const [sort, setSort] = useState('size');
  const [view, setView] = useState(null); // fichero abierto en el visor

  /* El autoguardado renueva la identidad del array `projects` cada pocos cientos de
     ms; si el reload dependiera de él, la lista parpadearía. Se lee por ref y se carga
     una sola vez (y a mano tras borrar): mientras estás en la Biblioteca el conjunto
     de proyectos no cambia. */
  const projectsRef = useRef(projects);
  projectsRef.current = projects;

  const reload = useCallback(() => loadLibrary(projectsRef.current).then(setData), []);

  useEffect(() => { reload(); }, [reload]);

  const del = (f) => {
    const inUse = f.uses > 0;
    onAsk({
      title: `¿Borrar este ${f.type === 'video' ? 'vídeo' : 'archivo'}?`,
      body: inUse
        ? `Se usa en ${f.projects} ${f.projects === 1 ? 'proyecto' : 'proyectos'}: se quedará un hueco vacío ahí. Libera ${weight(f.size)}.`
        : `No lo usa ningún proyecto. Libera ${weight(f.size)}.`,
      ok: 'Borrar',
      onOk: async () => {
        await db.idbDel('files', f.id);
        say(`Borrado · ${weight(f.size)} liberados`, 'dup');
        reload();
      },
    });
  };

  const sweep = () => {
    const n = data?.totals.unused || 0;
    if (!n) { say('No hay archivos sin usar.', 'warn'); return; }
    onAsk({
      title: `¿Borrar ${n} ${n === 1 ? 'archivo' : 'archivos'} sin usar?`,
      body: 'Se quitan del dispositivo los que no usa ningún proyecto. Puedes volver a añadirlos importándolos otra vez.',
      ok: 'Borrar no usados',
      onOk: async () => {
        const gone = await db.sweepFiles(projectsRef.current);
        say(`${gone.length} ${gone.length === 1 ? 'archivo borrado' : 'archivos borrados'}`, 'dup');
        reload();
      },
    });
  };

  const t = data?.totals;
  const files = data ? data.files.slice().sort(SORTS[sort]) : [];
  const pct = (n) => (t && t.total ? `${(n / t.total) * 100}%` : '0%');

  return (
    <>
      <Caption>Biblioteca</Caption>

      {t && t.count > 0 && (
        <div className={s.summary}>
          <div className={s.bar}>
            <span className={s.segPhoto} style={{ width: pct(t.photos) }} />
            <span className={s.segVideo} style={{ width: pct(t.videos) }} />
          </div>
          <div className={s.legend}>
            <span><i className={s.dotPhoto} /> Fotos · {weight(t.photos)}</span>
            <span><i className={s.dotVideo} /> Vídeos · {weight(t.videos)}</span>
          </div>
          <p className={s.total}>
            {t.count} {t.count === 1 ? 'archivo' : 'archivos'} · <strong>{weight(t.total)}</strong> usados
            {estimate?.quota ? ` · el navegador te deja hasta ~${weight(estimate.quota)}` : ''}
          </p>
        </div>
      )}

      {t && t.count > 0 && (
        <div className={s.controls}>
          <SegmentedControl
            value={sort}
            onChange={setSort}
            options={[
              { value: 'size', label: 'peso' },
              { value: 'uses', label: 'uso' },
              { value: 'recent', label: 'recientes' },
            ]}
          />
          <Button onClick={sweep} disabled={!t.unused} className={s.sweep}>
            {t.unused ? `borrar ${t.unused} sin usar` : 'sin huérfanos'}
          </Button>
        </div>
      )}

      <div className={s.list}>
        {!data && <p className={s.lead}>Cargando…</p>}
        {data && !t.count && (
          <p className={s.lead}>No hay archivos todavía. Al montar un carrusel aparecerán aquí.</p>
        )}
        {files.map((f) => (
          <LibraryRow key={f.id} f={f} onOpen={setView} onDelete={() => del(f)} />
        ))}
      </div>

      <div className={s.spacer} />
      <Hint className={s.foot}>
        Todo vive en tu dispositivo. Si borras un archivo que usa un proyecto, ahí quedará
        un hueco (lo puedes volver a poner importándolo).
      </Hint>

      <Viewer file={view} onClose={() => setView(null)} />
    </>
  );
}

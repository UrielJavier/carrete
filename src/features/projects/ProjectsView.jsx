import React, { useEffect } from 'react';
import { weight } from '../../core/format.js';
import { Button, Caption, Hint } from '../../ui/primitives/index.js';
import s from './ProjectsView.module.css';

const stamp = (t) => {
  if (!t) return '';
  const d = new Date(t);
  return ` · ${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} `
    + `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * Todas las filas tienen boton de abrir, tambien la del ultimo proyecto editado.
 * Que ese ya este cargado en memoria es asunto nuestro: por dentro no se relee
 * nada, pero desde fuera los dos botones se comportan igual.
 */
export default function ProjectsView({
  projects, estimate, onMeasure, onOpen, onNew, onRename, onDuplicate, onDelete,
}) {
  /* Los proyectos guardados antes de que el indice trajera la medida se miden al
     entrar aqui, no al arrancar: leer los ficheros de todos costaria en el arranque
     y aqui es justo cuando el dato hace falta. */
  useEffect(() => { onMeasure?.(); }, [onMeasure]);

  const sorted = projects.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0));
  const suma = sorted.reduce((a, p) => a + (p.bytes || 0), 0);

  return (
    <>
      <div className={s.bar}>
        <Caption>Proyectos</Caption>
        <Button onClick={onNew}>nuevo proyecto</Button>
      </div>

      {!!sorted.length && (
        <p className={s.total}>
          {sorted.length} {sorted.length === 1 ? 'proyecto' : 'proyectos'} · {weight(suma)}
          {estimate?.usage != null && ` · el navegador tiene reservados ${weight(estimate.usage)}`}
          {estimate?.quota ? ` de ${weight(estimate.quota)}` : ''}
        </p>
      )}

      <div className={s.list}>
        {!sorted.length && (
          <p className={s.lead}>
            No hay ningún proyecto. Crea uno para empezar a montar un carrusel.
          </p>
        )}
        {sorted.map((p) => (
          <div key={p.id} className={s.row}>
            <div className={s.top}>
              <input
                className={s.name}
                defaultValue={p.name || 'Sin título'}
                onChange={(e) => onRename(p.id, e.target.value.trim())}
              />
              {p.bytes != null && <span className={s.size}>{weight(p.bytes)}</span>}
            </div>
            <p className={s.sub}>
              {p.pages || 1} {p.pages === 1 ? 'página' : 'páginas'} · {p.ratio || '4:5'}
              {p.photos != null && ` · ${p.photos} ${p.photos === 1 ? 'foto' : 'fotos'}`}
              {stamp(p.updated)}
            </p>
            <div className={s.acts}>
              <Button on onClick={() => onOpen(p.id)}>abrir</Button>
              <Button onClick={() => onDuplicate(p.id)}>duplicar</Button>
              <Button onClick={() => onDelete(p.id, p.name || 'Sin título')}>borrar</Button>
            </div>
          </div>
        ))}
      </div>

      {sorted.length > 1 && (
        <Hint className={s.foot}>
          Las fotos se guardan una sola vez, pero si la misma está en dos proyectos
          cuenta en los dos: la suma puede ser mayor que el espacio real.
        </Hint>
      )}
    </>
  );
}

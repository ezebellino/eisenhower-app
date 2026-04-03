import React from "react";
import { Link } from "react-router-dom";
import Card from "./Card";
import type { Task, TaskID } from "../types/tasks";
import "../../styles/EisenhowerMatrix.css";

type Props = {
  title?: string;
  description?: string;
  banner?: React.ReactNode;
  toolbar?: React.ReactNode;
  resolveAssigneeLabel?: (task: Task) => string | null;
  tasks: Task[];
  mode?: "active" | "completed";
  onComplete?: (id: TaskID) => Promise<void> | void;
  onDelete: (id: TaskID) => Promise<void> | void;
  onUncomplete?: (id: TaskID) => Promise<void> | void;
  onDuplicate?: (task: Task) => Promise<void> | void;
  indexQ1: number;
  indexQ2: number;
  indexQ3: number;
  indexQ4: number;
  setIndexQ1: React.Dispatch<React.SetStateAction<number>>;
  setIndexQ2: React.Dispatch<React.SetStateAction<number>>;
  setIndexQ3: React.Dispatch<React.SetStateAction<number>>;
  setIndexQ4: React.Dispatch<React.SetStateAction<number>>;
};

type QuadrantMeta = {
  className: string;
  heading: string;
  summary: string;
  emptyHint: string;
};

const quadrantMeta: Record<1 | 2 | 3 | 4, QuadrantMeta> = {
  1: {
    className: "q1",
    heading: "Urgente e importante",
    summary: "Lo que requiere atencion inmediata y tiene impacto real.",
    emptyHint: "Ideal para tareas criticas que no pueden esperar.",
  },
  2: {
    className: "q2",
    heading: "Importante, no urgente",
    summary: "Espacio para planificar con criterio y proteger foco.",
    emptyHint: "Este cuadrante suele contener trabajo valioso a mediano plazo.",
  },
  3: {
    className: "q3",
    heading: "Urgente, no importante",
    summary: "Interrupciones que conviene delegar o resolver rapido.",
    emptyHint: "Buen lugar para pendientes reactivos o tareas operativas.",
  },
  4: {
    className: "q4",
    heading: "Ni urgente ni importante",
    summary: "Tareas que pueden esperar, simplificarse o descartarse.",
    emptyHint: "Si se acumula mucho aca, conviene revisar prioridades.",
  },
};

function pickTask(arr: Task[], index: number): Task | null {
  if (arr.length === 0) return null;
  const normalized = ((index % arr.length) + arr.length) % arr.length;
  return arr[normalized];
}

function getPosition(total: number, index: number) {
  if (total <= 0) return { current: 0, total: 0 };
  const current = ((index % total) + total) % total;
  return { current: current + 1, total };
}

function EmptyCollectionState({ mode }: { mode: "active" | "completed" }) {
  if (mode === "completed") {
    return (
      <div className="matrix-empty-state panel">
        <div className="matrix-empty-state__copy">
          <p className="matrix-empty-state__eyebrow">Historial vacio</p>
          <h2>Todavia no terminaste ninguna tarea.</h2>
          <p>
            Cuando marques tareas como completadas, van a aparecer aca para que puedas revisar lo
            que ya resolviste o reabrir algo si hace falta.
          </p>
        </div>

        <div className="matrix-empty-state__actions">
          <Link to="/tasks" className="btn-primary">
            Ir al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="matrix-empty-state panel">
      <div className="matrix-empty-state__copy">
        <p className="matrix-empty-state__eyebrow">Primer paso</p>
        <h2>Empeza cargando tu primera tarea.</h2>
        <p>
          Elegi si es urgente y si es importante. La matriz la va a ubicar automaticamente en el
          cuadrante correcto para que tengas claridad desde el inicio.
        </p>
      </div>

      <div className="matrix-empty-state__actions">
        <Link to="/tasks/create" className="btn-primary">
          Crear primera tarea
        </Link>
        <Link to="/" className="btn-ghost">
          Ver metodo Eisenhower
        </Link>
      </div>
    </div>
  );
}

export default function EisenhowerMatrix({
  title,
  description,
  banner,
  toolbar,
  resolveAssigneeLabel,
  tasks,
  mode = "active",
  onComplete,
  onDelete,
  onUncomplete,
  onDuplicate,
  indexQ1,
  indexQ2,
  indexQ3,
  indexQ4,
  setIndexQ1,
  setIndexQ2,
  setIndexQ3,
  setIndexQ4,
}: Props) {
  const filtered =
    mode === "completed"
      ? tasks.filter((task) => task.status === "completed")
      : tasks.filter((task) => task.status === "active");

  const q1 = filtered.filter((task) => task.quadrant === 1);
  const q2 = filtered.filter((task) => task.quadrant === 2);
  const q3 = filtered.filter((task) => task.quadrant === 3);
  const q4 = filtered.filter((task) => task.quadrant === 4);
  const total = filtered.length;
  const showOnlyCompletedActions = mode === "completed";

  const stats = [
    { label: "Total", value: total.toString() },
    { label: "Q1", value: q1.length.toString() },
    { label: "Q2", value: q2.length.toString() },
    { label: "Q3", value: q3.length.toString() },
    { label: "Q4", value: q4.length.toString() },
  ];

  const panels = [
    { quadrant: 1 as const, tasksArr: q1, selected: pickTask(q1, indexQ1), index: indexQ1, setIndex: setIndexQ1 },
    { quadrant: 2 as const, tasksArr: q2, selected: pickTask(q2, indexQ2), index: indexQ2, setIndex: setIndexQ2 },
    { quadrant: 3 as const, tasksArr: q3, selected: pickTask(q3, indexQ3), index: indexQ3, setIndex: setIndexQ3 },
    { quadrant: 4 as const, tasksArr: q4, selected: pickTask(q4, indexQ4), index: indexQ4, setIndex: setIndexQ4 },
  ];

  return (
    <section className="matrix-page">
      {(title || description || stats.length > 0) && (
        <div className="matrix-shell panel">
          <div className="matrix-shell__header">
            <div className="matrix-shell__copy">
              {title && <h1 className="page-title">{title}</h1>}
              {description && <p className="matrix-shell__description">{description}</p>}
            </div>

            <div className="matrix-shell__stats" aria-label="Resumen de la matriz">
              {stats.map((stat) => (
                <div key={stat.label} className="matrix-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {banner && <div className="matrix-banner">{banner}</div>}
          {toolbar && <div className="matrix-toolbar">{toolbar}</div>}
        </div>
      )}

      {total === 0 ? (
        <EmptyCollectionState mode={mode} />
      ) : (
        <div className={`matrix ${mode === "completed" ? "matrix--completed" : ""}`}>
          {panels.map(({ quadrant, tasksArr, selected, setIndex, index }) => {
            const meta = quadrantMeta[quadrant];
            const pos = getPosition(tasksArr.length, index);
            const hasPagination = tasksArr.length > 1;

            return (
              <article key={quadrant} className={`panel matrix-panel ${meta.className}`}>
                <div className="matrix-panel__header">
                  <div>
                    <p className="matrix-panel__eyebrow">Cuadrante {quadrant}</p>
                    <h2>{meta.heading}</h2>
                  </div>
                  <span className="matrix-panel__count">{tasksArr.length}</span>
                </div>

                <p className="matrix-panel__summary">{meta.summary}</p>

                {pos.total > 0 && (
                  <p className="matrix-panel__position">
                    Tarea {pos.current} de {pos.total}
                  </p>
                )}

                {!selected ? (
                  <div className="panel-empty">
                    <strong>Este cuadrante esta libre.</strong>
                    <p>{meta.emptyHint}</p>
                  </div>
                ) : (
                  <>
                    <Card
                      key={String(selected.id)}
                      task={selected}
                      assignmentLabel={resolveAssigneeLabel?.(selected) ?? null}
                      onComplete={onComplete}
                      onDelete={onDelete}
                      onUncomplete={onUncomplete}
                      onDuplicate={onDuplicate}
                      showOnlyCompletedActions={showOnlyCompletedActions}
                    />

                    {hasPagination && (
                      <div className="arrow-controls">
                        <button
                          type="button"
                          onClick={() =>
                            setIndex((prev) => (prev > 0 ? prev - 1 : tasksArr.length - 1))
                          }
                        >
                          Anterior
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setIndex((prev) => (prev < tasksArr.length - 1 ? prev + 1 : 0))
                          }
                        >
                          Siguiente
                        </button>
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

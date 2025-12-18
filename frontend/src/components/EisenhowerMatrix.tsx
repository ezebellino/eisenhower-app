import Card from "./Card";
import type { Task, TaskID } from "../types/tasks";

type Props = {
  title?: string;
  tasks: Task[];
  mode?: "active" | "completed";
  onComplete?: (id: TaskID) => Promise<void> | void;
  onDelete: (id: TaskID) => Promise<void> | void;
  onUncomplete?: (id: TaskID) => Promise<void> | void;

  // Para tu UX de “flechas” (una card por cuadrante)
  indexQ1: number;
  indexQ2: number;
  indexQ3: number;
  indexQ4: number;
  setIndexQ1: React.Dispatch<React.SetStateAction<number>>;
  setIndexQ2: React.Dispatch<React.SetStateAction<number>>;
  setIndexQ3: React.Dispatch<React.SetStateAction<number>>;
  setIndexQ4: React.Dispatch<React.SetStateAction<number>>;
};

function pickTask(arr: Task[], index: number): Task | null {
  if (arr.length === 0) return null;
  const normalized = ((index % arr.length) + arr.length) % arr.length;
  return arr[normalized];
}

function getPosition(len: number, index: number) {
  if (len <= 0) return { current: 0, total: 0 };
  const current = ((index % len) + len) % len;
  return { current: current + 1, total: len };
}


export default function EisenhowerMatrix({
  title,
  tasks,
  mode = "active",
  onComplete,
  onDelete,
  onUncomplete,
  indexQ1,
  indexQ2,
  indexQ3,
  indexQ4,
  setIndexQ1,
  setIndexQ2,
  setIndexQ3,
  setIndexQ4,
}: Props) {
  const filtered = mode === "completed"
    ? tasks.filter((t) => t.status === "completed")
    : tasks.filter((t) => t.status === "active");

  const q1 = filtered.filter((t) => t.quadrant === 1);
  const q2 = filtered.filter((t) => t.quadrant === 2);
  const q3 = filtered.filter((t) => t.quadrant === 3);
  const q4 = filtered.filter((t) => t.quadrant === 4);

  const t1 = pickTask(q1, indexQ1);
  const t2 = pickTask(q2, indexQ2);
  const t3 = pickTask(q3, indexQ3);
  const t4 = pickTask(q4, indexQ4);

  const showOnlyCompletedActions = mode === "completed";

  const Panel = ({
    className,
    heading,
    tasksArr,
    selected,
    setIndex,
    index,
  }: {
    className: string;
    heading: string;
    tasksArr: Task[];
    selected: Task | null;
    setIndex: React.Dispatch<React.SetStateAction<number>>;
    index: number;
  }) => {
    const pos = getPosition(tasksArr.length, index);
    const hasPagination = tasksArr.length > 1;

    return (
      <div className={`panel ${className}`}>
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>{heading}</h3>

        {pos.total > 0 && (
          <p className="subtle" style={{ textAlign: "center", margin: "0 0 10px 0" }}>
            {pos.current}/{pos.total}
          </p>
        )}

        {!selected ? (
          <p className="panel-empty">En este momento no hay tareas en este cuadrante</p>
        ) : (
          <>
            <Card
              key={String(selected.id)}
              task={selected}
              onComplete={onComplete}
              onDelete={onDelete}
              onUncomplete={onUncomplete}
              showOnlyCompletedActions={showOnlyCompletedActions}
              index={0}
            />

            {selected && hasPagination && (
              <div className="arrow-controls">
                <button
                  onClick={() => setIndex((prev) => (prev > 0 ? prev - 1 : tasksArr.length - 1))}
                >
                  ⬅️
                </button>
                <button
                  onClick={() => setIndex((prev) => (prev < tasksArr.length - 1 ? prev + 1 : 0))}
                >
                  ➡️
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  return (
    <>
      {title && <h1 className="page-title">{title}</h1>}

      <div className={`matrix ${mode === "completed" ? "matrix--completed" : ""}`}>
        <Panel
          className="q1"
          heading="🟥 Urgente e Importante"
          tasksArr={q1}
          selected={t1}
          setIndex={setIndexQ1}
          index={indexQ1}
        />
        <Panel
          className="q2"
          heading="🟧 Importante, NO urgente"
          tasksArr={q2}
          selected={t2}
          setIndex={setIndexQ2}
          index={indexQ2}
        />
        <Panel
          className="q3"
          heading="🟦 Urgente, NO importante"
          tasksArr={q3}
          selected={t3}
          setIndex={setIndexQ3}
          index={indexQ3}
        />
        <Panel
          className="q4"
          heading="🟩 Ni urgente ni importante"
          tasksArr={q4}
          selected={t4}
          setIndex={setIndexQ4}
          index={indexQ4}
        />
      </div>
    </>
  );
}

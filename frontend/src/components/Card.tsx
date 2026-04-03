import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Task, TaskID } from "../types/tasks";
import "../../styles/Card.css";

type Props = {
  task: Task;
  assignmentLabel?: string | null;
  onComplete?: (id: TaskID) => Promise<void> | void;
  onDelete: (id: TaskID) => Promise<void> | void;
  onUncomplete?: (id: TaskID) => Promise<void> | void;
  onDuplicate?: (task: Task) => Promise<void> | void;
  onReassign?: (task: Task) => Promise<void> | void;
  showOnlyCompletedActions?: boolean;
};

function quadrantLabel(quadrant: Task["quadrant"]) {
  switch (quadrant) {
    case 1:
      return "Urgente e importante";
    case 2:
      return "Importante, no urgente";
    case 3:
      return "Urgente, no importante";
    case 4:
      return "Ni urgente ni importante";
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Reciente";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatScheduleDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatScheduleTime(value: string | null | undefined) {
  if (!value) return null;
  return value.slice(0, 5);
}

function formatScheduleTimeRange(
  start: string | null | undefined,
  end: string | null | undefined
) {
  const formattedStart = formatScheduleTime(start);
  const formattedEnd = formatScheduleTime(end);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} a ${formattedEnd}`;
  }

  return formattedStart ?? formattedEnd ?? null;
}

function recurrenceLabel(value: Task["recurrence"]) {
  switch (value) {
    case "daily":
      return "Diaria";
    case "weekly":
      return "Semanal";
    case "monthly":
      return "Mensual";
    case "weekdays":
      return "Lun a vie";
    default:
      return null;
  }
}

function quadrantToneClass(quadrant: Task["quadrant"]) {
  switch (quadrant) {
    case 1:
      return "badge-q1";
    case 2:
      return "badge-q2";
    case 3:
      return "badge-q3";
    case 4:
      return "badge-q4";
  }
}

export default function Card({
  task,
  assignmentLabel,
  onComplete,
  onDelete,
  onUncomplete,
  onDuplicate,
  onReassign,
  showOnlyCompletedActions = false,
}: Props) {
  const isCompleted = task.status === "completed";

  return (
    <motion.article
      className="card-3d"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="card-topline">
        <span className="card-date">
          {isCompleted ? `Cerrada ${formatDate(task.updatedAt)}` : `Actualizada ${formatDate(task.updatedAt)}`}
        </span>
        <span className={`card-state ${isCompleted ? "is-success" : "is-pending"}`}>
          {isCompleted ? "Completada" : "Pendiente"}
        </span>
      </div>

      <div className="card-heading">
        <h3>{task.title}</h3>
        <p>{task.description || "Sin descripcion adicional."}</p>
      </div>

      <div className="card-meta">
        <span className={`badge badge-muted ${quadrantToneClass(task.quadrant)}`}>
          {quadrantLabel(task.quadrant)}
        </span>
        {task.is_important && <span className="badge">Impacto alto</span>}
        {task.is_urgent && <span className="badge">Atencion hoy</span>}
        {task.scheduled_for && (
          <span className="badge">Agenda {formatScheduleDate(task.scheduled_for)}</span>
        )}
        {formatScheduleTimeRange(task.scheduled_time, task.scheduled_time_end) && (
          <span className="badge">
            Hora {formatScheduleTimeRange(task.scheduled_time, task.scheduled_time_end)}
          </span>
        )}
        {task.recurrence && <span className="badge">Repite {recurrenceLabel(task.recurrence)}</span>}
        {task.exclude_holidays && <span className="badge">Salta feriados AR</span>}
      </div>

        {assignmentLabel && (
        <div className="card-assignment">
          <span className="card-assignment__label">
            {isCompleted ? "Ultimo responsable" : "Responsable actual"}
          </span>
          <strong>{assignmentLabel}</strong>
        </div>
      )}

      <div className="card-actions">
        {!isCompleted && !showOnlyCompletedActions && onComplete && (
          <button onClick={() => onComplete(task.id)} className="btn-completar" type="button">
            Enviar a Historial
          </button>
        )}

        {isCompleted && showOnlyCompletedActions && onUncomplete && (
          <button onClick={() => onUncomplete(task.id)} className="btn-revertir" type="button">
            Volver al Dashboard
          </button>
        )}

        {!showOnlyCompletedActions && (
          <Link to={`/tasks/${task.id}/edit`} className="btn-secondary card-link">
            Ajustar detalle
          </Link>
        )}

        {!showOnlyCompletedActions && onDuplicate && (
          <button onClick={() => onDuplicate(task)} className="btn-duplicate" type="button">
            Copiar para otros
          </button>
        )}

        {!showOnlyCompletedActions && onReassign && (
          <button onClick={() => onReassign(task)} className="btn-reassign" type="button">
            Cambiar responsable
          </button>
        )}

        <button onClick={() => onDelete(task.id)} className="btn-eliminar" type="button">
          {isCompleted ? "Quitar" : "Eliminar"}
        </button>
      </div>
    </motion.article>
  );
}

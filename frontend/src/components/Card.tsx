import { motion } from "framer-motion";
import "../../styles/Card.css";
import type { Task, TaskID } from "../types/tasks";

type Props = {
  task: Task;
  onComplete?: (id: TaskID) => Promise<void> | void;
  onDelete: (id: TaskID) => Promise<void> | void;
  onUncomplete?: (id: TaskID) => Promise<void> | void;
  showOnlyCompletedActions?: boolean;
  index?: number;
};

function quadrantLabel(q: Task["quadrant"]): string {
  switch (q) {
    case 1:
      return "🟥 Urgente e Importante";
    case 2:
      return "🟧 Importante, no urgente";
    case 3:
      return "🟦 Urgente, no importante";
    case 4:
      return "🟩 Ni urgente ni importante";
  }
}

export default function Card({
  task,
  onComplete,
  onDelete,
  onUncomplete,
  showOnlyCompletedActions = false,
  index = 0,
}: Props) {
  const offsetY = index * 10;
  const offsetX = index * 5;

  const isCompleted = task.status === "completed";

  return (
    <motion.div
      className={showOnlyCompletedActions ? "card-3d card-stack" : "card-3d"}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        zIndex: 100 - index,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}

      <p>
        <strong>Cuadrante:</strong> {quadrantLabel(task.quadrant)}
      </p>

      <p>
        <strong>Estado:</strong> {isCompleted ? "✔️ Completada" : "❌ Pendiente"}
      </p>

      {!isCompleted && !showOnlyCompletedActions && onComplete && (
        <button onClick={() => onComplete(task.id)} className="btn-completar">
          Marcar como completada
        </button>
      )}

      {isCompleted && showOnlyCompletedActions && onUncomplete && (
        <button onClick={() => onUncomplete(task.id)} className="btn-revertir">
          Ups! Debo actualizar la tarea
        </button>
      )}

      <button onClick={() => onDelete(task.id)} className="btn-eliminar">
        Eliminar
      </button>
    </motion.div>
  );
}

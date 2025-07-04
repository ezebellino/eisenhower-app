import { motion } from "framer-motion"
import "../../styles/Card.css"

function Card({ task, onComplete, onDelete, onUncomplete, showOnlyCompletedActions = false, index = 0 }) {
  const offsetY = index * 10; // Desplazamiento vertical para el efecto de pila
  const offsetX = index * 5; // Desplazamiento horizontal para el efecto de pila
  return (
    <motion.div
      className={showOnlyCompletedActions ? "card-3d card-stack" : "card-3d"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transform: `translate(${offsetX}px, ${offsetY}px)`, zIndex: 100-index }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p><strong>Urgente:</strong> {task.is_urgent ? "Sí" : "No"}</p>
      <p><strong>Importante:</strong> {task.is_important ? "Sí" : "No"}</p>
      <p><strong>Estado:</strong> {task.completed ? "✔️ Completada" : "❌ Pendiente"}</p>

      {!task.completed && !showOnlyCompletedActions && (
        <button
          onClick={() => onComplete(task.id)}
          className="btn-completar"
        >
          Marcar como completada
        </button>
      )}

      {task.completed && showOnlyCompletedActions && (
        <button
          onClick={() => onUncomplete(task.id)}
          className="btn-revertir"
        >
          Ups! Debo actualizar la tarea
        </button>
      )}

      {showOnlyCompletedActions && (
        <button
          onClick={() => onDelete(task.id)}
          className="btn-eliminar"
        >
          Eliminar
        </button>
      )}
    </motion.div>
  )
}

export default Card;

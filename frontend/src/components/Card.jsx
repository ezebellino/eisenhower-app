import { color, motion } from "framer-motion";

function Card({ task, onComplete, onDelete, onUncomplete, showOnlyCompletedActions = false }) {
  return (
    <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      width: "50%",
      maxWidth: "400px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "1rem",
      marginBottom: "1rem",
      backgroundColor: task.completed ? "#d1ffd1" : "#f5f5f5",
      boxShadow: "2px 2px 8px rgba(0,0,0,0.1)"
    }}
    >
      {/* Título y descripción de la tarea */}
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p><strong>Urgente:</strong> {task.is_urgent ? "Sí" : "No"}</p>
      <p><strong>Importante:</strong> {task.is_important ? "Sí" : "No"}</p>
      <p><strong>Estado:</strong> {task.completed ? "✔️ Completada" : "❌ Pendiente"}</p>

      {/* Botón para completar, solo si no está completada y NO estamos en vista de completadas */}
      {!task.completed && !showOnlyCompletedActions && (
        <button
          onClick={() => onComplete(task.id)}
          style={{ margin: "0.25rem", backgroundColor: "#0bda51", color: "white", borderRadius: "8px" }}
        >
          Marcar como completada
        </button>
      )}

      {/* Botón para revertir, solo en la vista de tareas completadas */}
      {task.completed && showOnlyCompletedActions && (
        <button
          onClick={() => onUncomplete(task.id)}
          style={{ margin: "0.5rem", padding: "0.5rem", backgroundColor: "orange", color: "white", fontSize: "1rem", fontWeight: "bold", borderRadius: "8px", cursor: "pointer", boxShadow: "2px 2px 8px rgba(0,0,0,0.1)", transition: "background-color 0.3s ease", ":hover": { backgroundColor: "#ff8c00", color: "black" } }}
        >
          Ups! Debo actualizar la tarea
        </button>
      )}

      {/* Botón eliminar (en ambas vistas si querés) */}
      {showOnlyCompletedActions && (
        <button
          onClick={() => onDelete(task.id)}
          style={{ margin: "0.5rem", padding: "0.5rem", backgroundColor: "red", color: "white", fontSize: "1rem", fontWeight: "bold", borderRadius: "8px", cursor: "pointer" }}
        >
          Eliminar
        </button>
      )}
    </motion.div>
  )
}

export default Card;


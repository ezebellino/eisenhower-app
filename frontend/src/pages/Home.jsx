import { useEffect, useState } from "react"
import Card from "../components/Card"
import { getAllTasks, completeTask, deleteTask, createTask, uncompleteTask } from "../services/taskServices"
import "../../styles/CompletedTasks.css" // Asegúrate de tener este archivo CSS

function Home() {
  const [tasks, setTasks] = useState([])

  const fetchTasks = () => {
    getAllTasks()
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error al obtener tareas:", err))
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleComplete = async (id) => {
    await completeTask(id)
    fetchTasks()
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    fetchTasks()
  }

  const handleCreate = async (task) => {
    await createTask(task)
    fetchTasks()
  }

  const handleUncomplete = async (id) => {
    await uncompleteTask(id)
    fetchTasks()
  }

  const cuadrante1 = tasks.filter(task => task.is_urgent && task.is_important)
  const cuadrante2 = tasks.filter(task => task.is_urgent && !task.is_important)
  const cuadrante3 = tasks.filter(task => !task.is_urgent && task.is_important)
  const cuadrante4 = tasks.filter(task => !task.is_urgent && !task.is_important)

  return (
    <div style={{ padding: "2rem", backgroundColor: "goldenrod", color: "Black" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem", fontSize: "2.5rem", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>Matriz de Eisenhower 🧠</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "1.5rem"
      }}>
        {/* Cuadrante 1 */}
        <div className="cuadrante1">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟥 Urgente e Importante</h3>
          {cuadrante1.length === 0 ? <p>En este momento no hay tareas en este cuadrante</p> :
            cuadrante1.map(task => (
              <Card key={task.id} task={task} onComplete={() => handleComplete(task.id)} onDelete={() => handleDelete(task.id)} onUncomplete={() => handleUncomplete(task.id)} />
            ))}
        </div>

        {/* Cuadrante 2 */}
        <div className="cuadrante2">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟧 Urgente pero NO importante</h3>
          {cuadrante2.length === 0 ? <p>En este momento no hay tareas en este cuadrante</p> :
            cuadrante2.map(task => (
              <Card key={task.id} task={task} onComplete={() => handleComplete(task.id)} onDelete={() => handleDelete(task.id)} onUncomplete={() => handleUncomplete(task.id)} />
            ))}
        </div>

        {/* Cuadrante 3 */}
        <div className="cuadrante3">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟦 Importante pero NO urgente</h3>
          {cuadrante3.length === 0 ? <p>En este momento no hay tareas en este cuadrante</p> :
            cuadrante3.map(task => (
              <Card key={task.id} task={task} onComplete={() => handleComplete(task.id)} onDelete={() => handleDelete(task.id)} onUncomplete={() => handleUncomplete(task.id)} />
            ))}
        </div>

        {/* Cuadrante 4 */}
        <div className="cuadrante4">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟩 Ni urgente ni importante</h3>
          {cuadrante4.length === 0 ? <p>En este momento no hay tareas en este cuadrante</p> :
            cuadrante4.map(task => (
              <Card key={task.id} task={task} onComplete={() => handleComplete(task.id)} onDelete={() => handleDelete(task.id)} onUncomplete={() => handleUncomplete(task.id)} />
            ))}
        </div>
      </div>
    </div>
  )
}

export default Home

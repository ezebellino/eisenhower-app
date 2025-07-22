import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Card from "../components/Card"
import { getCompletedTasks, uncompleteTask, deleteTask, showOnlyCompletedActions } from "../services/taskServices"
import "../../styles/CompletedTasks.css" 
import "../../styles/Card.css" 

function CompletedTasks() {
  const [tasks, setTasks] = useState([])
  const navigate = useNavigate()

  const fetchCompleted = () => {
    getCompletedTasks()
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error al obtener tareas completadas:", err))
  }

  useEffect(() => {
    fetchCompleted()
  }, [])

  const handleDelete = async (id) => {
    await deleteTask(id)
    fetchCompleted()
  }

  const handleUncomplete = async (id) => {
    await uncompleteTask(id)
    fetchCompleted()
    navigate("/")
  }

  const cuadrante1 = tasks.filter(task => task.is_urgent && task.is_important)
  const cuadrante2 = tasks.filter(task => task.is_urgent && !task.is_important)
  const cuadrante3 = tasks.filter(task => !task.is_urgent && task.is_important)
  const cuadrante4 = tasks.filter(task => !task.is_urgent && !task.is_important)

  return (
    <div style={{ padding: "2rem", backgroundColor: "goldenrod", color: "Black" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem", fontSize: "2.5rem", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>Tareas completadas ✅</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "1.5rem"
        
      }}>
        <div className="cuadrante1 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟥 Urgente e Importante</h3>
          {cuadrante1.length === 0 ? <p style={{ textAlign: "center" }}>No hay tareas</p> :
            cuadrante1.map((task, index) => (
              <Card
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onUncomplete={handleUncomplete}
                showOnlyCompletedActions={true}
                index={index}
              />
            ))}
        </div>

        <div className="cuadrante2 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟧 Urgente pero NO importante</h3>
          {cuadrante2.length === 0 ? <p style={{ textAlign: "center" }}>No hay tareas</p> :
            cuadrante2.map((task, index) => (
              <Card
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onUncomplete={handleUncomplete}
                showOnlyCompletedActions={true}
                index={index}
              />
            ))}
        </div>

        <div className="cuadrante3 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟦 Importante pero NO urgente</h3>
          {cuadrante3.length === 0 ? <p style={{ textAlign: "center" }}>No hay tareas</p> :
            cuadrante3.map((task, index) => (
              <Card
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onUncomplete={handleUncomplete}
                showOnlyCompletedActions
                index={index}
              />
            ))}
        </div>

        <div className="cuadrante4 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟩 Ni urgente ni importante</h3>
          {cuadrante4.length === 0 ? <p style={{ textAlign: "center" }}>En este momento no hay tareas en este cuadrante</p> :
            cuadrante4.map(task => (
              <Card
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onUncomplete={handleUncomplete}
                showOnlyCompletedActions
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export default CompletedTasks

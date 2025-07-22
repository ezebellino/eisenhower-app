import { useEffect, useState } from "react"
import Card from "../components/Card"
import { getAllTasks, completeTask, deleteTask, createTask, uncompleteTask } from "../services/taskServices"
import "../../styles/CompletedTasks.css" // Asegúrate de tener este archivo CSS
import "../../styles/Card.css" // Asegúrate de tener este archivo CSS

function Home() {
  const [tasks, setTasks] = useState([])
  const [indexQ1, setIndexQ1] = useState(0);
  const [indexQ2, setIndexQ2] = useState(0);
  const [indexQ3, setIndexQ3] = useState(0);
  const [indexQ4, setIndexQ4] = useState(0);

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
        <div className="cuadrante1 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟥 Urgente e Importante</h3>
          {cuadrante1.length === 0 ? (<p style={{ textAlign: "center" }}>En este momento no hay tareas en este cuadrante</p>
          ) : ( 
            <>
                <Card
                  key={cuadrante1[indexQ1].id}
                  task={cuadrante1[indexQ1]}
                  onComplete={() => handleComplete(cuadrante1[indexQ1].id)}
                  onDelete={() => handleDelete(cuadrante1[indexQ1].id)}
                  onUncomplete={() => handleUncomplete(cuadrante1[indexQ1].id)}
                />
                <div className="arrow-controls">
                  <button
                    onClick={() => setIndexQ1(prev => (prev > 0 ? prev - 1 : cuadrante1.length - 1))}
                  >
                    ⬅️
                  </button>
                  <button
                    onClick={() => setIndexQ1(prev => (prev < cuadrante1.length - 1 ? prev + 1 : 0))}
                  >
                    ➡️
                  </button>
                </div>
            </>
            )}
        </div>

        {/* Cuadrante 2 */}
        <div className="cuadrante2 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟧 Urgente pero NO importante</h3>
          {cuadrante2.length === 0 ? (<p style={{ textAlign: "center" }}>En este momento no hay tareas en este cuadrante</p>
          ) : ( 
            <>
                <Card
                  key={cuadrante2[indexQ2].id}
                  task={cuadrante2[indexQ2]}
                  onComplete={() => handleComplete(cuadrante2[indexQ2].id)}
                  onDelete={() => handleDelete(cuadrante2[indexQ2].id)}
                  onUncomplete={() => handleUncomplete(cuadrante2[indexQ2].id)}
                />
                <div className="arrow-controls">
                  <button
                    onClick={() => setIndexQ2(prev => (prev > 0 ? prev - 1 : cuadrante2.length - 1))}
                  >
                    ⬅️
                  </button>
                  <button
                    onClick={() => setIndexQ2(prev => (prev < cuadrante2.length - 1 ? prev + 1 : 0))}
                  >
                    ➡️
                  </button>
                </div>
            </>
            )}
        </div>

        {/* Cuadrante 3 */}
        <div className="cuadrante3">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟦 Importante pero NO urgente</h3>
          {cuadrante3.length === 0 ? <p style={{ textAlign: "center" }}>En este momento no hay tareas en este cuadrante</p> : ( 
            <>
                <Card
                  key={cuadrante3[indexQ3].id}
                  task={cuadrante3[indexQ3]}
                  onComplete={() => handleComplete(cuadrante3[indexQ3].id)}
                  onDelete={() => handleDelete(cuadrante3[indexQ3].id)}
                  onUncomplete={() => handleUncomplete(cuadrante3[indexQ3].id)}
                />
                <div className="arrow-controls">
                  <button
                    onClick={() => setIndexQ3(prev => (prev > 0 ? prev - 1 : cuadrante3.length - 1))}
                  >
                    ⬅️
                  </button>
                  <button
                    onClick={() => setIndexQ3(prev => (prev < cuadrante3.length - 1 ? prev + 1 : 0))}
                  >
                    ➡️
                  </button>
                </div>
            </>
            )}
        </div>
        {/* Cuadrante 4 */}
        <div className="cuadrante4">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟩 Ni urgente ni importante</h3>
          {cuadrante4.length === 0 ? <p style={{ textAlign: "center" }}>En este momento no hay tareas en este cuadrante</p> : ( 
            <>
                <Card
                  key={cuadrante4[indexQ4].id}
                  task={cuadrante4[indexQ4]}
                  onComplete={() => handleComplete(cuadrante4[indexQ4].id)}
                  onDelete={() => handleDelete(cuadrante4[indexQ4].id)}
                  onUncomplete={() => handleUncomplete(cuadrante4[indexQ4].id)}
                />
                <div className="arrow-controls">
                  <button
                    onClick={() => setIndexQ4(prev => (prev > 0 ? prev - 1 : cuadrante4.length - 1))}
                  >
                    ⬅️
                  </button>
                  <button
                    onClick={() => setIndexQ4(prev => (prev < cuadrante4.length - 1 ? prev + 1 : 0))}
                  >
                    ➡️
                  </button>
                </div>
            </>
            )}
        </div>
      </div>
    </div>
  )
}

export default Home

import { useEffect, useState } from "react";
import Card from "../components/Card";
import { getAllTasks, completeTask, deleteTask, uncompleteTask } from "../services/taskServices";
import type { Task, TaskID } from "../types/tasks";
import "../../styles/CompletedTasks.css";
import "../../styles/Card.css";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [indexQ1, setIndexQ1] = useState<number>(0);
  const [indexQ2, setIndexQ2] = useState<number>(0);
  const [indexQ3, setIndexQ3] = useState<number>(0);
  const [indexQ4, setIndexQ4] = useState<number>(0);

  const fetchTasks = async () => {
    try {
      const data = await getAllTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener tareas:", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (id: TaskID) => {
    await completeTask(id);
    fetchTasks();
  };

  const handleDelete = async (id: TaskID) => {
    await deleteTask(id);
    fetchTasks();
  };

  const handleUncomplete = async (id: TaskID) => {
    await uncompleteTask(id);
    fetchTasks();
  };

  const cuadrante1 = tasks.filter((t) => t.quadrant === 1 && t.status === "active");
  const cuadrante2 = tasks.filter((t) => t.quadrant === 2 && t.status === "active");
  const cuadrante3 = tasks.filter((t) => t.quadrant === 3 && t.status === "active");
  const cuadrante4 = tasks.filter((t) => t.quadrant === 4 && t.status === "active");

  const safePick = (arr: Task[], index: number): Task | null => {
    if (arr.length === 0) return null;
    const normalized = ((index % arr.length) + arr.length) % arr.length;
    return arr[normalized];
  };

  const t1 = safePick(cuadrante1, indexQ1);
  const t2 = safePick(cuadrante2, indexQ2);
  const t3 = safePick(cuadrante3, indexQ3);
  const t4 = safePick(cuadrante4, indexQ4);

  return (
    <div style={{ padding: "2rem", backgroundColor: "goldenrod", color: "Black" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem", fontSize: "2.5rem", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
        Matriz de Eisenhower 🧠
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "1.5rem" }}>
        {/* Cuadrante 1 */}
        <div className="cuadrante1 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟥 Urgente e Importante</h3>

          {!t1 ? (
            <p style={{ textAlign: "center" }}>En este momento no hay tareas en este cuadrante</p>
          ) : (
            <>
              <Card
                key={String(t1.id)}
                task={t1}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onUncomplete={handleUncomplete}
                index={0}
              />
              <div className="arrow-controls">
                <button onClick={() => setIndexQ1((prev) => (prev > 0 ? prev - 1 : cuadrante1.length - 1))}>⬅️</button>
                <button onClick={() => setIndexQ1((prev) => (prev < cuadrante1.length - 1 ? prev + 1 : 0))}>➡️</button>
              </div>
            </>
          )}
        </div>

        {/* Cuadrante 2 */}
        <div className="cuadrante2 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟧 Importante, NO urgente</h3>

          {!t2 ? (
            <p style={{ textAlign: "center" }}>En este momento no hay tareas en este cuadrante</p>
          ) : (
            <>
              <Card key={String(t2.id)} task={t2} onComplete={handleComplete} onDelete={handleDelete} onUncomplete={handleUncomplete} index={0} />
              <div className="arrow-controls">
                <button onClick={() => setIndexQ2((prev) => (prev > 0 ? prev - 1 : cuadrante2.length - 1))}>⬅️</button>
                <button onClick={() => setIndexQ2((prev) => (prev < cuadrante2.length - 1 ? prev + 1 : 0))}>➡️</button>
              </div>
            </>
          )}
        </div>

        {/* Cuadrante 3 */}
        <div className="cuadrante3 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟦 Urgente, NO importante</h3>

          {!t3 ? (
            <p style={{ textAlign: "center" }}>En este momento no hay tareas en este cuadrante</p>
          ) : (
            <>
              <Card key={String(t3.id)} task={t3} onComplete={handleComplete} onDelete={handleDelete} onUncomplete={handleUncomplete} index={0} />
              <div className="arrow-controls">
                <button onClick={() => setIndexQ3((prev) => (prev > 0 ? prev - 1 : cuadrante3.length - 1))}>⬅️</button>
                <button onClick={() => setIndexQ3((prev) => (prev < cuadrante3.length - 1 ? prev + 1 : 0))}>➡️</button>
              </div>
            </>
          )}
        </div>

        {/* Cuadrante 4 */}
        <div className="cuadrante4 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>🟩 Ni urgente ni importante</h3>

          {!t4 ? (
            <p style={{ textAlign: "center" }}>En este momento no hay tareas en este cuadrante</p>
          ) : (
            <>
              <Card key={String(t4.id)} task={t4} onComplete={handleComplete} onDelete={handleDelete} onUncomplete={handleUncomplete} index={0} />
              <div className="arrow-controls">
                <button onClick={() => setIndexQ4((prev) => (prev > 0 ? prev - 1 : cuadrante4.length - 1))}>⬅️</button>
                <button onClick={() => setIndexQ4((prev) => (prev < cuadrante4.length - 1 ? prev + 1 : 0))}>➡️</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

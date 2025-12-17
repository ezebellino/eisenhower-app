import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { getCompletedTasks, uncompleteTask, deleteTask } from "../services/taskServices";
import type { Task, TaskID } from "../types/tasks";
import "../../styles/CompletedTasks.css";
import "../../styles/Card.css";

export default function CompletedTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();

  const fetchCompleted = async () => {
    try {
      const data = await getCompletedTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener tareas completadas:", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchCompleted();
  }, []);

  const handleDelete = async (id: TaskID) => {
    await deleteTask(id);
    fetchCompleted();
  };

  const handleUncomplete = async (id: TaskID) => {
    await uncompleteTask(id);
    fetchCompleted();
    navigate("/");
  };

  const cuadrante1 = tasks.filter((t) => t.quadrant === 1);
  const cuadrante2 = tasks.filter((t) => t.quadrant === 2);
  const cuadrante3 = tasks.filter((t) => t.quadrant === 3);
  const cuadrante4 = tasks.filter((t) => t.quadrant === 4);

  return (
    <div style={{ padding: "2rem", backgroundColor: "goldenrod", color: "Black" }}>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "2.5rem",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        Tareas completadas ✅
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        <div className="cuadrante1 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            🟥 Urgente e Importante
          </h3>
          {cuadrante1.length === 0 ? (
            <p style={{ textAlign: "center" }}>No hay tareas</p>
          ) : (
            cuadrante1.map((task, index) => (
              <Card
                key={String(task.id)}
                task={task}
                onDelete={handleDelete}
                onUncomplete={handleUncomplete}
                showOnlyCompletedActions={true}
                index={index}
              />
            ))
          )}
        </div>

        <div className="cuadrante2 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            🟧 Importante pero NO urgente
          </h3>
          {cuadrante2.length === 0 ? (
            <p style={{ textAlign: "center" }}>No hay tareas</p>
          ) : (
            cuadrante2.map((task, index) => (
              <Card
                key={String(task.id)}
                task={task}
                onDelete={handleDelete}
                onUncomplete={handleUncomplete}
                showOnlyCompletedActions={true}
                index={index}
              />
            ))
          )}
        </div>

        <div className="cuadrante3 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            🟦 Urgente pero NO importante
          </h3>
          {cuadrante3.length === 0 ? (
            <p style={{ textAlign: "center" }}>No hay tareas</p>
          ) : (
            cuadrante3.map((task, index) => (
              <Card
                key={String(task.id)}
                task={task}
                onDelete={handleDelete}
                onUncomplete={handleUncomplete}
                showOnlyCompletedActions={true}
                index={index}
              />
            ))
          )}
        </div>

        <div className="cuadrante4 stack-container">
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            🟩 Ni urgente ni importante
          </h3>
          {cuadrante4.length === 0 ? (
            <p style={{ textAlign: "center" }}>
              En este momento no hay tareas en este cuadrante
            </p>
          ) : (
            cuadrante4.map((task, index) => (
              <Card
                key={String(task.id)}
                task={task}
                onDelete={handleDelete}
                onUncomplete={handleUncomplete}
                showOnlyCompletedActions={true}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

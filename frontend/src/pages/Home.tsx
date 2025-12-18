import { useEffect, useState } from "react";
import EisenhowerMatrix from "../components/EisenhowerMatrix";
import {
  getAllTasks,
  completeTask,
  deleteTask,
  uncompleteTask,
} from "../services/taskServices";
import type { Task, TaskID } from "../types/tasks";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [indexQ1, setIndexQ1] = useState(0);
  const [indexQ2, setIndexQ2] = useState(0);
  const [indexQ3, setIndexQ3] = useState(0);
  const [indexQ4, setIndexQ4] = useState(0);

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

  return (
    <div className="container">
      <EisenhowerMatrix
        title="Matriz de Eisenhower 🧠"
        tasks={tasks}
        mode="active"
        onComplete={handleComplete}
        onDelete={handleDelete}
        onUncomplete={handleUncomplete}
        indexQ1={indexQ1}
        indexQ2={indexQ2}
        indexQ3={indexQ3}
        indexQ4={indexQ4}
        setIndexQ1={setIndexQ1}
        setIndexQ2={setIndexQ2}
        setIndexQ3={setIndexQ3}
        setIndexQ4={setIndexQ4}
      />
    </div>
  );
}

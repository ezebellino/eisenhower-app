import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import Card from "../components/Card";
import { getCompletedTasks, uncompleteTask, deleteTask } from "../services/taskServices";
import type { Task, TaskID } from "../types/tasks";
import "../../styles/CompletedTasks.css";
import "../../styles/Card.css";
import EisenhowerMatrix from "../components/EisenhowerMatrix";

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

  const [indexQ1, setIndexQ1] = useState(0);
  const [indexQ2, setIndexQ2] = useState(0);
  const [indexQ3, setIndexQ3] = useState(0);
  const [indexQ4, setIndexQ4] = useState(0);

  return (
    <div className="container">
      <EisenhowerMatrix
        title="Tareas completadas ✅"
        tasks={tasks}
        mode="completed"
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

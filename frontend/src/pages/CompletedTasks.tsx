import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EisenhowerMatrix from "../components/EisenhowerMatrix";
import {
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessToast,
} from "../services/alertService";
import { deleteTask, getCompletedTasks, uncompleteTask } from "../services/taskServices";
import type { Task, TaskID } from "../types/tasks";
import "../../styles/CompletedTasks.css";
import "../../styles/Card.css";

export default function CompletedTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [indexQ1, setIndexQ1] = useState(0);
  const [indexQ2, setIndexQ2] = useState(0);
  const [indexQ3, setIndexQ3] = useState(0);
  const [indexQ4, setIndexQ4] = useState(0);

  const fetchCompleted = async () => {
    setIsLoadingTasks(true);
    setLoadError(null);

    try {
      const data = await getCompletedTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener tareas completadas:", error);
      setTasks([]);
      setLoadError(
        error instanceof Error ? error.message : "No pudimos cargar tu historial en este momento."
      );
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchCompleted();
  }, []);

  const handleDelete = async (id: TaskID) => {
    const confirmed = await confirmDestructiveAction({
      title: "Eliminar tarea",
      text: "Tambien desaparecera del historial.",
      confirmButtonText: "Eliminar",
    });

    if (!confirmed) return;

    try {
      await deleteTask(id);
      await fetchCompleted();
      await showSuccessToast("Tarea eliminada del historial");
    } catch (error: any) {
      await showErrorAlert("No pudimos eliminar la tarea", error?.message ?? "Intenta otra vez.");
    }
  };

  const handleUncomplete = async (id: TaskID) => {
    try {
      await uncompleteTask(id);
      await fetchCompleted();
      await showSuccessToast("Tarea enviada al Dashboard");
      navigate("/tasks");
    } catch (error: any) {
      await showErrorAlert("No pudimos reabrir la tarea", error?.message ?? "Intenta otra vez.");
    }
  };

  return (
    <div className="page container">
      <EisenhowerMatrix
        title="Historial completado"
        description="Revisa lo que ya cerraste y recupera una tarea si todavia necesita ajustes."
        banner={
          <>
            {isLoadingTasks && (
              <div className="matrix-banner matrix-banner--info">
                <p>Cargando el historial...</p>
              </div>
            )}

            {loadError && (
              <div className="matrix-banner matrix-banner--error">
                <p>No pudimos cargar el historial.</p>
                <small>{loadError}</small>
                <button
                  type="button"
                  className="btn-ghost matrix-banner__action"
                  onClick={fetchCompleted}
                >
                  Reintentar
                </button>
              </div>
            )}
          </>
        }
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

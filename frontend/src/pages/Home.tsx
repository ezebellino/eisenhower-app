import { useEffect, useState } from "react";
import EisenhowerMatrix from "../components/EisenhowerMatrix";
import {
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessToast,
} from "../services/alertService";
import { completeTask, deleteTask, getAllTasks, uncompleteTask } from "../services/taskServices";
import type { Task, TaskID } from "../types/tasks";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useAuth();
  const [indexQ1, setIndexQ1] = useState(0);
  const [indexQ2, setIndexQ2] = useState(0);
  const [indexQ3, setIndexQ3] = useState(0);
  const [indexQ4, setIndexQ4] = useState(0);

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    setLoadError(null);

    try {
      const data = await getAllTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener tareas:", error);
      setTasks([]);
      setLoadError(
        error instanceof Error ? error.message : "No pudimos cargar tus tareas en este momento."
      );
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (id: TaskID) => {
    try {
      await completeTask(id);
      await fetchTasks();
      await showSuccessToast("Tarea movida a Historial");
    } catch (error: any) {
      await showErrorAlert("No pudimos completar la tarea", error?.message ?? "Intenta otra vez.");
    }
  };

  const handleDelete = async (id: TaskID) => {
    const confirmed = await confirmDestructiveAction({
      title: "Eliminar tarea",
      text: "Esta accion no se puede deshacer.",
      confirmButtonText: "Eliminar",
    });

    if (!confirmed) return;

    try {
      await deleteTask(id);
      await fetchTasks();
      await showSuccessToast("Tarea eliminada");
    } catch (error: any) {
      await showErrorAlert("No pudimos eliminar la tarea", error?.message ?? "Intenta otra vez.");
    }
  };

  const handleUncomplete = async (id: TaskID) => {
    try {
      await uncompleteTask(id);
      await fetchTasks();
      await showSuccessToast("Tarea reabierta");
    } catch (error: any) {
      await showErrorAlert("No pudimos reabrir la tarea", error?.message ?? "Intenta otra vez.");
    }
  };

  return (
    <div className="page container">
      <EisenhowerMatrix
        title="Dashboard de prioridades"
        description="Visualiza tu carga activa, navega cada cuadrante y ejecuta con un criterio mas claro."
        banner={
          <>
            {user ? (
              <p>
                Hola <strong>{user.username}</strong>. Tus tareas estan sincronizadas y listas para
                seguir avanzando desde cualquier sesion.
              </p>
            ) : (
              <p>
                Estas usando la app en <strong>modo personal</strong>. Puedes empezar ya mismo y
                guardar tu progreso mas adelante iniciando sesion.
              </p>
            )}

            {isLoadingTasks && (
              <div className="matrix-banner matrix-banner--info">
                <p>Cargando tus tareas...</p>
              </div>
            )}

            {loadError && (
              <div className="matrix-banner matrix-banner--error">
                <p>No pudimos cargar el Dashboard.</p>
                <small>{loadError}</small>
                <button type="button" className="btn-ghost matrix-banner__action" onClick={fetchTasks}>
                  Reintentar
                </button>
              </div>
            )}
          </>
        }
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

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

function getLatestUpdate(tasks: Task[]) {
  if (tasks.length === 0) return "Sin actividad reciente";

  const latest = [...tasks].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  )[0];

  const date = new Date(latest.updatedAt);
  if (Number.isNaN(date.getTime())) return "Sin actividad reciente";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

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

  const activeTasks = tasks.filter((task) => task.status === "active");
  const criticalTasks = activeTasks.filter((task) => task.quadrant === 1).length;
  const strategicTasks = activeTasks.filter((task) => task.quadrant === 2).length;
  const reactiveTasks = activeTasks.filter((task) => task.quadrant === 3).length;
  const lowPriorityTasks = activeTasks.filter((task) => task.quadrant === 4).length;
  const importantTasks = activeTasks.filter((task) => task.is_important).length;
  const focusRatio =
    activeTasks.length === 0 ? 0 : Math.round((importantTasks / activeTasks.length) * 100);

  const dashboardHighlights = [
    {
      label: "Atencion inmediata",
      value: String(criticalTasks),
      helper: criticalTasks === 1 ? "1 tarea critica hoy" : `${criticalTasks} tareas criticas hoy`,
      tone: "is-critical",
    },
    {
      label: "Trabajo estrategico",
      value: String(strategicTasks),
      helper:
        strategicTasks === 0
          ? "No hay tareas de planificacion"
          : `${strategicTasks} tareas para avanzar sin urgencia`,
      tone: "is-strategic",
    },
    {
      label: "Ruido operativo",
      value: String(reactiveTasks + lowPriorityTasks),
      helper: "Lo urgente menor y lo postergable viven aca",
      tone: "is-ops",
    },
    {
      label: "Foco real",
      value: `${focusRatio}%`,
      helper: `Ultima actualizacion ${getLatestUpdate(activeTasks)}`,
      tone: "is-focus",
    },
  ];

  return (
    <div className="page container">
      <EisenhowerMatrix
        title="Dashboard de prioridades"
        description="Visualiza tu carga activa, navega cada cuadrante y ejecuta con un criterio mas claro."
        banner={
          <>
            <div className="dashboard-summary">
              <div className="dashboard-summary__intro">
                {user ? (
                  <p>
                    Hola <strong>{user.username}</strong>. Tus tareas estan sincronizadas y listas
                    para seguir avanzando desde cualquier sesion.
                  </p>
                ) : (
                  <p>
                    Estas usando la app en <strong>modo personal</strong>. Puedes empezar ya mismo
                    y guardar tu progreso mas adelante iniciando sesion.
                  </p>
                )}

                <small>
                  {criticalTasks > 0
                    ? "Empeza por el cuadrante urgente e importante para bajar friccion rapido."
                    : strategicTasks > 0
                      ? "Buen momento para avanzar trabajo importante antes de que se vuelva urgente."
                      : "Tu carga esta contenida. Es un buen momento para agregar o revisar prioridades."}
                </small>
              </div>

              <div className="dashboard-summary__grid">
                {dashboardHighlights.map((item) => (
                  <article key={item.label} className={`dashboard-kpi ${item.tone}`}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <small>{item.helper}</small>
                  </article>
                ))}
              </div>
            </div>

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

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EisenhowerMatrix from "../components/EisenhowerMatrix";
import {
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessToast,
} from "../services/alertService";
import { deleteTask, getCompletedTasks, uncompleteTask } from "../services/taskServices";
import type { Task, TaskID } from "../types/tasks";
import { useAuth } from "../auth/AuthContext";
import { listUsers, type UserSummary } from "../services/userService";
import "../../styles/CompletedTasks.css";
import "../../styles/Card.css";

type SortOption = "recent" | "oldest" | "title-asc" | "title-desc";
type QuadrantFilter = "all" | "1" | "2" | "3" | "4";
type SupervisorScope = "all" | "mine" | "team" | "unassigned";

function sortTasks(tasks: Task[], sortBy: SortOption) {
  const sorted = [...tasks];

  sorted.sort((left, right) => {
    switch (sortBy) {
      case "oldest":
        return Date.parse(left.updatedAt) - Date.parse(right.updatedAt);
      case "title-asc":
        return left.title.localeCompare(right.title, "es");
      case "title-desc":
        return right.title.localeCompare(left.title, "es");
      case "recent":
      default:
        return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
    }
  });

  return sorted;
}

export default function CompletedTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [staffUsers, setStaffUsers] = useState<UserSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quadrantFilter, setQuadrantFilter] = useState<QuadrantFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [supervisorScope, setSupervisorScope] = useState<SupervisorScope>("all");
  const deferredSearch = useDeferredValue(searchTerm);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [indexQ1, setIndexQ1] = useState(0);
  const [indexQ2, setIndexQ2] = useState(0);
  const [indexQ3, setIndexQ3] = useState(0);
  const [indexQ4, setIndexQ4] = useState(0);

  const fetchCompleted = async () => {
    setIsLoadingTasks(true);
    setLoadError(null);

    try {
      const [tasksResult, usersResult] = await Promise.allSettled([
        getCompletedTasks(),
        user?.role === "supervisor" ? listUsers() : Promise.resolve([] as UserSummary[]),
      ]);

      if (tasksResult.status === "rejected") {
        throw tasksResult.reason;
      }

      const data = tasksResult.value;
      setTasks(Array.isArray(data) ? data : []);

      if (usersResult.status === "fulfilled") {
        setStaffUsers(usersResult.value);
      } else {
        setStaffUsers([]);
        console.error("Error al obtener usuarios del staff:", usersResult.reason);
      }
    } catch (error) {
      console.error("Error al obtener tareas completadas:", error);
      setTasks([]);
      setStaffUsers([]);
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

  const visibleTasks = useMemo(() => {
    const query = deferredSearch.trim().toLocaleLowerCase("es");

    const filtered = tasks.filter((task) => {
      const matchesScope =
        user?.role !== "supervisor"
          ? true
          : supervisorScope === "all"
            ? true
            : supervisorScope === "mine"
              ? task.assigned_to_id === user.id
              : supervisorScope === "team"
                ? task.assigned_to_id != null && task.assigned_to_id !== user.id
                : task.assigned_to_id == null;
      const matchesQuadrant =
        quadrantFilter === "all" ? true : task.quadrant === Number(quadrantFilter);
      const matchesSearch =
        query.length === 0
          ? true
          : `${task.title} ${task.description ?? ""}`.toLocaleLowerCase("es").includes(query);

      return matchesScope && matchesQuadrant && matchesSearch;
    });

    return sortTasks(filtered, sortBy);
  }, [tasks, deferredSearch, quadrantFilter, sortBy, supervisorScope, user]);

  const assigneeLookup = useMemo(
    () => new Map(staffUsers.map((staffUser) => [staffUser.id, staffUser.username])),
    [staffUsers]
  );

  const resolveAssigneeLabel = (task: Task) => {
    if (task.assigned_to_id == null) return null;
    if (user && task.assigned_to_id === user.id) return "Asignada a vos";
    return assigneeLookup.get(task.assigned_to_id) ?? `Usuario #${task.assigned_to_id}`;
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
        toolbar={
          <div className="matrix-filters">
            <div className="matrix-filter matrix-filter--search">
              <span>Buscar</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Titulo o descripcion"
              />
            </div>

            {user?.role === "supervisor" && (
              <div className="matrix-filter">
                <span>Vista</span>
                <select
                  value={supervisorScope}
                  onChange={(event) => setSupervisorScope(event.target.value as SupervisorScope)}
                >
                  <option value="all">Todas</option>
                  <option value="mine">Asignadas a vos</option>
                  <option value="team">Equipo</option>
                  <option value="unassigned">Sin asignar</option>
                </select>
              </div>
            )}

            <div className="matrix-filter">
              <span>Cuadrante</span>
              <select
                value={quadrantFilter}
                onChange={(event) => setQuadrantFilter(event.target.value as QuadrantFilter)}
              >
                <option value="all">Todos</option>
                <option value="1">Q1</option>
                <option value="2">Q2</option>
                <option value="3">Q3</option>
                <option value="4">Q4</option>
              </select>
            </div>

            <div className="matrix-filter">
              <span>Ordenar</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
                <option value="recent">Mas recientes</option>
                <option value="oldest">Mas antiguas</option>
                <option value="title-asc">Titulo A-Z</option>
                <option value="title-desc">Titulo Z-A</option>
              </select>
            </div>

            <div className="matrix-filter matrix-filter--result">
              <span>Resultados</span>
              <strong>{visibleTasks.length}</strong>
            </div>
          </div>
        }
        tasks={visibleTasks}
        resolveAssigneeLabel={resolveAssigneeLabel}
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

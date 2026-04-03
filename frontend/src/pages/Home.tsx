import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EisenhowerMatrix from "../components/EisenhowerMatrix";
import {
  confirmDestructiveAction,
  selectDuplicationTargets,
  showErrorAlert,
  showInfoAlert,
  showSuccessToast,
} from "../services/alertService";
import { consumeSessionNotice } from "../services/sessionNoticeService";
import {
  completeTask,
  createTask,
  deleteTask,
  getAllTasks,
  uncompleteTask,
} from "../services/taskServices";
import type { Task, TaskID } from "../types/tasks";
import { useAuth } from "../auth/AuthContext";
import { listUsers, type UserSummary } from "../services/userService";

type SortOption = "recent" | "oldest" | "title-asc" | "title-desc";
type QuadrantFilter = "all" | "1" | "2" | "3" | "4";
type SupervisorScope = "all" | "mine" | "team" | "unassigned";

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

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [staffUsers, setStaffUsers] = useState<UserSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quadrantFilter, setQuadrantFilter] = useState<QuadrantFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [supervisorScope, setSupervisorScope] = useState<SupervisorScope>("all");
  const [focusedAssigneeId, setFocusedAssigneeId] = useState<number | null>(null);
  const deferredSearch = useDeferredValue(searchTerm);
  const { user } = useAuth();
  const [indexQ1, setIndexQ1] = useState(0);
  const [indexQ2, setIndexQ2] = useState(0);
  const [indexQ3, setIndexQ3] = useState(0);
  const [indexQ4, setIndexQ4] = useState(0);

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    setLoadError(null);

    try {
      const [tasksResult, usersResult] = await Promise.allSettled([
        getAllTasks(),
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
      console.error("Error al obtener tareas:", error);
      setTasks([]);
      setStaffUsers([]);
      setLoadError(
        error instanceof Error ? error.message : "No pudimos cargar tus tareas en este momento."
      );
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    setSessionNotice(consumeSessionNotice());
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

  const handleDuplicateTask = async (task: Task) => {
    if (user?.role !== "supervisor") return;

    const eligibleUsers = staffUsers.filter(
      (staffUser) => staffUser.is_active && staffUser.id !== task.assigned_to_id
    );

    if (eligibleUsers.length === 0) {
      await showInfoAlert(
        "No hay destinatarios disponibles",
        "No encontramos otras personas activas para duplicar esta tarea."
      );
      return;
    }

    const currentAssigneeLabel =
      task.assigned_to_id == null
        ? "Sin asignar"
        : assigneeLookup.get(task.assigned_to_id) ?? `Usuario #${task.assigned_to_id}`;

    const targetSelection = await selectDuplicationTargets(eligibleUsers, currentAssigneeLabel);
    if (!targetSelection) return;

    const targetIds =
      targetSelection === "all" ? eligibleUsers.map((staffUser) => staffUser.id) : targetSelection;

    try {
      for (const targetId of targetIds) {
        await createTask({
          title: task.title,
          description: task.description ?? "",
          is_urgent: task.is_urgent,
          is_important: task.is_important,
          assigned_to_id: targetId,
        });
      }

      await fetchTasks();
      await showSuccessToast(
        targetIds.length > 1
          ? `${targetIds.length} copias creadas correctamente`
          : "Copia creada correctamente"
      );
    } catch (error: any) {
      await showErrorAlert(
        "No pudimos duplicar la tarea",
        error?.message ?? "Intenta otra vez."
      );
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
  const myAssignedTasks = user
    ? activeTasks.filter((task) => task.assigned_to_id === user.id).length
    : 0;
  const teamAssignedTasks = user
    ? activeTasks.filter(
        (task) => task.assigned_to_id != null && task.assigned_to_id !== user.id
      ).length
    : 0;
  const unassignedTasks = activeTasks.filter((task) => task.assigned_to_id == null).length;
  const q1TeamRisk = user
    ? activeTasks.filter((task) => task.quadrant === 1 && task.assigned_to_id !== user.id).length
    : 0;

  const dashboardHighlights =
    user?.role === "supervisor"
      ? [
          {
            label: "Asignadas a vos",
            value: String(myAssignedTasks),
            helper:
              myAssignedTasks === 0
                ? "No tenes carga propia asignada"
                : `${myAssignedTasks} tareas esperan seguimiento directo`,
            tone: "is-focus",
          },
          {
            label: "Equipo en curso",
            value: String(teamAssignedTasks),
            helper:
              teamAssignedTasks === 0
                ? "Todavia no delegaste al staff"
                : `${teamAssignedTasks} tareas estan hoy en manos del equipo`,
            tone: "is-strategic",
          },
          {
            label: "Sin asignar",
            value: String(unassignedTasks),
            helper:
              unassignedTasks === 0
                ? "Toda la carga ya tiene responsable"
                : "Buen candidato para repartir y ordenar mejor",
            tone: "is-ops",
          },
          {
            label: "Riesgo en Q1",
            value: String(q1TeamRisk),
            helper:
              q1TeamRisk === 0
                ? "No hay urgencias criticas fuera de tu foco"
                : `${q1TeamRisk} tareas urgentes requieren seguimiento`,
            tone: "is-critical",
          },
        ]
      : [
          {
            label: "Atencion inmediata",
            value: String(criticalTasks),
            helper:
              criticalTasks === 1 ? "1 tarea critica hoy" : `${criticalTasks} tareas criticas hoy`,
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

  const visibleTasks = useMemo(() => {
    const query = deferredSearch.trim().toLocaleLowerCase("es");

    const filtered = activeTasks.filter((task) => {
      const matchesFocusedAssignee =
        focusedAssigneeId == null ? true : task.assigned_to_id === focusedAssigneeId;
      const matchesScope =
        user?.role !== "supervisor" || focusedAssigneeId != null
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

      return matchesFocusedAssignee && matchesScope && matchesQuadrant && matchesSearch;
    });

    return sortTasks(filtered, sortBy);
  }, [activeTasks, deferredSearch, focusedAssigneeId, quadrantFilter, sortBy, supervisorScope, user]);

  const assigneeLookup = useMemo(
    () => new Map(staffUsers.map((staffUser) => [staffUser.id, staffUser.username])),
    [staffUsers]
  );

  const teamLoad = useMemo(() => {
    if (user?.role !== "supervisor") return [];

    return staffUsers
      .filter((staffUser) => staffUser.is_active)
      .map((staffUser) => {
        const assigned = activeTasks.filter((task) => task.assigned_to_id === staffUser.id);
        const q1 = assigned.filter((task) => task.quadrant === 1).length;
        const important = assigned.filter((task) => task.is_important).length;

        return {
          id: staffUser.id,
          username: staffUser.username,
          role: staffUser.role,
          total: assigned.length,
          q1,
          focus: assigned.length === 0 ? 0 : Math.round((important / assigned.length) * 100),
        };
      })
      .sort((left, right) => {
        if (right.q1 !== left.q1) return right.q1 - left.q1;
        return right.total - left.total;
      });
  }, [activeTasks, staffUsers, user]);

  const unassignedQueue = useMemo(
    () =>
      sortTasks(
        activeTasks.filter((task) => task.assigned_to_id == null),
        "recent"
      ).slice(0, 3),
    [activeTasks]
  );

  const resolveAssigneeLabel = (task: Task) => {
    if (task.assigned_to_id == null) return null;
    if (user && task.assigned_to_id === user.id) return "Asignada a vos";
    return assigneeLookup.get(task.assigned_to_id) ?? `Usuario #${task.assigned_to_id}`;
  };

  const focusedAssignee = focusedAssigneeId == null
    ? null
    : teamLoad.find((member) => member.id === focusedAssigneeId) ?? null;

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
                    Estas usando la app en <strong>modo invitado</strong>. Puedes empezar ya mismo
                    y guardar tu progreso mas adelante creando una cuenta.
                  </p>
                )}

                <small>
                  {user?.role === "supervisor"
                    ? "Estas viendo una consola de supervision: filtra por responsable, detecta carga sin asignar y segui el riesgo operativo del equipo."
                    : criticalTasks > 0
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

              {user?.role === "supervisor" && (
                <div className="supervisor-overview">
                  <div className="team-load panel">
                    <div className="team-load__header">
                      <div>
                        <p className="team-load__eyebrow">Carga del equipo</p>
                        <h3>Distribucion actual por persona</h3>
                      </div>
                      <small>
                        {teamLoad.length === 0
                          ? "Todavia no hay staff cargado para mostrar."
                          : "Ordenado por urgencia Q1 y volumen total de trabajo."}
                      </small>
                    </div>

                    <div className="team-load__grid">
                      {teamLoad.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          className={`team-load__card ${focusedAssigneeId === member.id ? "is-active" : ""}`}
                          onClick={() => {
                            setFocusedAssigneeId(member.id);
                            setSupervisorScope("all");
                          }}
                        >
                          <div className="team-load__title">
                            <strong>{member.username}</strong>
                            {member.role === "supervisor" && <span>Supervisor</span>}
                          </div>

                          <div className="team-load__stats">
                            <div>
                              <span>Activas</span>
                              <strong>{member.total}</strong>
                            </div>
                            <div>
                              <span>Q1</span>
                              <strong>{member.q1}</strong>
                            </div>
                            <div>
                              <span>Foco</span>
                              <strong>{member.focus}%</strong>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <aside className="unassigned-queue panel">
                    <div className="unassigned-queue__header">
                      <div>
                        <p className="team-load__eyebrow">Bandeja sin asignar</p>
                        <h3>Tareas esperando responsable</h3>
                      </div>
                      <span className="unassigned-queue__count">{unassignedTasks}</span>
                    </div>

                    <p className="unassigned-queue__summary">
                      {unassignedTasks === 0
                        ? "No hay tareas sueltas ahora mismo. Buena senal de control operativo."
                        : "Prioriza esta bandeja para que nada importante quede sin dueno."}
                    </p>

                    {unassignedQueue.length > 0 ? (
                      <div className="unassigned-queue__list">
                        {unassignedQueue.map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            className="unassigned-queue__item"
                            onClick={() => {
                              setFocusedAssigneeId(null);
                              setSupervisorScope("unassigned");
                              setQuadrantFilter("all");
                              setSearchTerm(task.title);
                            }}
                          >
                            <div>
                              <strong>{task.title}</strong>
                              <small>
                                {task.quadrant === 1
                                  ? "Urgente e importante"
                                  : task.quadrant === 2
                                    ? "Importante, no urgente"
                                    : task.quadrant === 3
                                      ? "Urgente, no importante"
                                      : "Ni urgente ni importante"}
                              </small>
                            </div>
                            <span>Ver</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="unassigned-queue__empty">
                        <strong>Todo tiene responsable.</strong>
                        <p>Segui creando y delegando desde el dashboard cuando haga falta.</p>
                      </div>
                    )}

                    <div className="unassigned-queue__actions">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          setFocusedAssigneeId(null);
                          setSupervisorScope("unassigned");
                          setSearchTerm("");
                        }}
                      >
                        Abrir vista sin asignar
                      </button>
                      <Link to="/tasks/create" className="btn-ghost">
                        Crear tarea
                      </Link>
                    </div>
                  </aside>
                </div>
              )}
            </div>

            {sessionNotice && (
              <div className="matrix-banner matrix-banner--success">
                <p>{sessionNotice}</p>
              </div>
            )}

            {user?.role === "supervisor" && (
              <div className="matrix-banner matrix-banner--supervisor">
                <div className="matrix-banner__stack">
                  <div>
                    <p>Modo supervisor activo.</p>
                    <small>
                      Hoy ya podes crear, asignar y monitorear el trabajo del equipo desde este
                      mismo dashboard.
                    </small>
                  </div>

                  <div className="matrix-banner__actions">
                    <Link to="/tasks/create" className="btn-primary">
                      Crear y asignar tarea
                    </Link>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setSupervisorScope("unassigned")}
                    >
                      Ver sin asignar
                    </button>
                  </div>
                </div>
              </div>
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

            {focusedAssignee && (
              <div className="matrix-filter matrix-filter--focus">
                <span>Persona enfocada</span>
                <div className="matrix-filter__focus">
                  <strong>{focusedAssignee.username}</strong>
                  <button type="button" className="btn-ghost" onClick={() => setFocusedAssigneeId(null)}>
                    Limpiar
                  </button>
                </div>
              </div>
            )}

            {user?.role === "supervisor" && (
              <div className="matrix-filter">
                <span>Vista</span>
                <select
                  value={supervisorScope}
                  onChange={(event) => setSupervisorScope(event.target.value as SupervisorScope)}
                  disabled={focusedAssigneeId != null}
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
        mode="active"
        onComplete={handleComplete}
        onDelete={handleDelete}
        onDuplicate={user?.role === "supervisor" ? handleDuplicateTask : undefined}
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

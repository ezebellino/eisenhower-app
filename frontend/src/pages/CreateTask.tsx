import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { showErrorAlert, showSuccessToast } from "../services/alertService";
import { createTask, type CreateTaskPayload } from "../services/taskServices";
import { listUsers, type UserSummary } from "../services/userService";
import "../../styles/formAnimation.css";
import "../../styles/formStyle.css";

type AssignmentMode = "single" | "multiple" | "all";
type FormErrors = Partial<Record<keyof CreateTaskPayload | "general" | "assignees", string>>;

export default function CreateTask() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSupervisor = user?.role === "supervisor";
  const [staff, setStaff] = useState<UserSummary[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("single");
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<number[]>([]);

  const [formData, setFormData] = useState<CreateTaskPayload>({
    title: "",
    description: "",
    is_urgent: false,
    is_important: false,
    assigned_to_id: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupervisor) return;

    (async () => {
      try {
        setLoadingStaff(true);
        const users = await listUsers();
        setStaff(users.filter((member) => member.is_active));
      } catch (error) {
        console.error("No pudimos cargar el staff.", error);
      } finally {
        setLoadingStaff(false);
      }
    })();
  }, [isSupervisor]);

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "El titulo es obligatorio";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Debe tener al menos 3 caracteres";
    }

    if (
      formData.description &&
      formData.description.trim().length > 0 &&
      formData.description.trim().length < 5
    ) {
      newErrors.description = "La descripcion debe tener al menos 5 caracteres";
    }

    if (isSupervisor) {
      if (assignmentMode === "single" && !formData.assigned_to_id) {
        newErrors.assigned_to_id = "Selecciona una persona del staff";
      }

      if (assignmentMode === "multiple" && selectedAssigneeIds.length === 0) {
        newErrors.assignees = "Selecciona al menos una persona del staff";
      }

      if (assignmentMode === "all" && staff.length === 0) {
        newErrors.assignees = "No hay personas activas disponibles para asignar";
      }
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = "checked" in e.target ? e.target.checked : false;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      assigned_to_id: value ? Number(value) : null,
    }));
  };

  const toggleAssignee = (assigneeId: number) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(assigneeId)
        ? prev.filter((currentId) => currentId !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  const handleAssignmentModeChange = (mode: AssignmentMode) => {
    setAssignmentMode(mode);
    setErrors((prev) => ({ ...prev, assigned_to_id: undefined, assignees: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);

    try {
      const basePayload: CreateTaskPayload = {
        title: formData.title.trim(),
        description: formData.description?.trim() ? formData.description.trim() : "",
        is_urgent: formData.is_urgent,
        is_important: formData.is_important,
      };

      const targetAssigneeIds =
        !isSupervisor || assignmentMode === "single"
          ? [formData.assigned_to_id ?? null]
          : assignmentMode === "multiple"
            ? selectedAssigneeIds
            : staff.map((member) => member.id);

      let createdCount = 0;

      for (const assigneeId of targetAssigneeIds) {
        await createTask({
          ...basePayload,
          assigned_to_id: assigneeId,
        });
        createdCount += 1;
      }

      await showSuccessToast(
        createdCount > 1 ? `${createdCount} tareas creadas correctamente` : "Tarea creada correctamente"
      );
      navigate("/tasks");
    } catch (error: any) {
      const message = error?.message ?? "No se pudo crear la tarea.";
      setErrors({ general: message });
      await showErrorAlert("No pudimos crear la tarea", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="form-page">
        <div className="form-card">
          <h2 id="create-task-title">Crear nueva tarea</h2>
          <p className="subtle form-subtitle">
            {isSupervisor
              ? "Define la prioridad y deja la tarea lista para una persona, varias o todo el staff."
              : "Define si es urgente y si es importante para ubicarla en el cuadrante correcto."}
          </p>

          <form id="task-form" onSubmit={handleSubmit}>
            <div className="form-field">
                <label className={errors.title ? "label-shake" : ""}>Titulo</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? "input-error shake" : ""}`}
                placeholder="Ej: Preparar reporte semanal"
              />
              {errors.title && <p className="error fade-in">{errors.title}</p>}
            </div>

            <div className="form-field">
              <label className={errors.description ? "label-shake" : ""}>Descripcion</label>
              <textarea
                name="description"
                value={formData.description ?? ""}
                onChange={handleChange}
                className={`form-textarea ${errors.description ? "input-error shake" : ""}`}
                placeholder="Agrega contexto, entregable o proximo paso"
              />
              {errors.description && <p className="error fade-in">{errors.description}</p>}
            </div>

            {isSupervisor && (
              <div className="form-field">
                <label>Modo de asignacion</label>
                <div className="assignment-modes">
                  <button
                    type="button"
                    className={`assignment-mode ${assignmentMode === "single" ? "is-active" : ""}`}
                    onClick={() => handleAssignmentModeChange("single")}
                  >
                    Una persona
                  </button>
                  <button
                    type="button"
                    className={`assignment-mode ${assignmentMode === "multiple" ? "is-active" : ""}`}
                    onClick={() => handleAssignmentModeChange("multiple")}
                  >
                    Varias personas
                  </button>
                  <button
                    type="button"
                    className={`assignment-mode ${assignmentMode === "all" ? "is-active" : ""}`}
                    onClick={() => handleAssignmentModeChange("all")}
                    disabled={staff.length === 0}
                  >
                    Todo el staff
                  </button>
                </div>

                {assignmentMode === "single" && (
                  <>
                    <label className={errors.assigned_to_id ? "label-shake" : ""}>Asignar a</label>
                    <p className="subtle form-hint">
                      Crea una unica tarea con un responsable claro desde el inicio.
                    </p>
                    <select
                      className={`form-input ${errors.assigned_to_id ? "input-error shake" : ""}`}
                      value={formData.assigned_to_id ?? ""}
                      onChange={handleAssigneeChange}
                      disabled={loadingStaff}
                    >
                      <option value="">
                        {loadingStaff ? "Cargando staff..." : "Seleccionar persona"}
                      </option>
                      {staff.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.username} {member.role === "supervisor" ? "(Supervisor)" : ""}
                        </option>
                      ))}
                    </select>
                    {errors.assigned_to_id && <p className="error fade-in">{errors.assigned_to_id}</p>}
                  </>
                )}

                {assignmentMode === "multiple" && (
                  <>
                    <label className={errors.assignees ? "label-shake" : ""}>Asignar a varias personas</label>
                    <p className="subtle form-hint">
                      Se va a crear una copia individual para cada persona seleccionada.
                    </p>
                    <div className={`staff-selector ${errors.assignees ? "input-error" : ""}`}>
                      {staff.map((member) => (
                        <label key={member.id} className="staff-selector__item">
                          <input
                            type="checkbox"
                            checked={selectedAssigneeIds.includes(member.id)}
                            onChange={() => toggleAssignee(member.id)}
                          />
                          <span>
                            {member.username} {member.role === "supervisor" ? "(Supervisor)" : ""}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.assignees && <p className="error fade-in">{errors.assignees}</p>}
                  </>
                )}

                {assignmentMode === "all" && (
                  <div className="assignment-summary">
                    <strong>Se va a crear una copia para cada persona activa del staff.</strong>
                    <p>
                      {loadingStaff
                        ? "Estamos cargando el staff..."
                        : `${staff.length} personas van a recibir una tarea individual para hacer seguimiento propio.`}
                    </p>
                    {errors.assignees && <p className="error fade-in">{errors.assignees}</p>}
                  </div>
                )}
              </div>
            )}

            <div className="form-checks">
              <label className="check">
                <input
                  type="checkbox"
                  name="is_urgent"
                  checked={formData.is_urgent}
                  onChange={handleChange}
                />
                <span>Urgente</span>
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  name="is_important"
                  checked={formData.is_important}
                  onChange={handleChange}
                />
                <span>Importante</span>
              </label>
            </div>

            {!formData.is_urgent && !formData.is_important && (
              <p className="subtle form-hint fade-in">
                Esta tarea va a quedar en <strong>Q4: ni urgente ni importante</strong>.
              </p>
            )}

            {(formData.is_urgent || formData.is_important) && (
              <p className="subtle form-hint fade-in">
                {formData.is_urgent && formData.is_important
                  ? "Va directo a Q1: atencion inmediata."
                  : formData.is_important
                    ? "Va a Q2: trabajo importante que conviene sostener antes de que se vuelva urgente."
                    : "Va a Q3: urgencia operativa con menor impacto estrategico."}
              </p>
            )}

            {errors.general && <p className="error fade-in">{errors.general}</p>}

            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
                Volver
              </button>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving
                  ? "Creando..."
                  : isSupervisor && assignmentMode !== "single"
                    ? "Crear tareas"
                    : "Crear tarea"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask, type CreateTaskPayload } from "../services/taskServices";
import { showErrorAlert, showSuccessToast } from "../services/alertService";
import "../../styles/formAnimation.css";
import "../../styles/formStyle.css";

type FormErrors = Partial<Record<keyof CreateTaskPayload | "general", string>>;

export default function CreateTask() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateTaskPayload>({
    title: "",
    description: "",
    is_urgent: false,
    is_important: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Debe tener al menos 3 caracteres";
    }

    if (
      formData.description &&
      formData.description.trim().length > 0 &&
      formData.description.trim().length < 5
    ) {
      newErrors.description = "La descripción debe tener al menos 5 caracteres";
    }

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = "checked" in e.target ? e.target.checked : false;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);

    try {
      await createTask(formData);
      await showSuccessToast("Tarea creada correctamente");
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
          <h2 id="create-task-title">Crear nueva tarea 📝</h2>
          <p className="subtle form-subtitle">
            Elegí si es urgente y/o importante para ubicarla en la matriz.
          </p>

          <form id="task-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className={errors.title ? "label-shake" : ""}>Título</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? "input-error shake" : ""}`}
                placeholder="Ej: Llamar al médico"
              />
              {errors.title && <p className="error fade-in">{errors.title}</p>}
            </div>

            <div className="form-field">
              <label className={errors.description ? "label-shake" : ""}>
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description ?? ""}
                onChange={handleChange}
                className={`form-textarea ${errors.description ? "input-error shake" : ""}`}
                placeholder="Contexto breve (opcional)"
              />
              {errors.description && (
                <p className="error fade-in">{errors.description}</p>
              )}
            </div>

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
                Esta tarea se ubicará en el cuadrante <strong>“Ni urgente ni importante”</strong>.
              </p>
            )}


            {errors.general && <p className="error fade-in">{errors.general}</p>}

            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
                Volver
              </button>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Creando..." : "Crear tarea"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

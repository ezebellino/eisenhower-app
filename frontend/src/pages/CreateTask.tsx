import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask, type CreateTaskPayload } from "../services/taskServices";
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

    if (!formData.is_urgent && !formData.is_important) {
      newErrors.general = "Seleccioná al menos 'Urgente' o 'Importante' (si no, queda en cuadrante 4).";
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

    await createTask(formData);
    navigate("/");
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "auto",
        padding: "1rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
      <h2 id="create-task-title">Crear nueva tarea 📝</h2>

      <form id="task-form" onSubmit={handleSubmit}>
        <div>
          <label className={errors.title ? "label-shake" : ""}>Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`form-input ${errors.title ? "input-error shake" : ""}`}
          />
          {errors.title && <p className="error fade-in">{errors.title}</p>}
        </div>

        <div>
          <label className={errors.description ? "label-shake" : ""}>
            Descripción:
          </label>
          <textarea
            name="description"
            value={formData.description ?? ""}
            onChange={handleChange}
            className={`form-textarea ${
              errors.description ? "input-error shake" : ""
            }`}
          />
          {errors.description && (
            <p className="error fade-in">{errors.description}</p>
          )}
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="is_urgent"
              checked={formData.is_urgent}
              onChange={handleChange}
            />
            Urgente
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="is_important"
              checked={formData.is_important}
              onChange={handleChange}
            />
            Importante
          </label>
        </div>

        {errors.general && <p className="error fade-in">{errors.general}</p>}

        <button type="submit">Crear tarea</button>
      </form>
    </div>
  );
}

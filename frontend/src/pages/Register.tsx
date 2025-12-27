import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, login } from "../services/authService";
import { useAuth } from "../auth/AuthContext";
import "../../styles/Register.css";

export default function Register() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const u = username.trim();
    const em = email.trim();

    if (!u) return setErr("Ingresá un usuario.");
    if (!em) return setErr("Ingresá un email.");
    if (!password) return setErr("Ingresá una contraseña.");
    if (password !== confirm) return setErr("Las contraseñas no coinciden.");

    setLoading(true);
    try {
      // 1) registrar
      await register({ username: u, email: em, password });

      // 2) opcional: loguear automáticamente
      await login({ username: u, password });
      await refreshMe();

      navigate("/tasks");
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card panel">
        <div className="auth-header">
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">
            Registrate para empezar a organizar tus tareas con la Matriz de Eisenhower.
          </p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-label">Usuario</label>
          <input
            className="form-input auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="tu_usuario"
          />

          <label className="auth-label" style={{ marginTop: "0.75rem" }}>
            Email
          </label>
          <input
            className="form-input auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="tu@email.com"
            inputMode="email"
          />

          <label className="auth-label" style={{ marginTop: "0.75rem" }}>
            Contraseña
          </label>
          <input
            className="form-input auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <label className="auth-label" style={{ marginTop: "0.75rem" }}>
            Confirmar contraseña
          </label>
          <input
            className="form-input auth-input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
          />

          {err && (
            <p className="error" style={{ marginTop: "0.75rem" }}>
              {err}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            style={{ marginTop: "1rem" }}
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>

          <div style={{ marginTop: "0.9rem", textAlign: "center" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/login")}
            >
              Ya tengo cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

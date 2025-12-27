import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { login } from "../services/authService";
import "../../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await login({ username, password });
      await refreshMe();
      navigate("/tasks");
    } catch (e: any) {
      setErr(e?.message ?? "Error de login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card panel">
        <div className="auth-header">
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">
            Ingresá con tu usuario para ver y organizar tus tareas.
          </p>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <label className="auth-label">Usuario</label>
          <input
            className="form-input auth-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="tu_usuario"
          />

          <label className="auth-label" style={{ marginTop: 12 }}>
            Contraseña
          </label>
          <input
            className="form-input auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />

          {err && <p className="auth-error">{err}</p>}

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          <div className="auth-form-footer">
                {/* boton de volver al inicio */ }
            <button
                type="button"
                className="btn btn-ghost auth-cancel"
                onClick={() => navigate("/")}
                disabled={loading}
            >
                Volver al inicio
            </button>
            {/* boton de registrar cuenta */ }          
            <button
                type="button"
                className="btn btn-secondary auth-register"
                onClick={() => navigate("/register")}
                disabled={loading}
            >
                Registrar usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

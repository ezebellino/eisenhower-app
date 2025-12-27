import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../../styles/Navbar.css";

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ocultar navbar en login (opcional)
  const isAuthPage = location.pathname === "/login";
  if (isAuthPage) return null;

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <Link to="/" className="navbar__brand" aria-label="Ir al inicio">
            Eisenhower
          </Link>

          {user && (
            <nav className="navbar__links" aria-label="Navegación principal">
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "is-active" : ""}`
                }
              >
                Mis tareas
              </NavLink>

              <NavLink
                to="/tasks/completed"
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "is-active" : ""}`
                }
              >
                Completadas
              </NavLink>
            </nav>
          )}
        </div>

        <div className="navbar__right">
          {isLoading ? null : user ? (
            <>
              <Link to="/tasks/create" className="btn btn-primary">
                Crear tarea
              </Link>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

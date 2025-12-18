import { Link } from "react-router-dom";
import "../../styles/Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <Link to="/" className="navbar__brand">Eisenhower</Link>

          <nav className="navbar__links">
            <Link to="/completed">Completadas</Link>
          </nav>
        </div>

        <div className="navbar__right">
          <Link to="/create" className="btn-primary">Crear tarea</Link>
        </div>
      </div>
    </header>
  );
}

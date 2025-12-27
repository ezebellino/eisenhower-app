import { Link } from "react-router-dom";
import "../../styles/Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      <h1 className="landing__title">EisenhowerApp</h1>

      <p className="landing__typing">
        Organiza tus tareas por urgencia e importancia, y ejecuta con claridad.
      </p>

      <div className="landing__actions">
        <Link to="/login" className="btn-primary">Iniciar sesión</Link>
        <Link to="/tasks" className="btn-secondary">Ir a mis tareas</Link>
      </div>

      <div className="landing__note">
        <strong>Dato:</strong> "Dwight D. Eisenhower, presidente y general, enfrentaba decisiones críticas cada día. Para distinguir lo urgente de lo importante, creó una matriz simple pero poderosa. Esa herramienta, conocida como la Matriz de Eisenhower, ayuda a priorizar tareas y enfocar la energía en lo que realmente importa. Hoy, con la Eisenhower App, esa misma filosofía está al alcance de tu mano para organizar tu vida y tu trabajo." <br/>
        <p className="landing__p">¡Explora la App!</p> 
      </div>
    </div>
  );
}

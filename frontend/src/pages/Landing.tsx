import { Link } from "react-router-dom";
import "../../styles/Landing.css";

const principles = [
  {
    title: "Decidir primero",
    text: "Separá lo importante de lo que solo hace ruido y mantené foco en lo que mueve resultados.",
  },
  {
    title: "Ejecutar con contexto",
    text: "Cada tarea cae en un cuadrante claro para que el siguiente paso sea evidente.",
  },
  {
    title: "Sostener el ritmo",
    text: "Usá la app en modo personal o iniciá sesión para guardar tu progreso y construir hábito.",
  },
];

export default function Landing() {
  return (
    <main className="page landing">
      <section className="landing__hero">
        <div className="landing__hero-copy">
          <p className="landing__eyebrow">EisenhowerApp</p>
          <h1 className="landing__title">Organizá prioridades con la calma de un buen sistema.</h1>
          <p className="landing__lead">
            Una experiencia simple para decidir qué hacer ahora, qué planificar, qué delegar y
            qué dejar fuera del radar.
          </p>

          <div className="landing__actions">
            <Link to="/tasks" className="btn-primary">
              Abrir dashboard
            </Link>
            <Link to="/login" className="btn-secondary">
              Guardar mis tareas
            </Link>
          </div>

          <div className="landing__trust">
            <div>
              <strong>Sin fricción</strong>
              <span>Probala sin crear cuenta.</span>
            </div>
            <div>
              <strong>Con continuidad</strong>
              <span>Iniciá sesión para guardar tu progreso.</span>
            </div>
            <div>
              <strong>Con enfoque</strong>
              <span>Todo gira alrededor de una sola matriz.</span>
            </div>
          </div>
        </div>

        <div className="landing__hero-visual panel">
          <div className="landing__visual-orbit landing__visual-orbit--top" />
          <div className="landing__visual-orbit landing__visual-orbit--bottom" />

          <div className="landing__matrix-preview">
            <article className="landing__preview-card is-q1">
              <span>Hacer ahora</span>
              <strong>Urgente e importante</strong>
              <p>Resolver lo crítico sin perder claridad.</p>
            </article>
            <article className="landing__preview-card is-q2">
              <span>Planificar</span>
              <strong>Importante, no urgente</strong>
              <p>Reservar tiempo para lo que genera progreso real.</p>
            </article>
            <article className="landing__preview-card is-q3">
              <span>Delegar</span>
              <strong>Urgente, no importante</strong>
              <p>Evitar que lo reactivo consuma toda tu atención.</p>
            </article>
            <article className="landing__preview-card is-q4">
              <span>Descartar</span>
              <strong>Ni urgente ni importante</strong>
              <p>Reducir carga mental y ruido operativo.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing__section landing__section--split">
        <div>
          <p className="landing__section-label">Metodo</p>
          <h2>Una matriz clasica, convertida en una rutina digital más usable.</h2>
        </div>
        <p>
          Dwight D. Eisenhower popularizó la idea de que no todo lo urgente merece prioridad. La
          app toma esa lógica y la convierte en una interfaz clara, rápida y lista para usar todos
          los días.
        </p>
      </section>

      <section className="landing__principles">
        {principles.map((item, index) => (
          <article key={item.title} className="landing__principle">
            <span className="landing__principle-index">0{index + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="landing__cta panel">
        <div>
          <p className="landing__section-label">Empezar</p>
          <h2>Entrá, cargá una tarea y dejá que la matriz haga el trabajo pesado.</h2>
        </div>

        <div className="landing__cta-actions">
          <Link to="/tasks" className="btn-primary">
            Ir a mis tareas
          </Link>
          <Link to="/register" className="btn-ghost">
            Crear cuenta
          </Link>
        </div>
      </section>
    </main>
  );
}

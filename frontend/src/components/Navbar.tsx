import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav style={{
      padding: '1rem',
      background: '#222',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to="/" style={{ marginRight: '1rem', color: '#fff' }}>Inicio</Link>
        <Link to="/completed" style={{ marginRight: '1rem', color: '#fff' }}>Completadas</Link>
      </div>
      <Link to="/create" style={{ color: '#fff', backgroundColor: '#28a745', padding: '0.5rem 1rem', borderRadius: '5px', textDecoration: 'none' }}>
        Crear Tarea
      </Link>
    </nav>
  )
}

export default Navbar

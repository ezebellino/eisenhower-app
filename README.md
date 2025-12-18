# EisenhowerApp 🧠

Aplicación web basada en la **Matriz de Eisenhower** para organizar tareas según su urgencia e importancia.  
Permite priorizar de forma visual, clara y eficiente, separando tareas activas y completadas.

---

## ✨ Características principales

- Creación de tareas con título, descripción y prioridad
- Clasificación automática en los 4 cuadrantes de Eisenhower
- Navegación por tareas mediante controles intuitivos (una tarjeta por cuadrante)
- Vista separada para tareas activas y completadas
- Posibilidad de completar, revertir o eliminar tareas
- Animaciones suaves entre vistas y acciones (Framer Motion)
- UI oscura moderna con sistema de temas centralizado

---

## 🛠️ Tecnologías utilizadas

### Frontend
- **React + Vite**
- **TypeScript**
- **React Router**
- **Framer Motion**
- CSS modular con variables de tema

### Backend
- **FastAPI (Python)**
- **SQLAlchemy**
- **SQLite** (escalable a PostgreSQL)

### Arquitectura
- Separación clara frontend / backend
- Servicios desacoplados para consumo de API
- Componentes reutilizables (EisenhowerMatrix, Card, Navbar)

---

## 🚀 Instalación y ejecución local

### 1. Clonar el repositorio
```bash
git clone https://github.com/ezebellino/eisenhowerapp.git
cd eisenhowerapp
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend
```bash
cd backend
uvicorn main:app --reload
```

## 📱 Responsive design
La aplicación está adaptada para dispositivos móviles:
    - **En pantallas pequeñas, los cuadrantes se muestran en columna**
    - **El orden sigue la prioridad:**
    - *Urgente & Importante -> Importante -> Urgente -> Ni Urgente, ni Importante*

## 🧭 Roadmap / Próximas mejoras

    - Drag & Drop entre cuadrantes

    - Filtros por fecha y búsqueda

    - Soporte multiusuario con autenticación y rol

    - Persistencia en la nube (PostgreSQL / Supabase)

    - Atajos de teclado y mejoras de accesibilidad

## 👨‍💻 Autor
**Ezequiel Bellino**
Github:[www.github.com/ezebellino]

Proyecto desarrollado como parte de mi portfolio profesional FullStack.
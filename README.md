# EisenhowerApp 🧠✅

Una aplicación web basada en la **Matriz de Eisenhower** para organizar tareas según su nivel de urgencia e importancia. Ideal para priorizar, mejorar tu productividad y no dejar nada pendiente.

---

## 🛠️ Tecnologías utilizadas

- **Frontend:** React + Vite
- **Estilos:** CSS personalizado + Animaciones manuales
- **Backend:** FastAPI (Python)
- **Base de datos:** SQLite (puede escalarse a PostgreSQL)
- **Consumo de API:** Fetch desde servicios externos en `taskServices.js`

---

## ⚙️ Funcionalidades principales

- Crear tareas con título, descripción y nivel de prioridad (`urgente` / `importante`)
- Visualizar tareas divididas en 4 cuadrantes según la matriz de Eisenhower
- Marcar tareas como completadas ✅
- Revertir tareas finalizadas con un clic ⬅️
- Eliminar tareas de forma permanente 🗑️
- Animaciones visuales para validaciones y acciones del usuario
- Navegación entre vista de tareas activas y completadas

---

## 🚀 Cómo iniciar el proyecto localmente

### 1. Clonar el repositorio

```bash
git clone https://github.com/ezebellino/eisenhowerapp.git
cd eisenhowerapp
```

### 2. Instalar dependencias del frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Ejecutar el backend (FastAPI)

En otra terminal:

```bash
cd backend
uvicorn main:app --reload
```

> Asegurate de tener instalado `uvicorn`, `fastapi`, `sqlalchemy`, etc.

---

## 🧪 Próximas mejoras

- Efecto 3D con cartas apiladas
- Arrastrar y soltar (Drag & Drop)
- Filtros por fecha y búsqueda
- Soporte multiusuario con autenticación
- Persistencia en la nube (PostgreSQL o Supabase)

---

## 👨‍💻 Autor

**Ezequiel Bellino** — [GitHub](https://github.com/ezebellino)  
Proyecto desarrollado como parte de mi portfolio profesional de desarrollador FullStack.

---

## 📸 Vista previa

> *(Próximamente: captura de pantalla del dashboard con las tareas activas y completadas)*
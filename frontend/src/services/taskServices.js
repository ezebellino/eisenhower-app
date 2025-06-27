const API_URL = "http://localhost:8000/tasks"

export const getAllTasks = async () => {
  const res = await fetch(`${API_URL}/`)
  return await res.json()
}

export const completeTask = async (id) => {
  await fetch(`${API_URL}/${id}/complete`, {
    method: "PATCH"
  })
}

export const uncompleteTask = async (id) => {
  await fetch(`${API_URL}/${id}/uncomplete`, {
    method: "PATCH"
  })
}

export const deleteTask = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  })
}
export const createTask = async (taskData) => {
  await fetch(`${API_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(taskData)
  })
}

export const getCompletedTasks = async () => {
  const res = await fetch(`${API_URL}/completed/`)
  return await res.json()
}
import axios from 'axios'

const TOKEN_KEY = 'taskflow_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

export const getTasks = () => api.get('/api/tasks')
export const getTask = (id) => api.get(`/api/tasks/${id}`)
export const createTask = (data) => api.post('/api/tasks', data)
export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`)
export const updateTaskStatus = (id, status) =>
  api.patch(`/api/tasks/${id}/status`, null, { params: { status } })

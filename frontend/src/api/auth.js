import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export const login = (username, password) =>
  api.post('/api/auth/login', { username, password })

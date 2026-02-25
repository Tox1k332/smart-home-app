import axios from 'axios'

// Для GitHub Pages используем полный URL backend
const getBaseURL = () => {
  // Если запущено на GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    return 'https://sweety52-smart-home-api.hf.space/api'
  }
  // Локально или на других доменах
  return import.meta.env.VITE_API_BASE_URL || '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Не делаем редирект если мы уже на странице логина
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
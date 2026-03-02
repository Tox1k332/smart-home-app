import axios from 'axios'

// Для GitHub Pages используем полный URL backend
const getBaseURL = () => {
  // Если запущено на GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    return 'https://smart-home-api-l5dr.onrender.com/api'
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
    // Не обрабатываем 401 для запросов логина/регистрации
    const isAuthRequest = error.config?.url?.includes('/auth/login') ||
                          error.config?.url?.includes('/auth/register')

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Не делаем редирект если мы уже на странице логина
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
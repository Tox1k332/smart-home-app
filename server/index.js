require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')
const { connectDB } = require('./config/db')
const authRoutes = require('./routes/auth')
const deviceRoutes = require('./routes/devices')
const oauthRoutes = require('./routes/oauth')
const weatherRoutes = require('./routes/weather')
const activityLogsRoutes = require('./routes/activity-logs')

const app = express()
const PORT = process.env.PORT || 3001

// Проверка SMTP настроек
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  console.log('✅ SMTP credentials found:', process.env.SMTP_USER)
} else {
  console.warn('⚠️ SMTP credentials not set — email sending disabled')
}

// Подключаем MongoDB
connectDB().then(({ type }) => {
  console.log(`📊 Database type: ${type}`)
}).catch(err => {
  console.error('Database connection failed:', err)
})

// URL backend для аватарок
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`

// Разрешаем CORS для frontend
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  /\.netlify\.app$/,
  /\.vercel\.app$/,
  /\.github\.io$/  // GitHub Pages
]

app.use(cors({
  origin: function(origin, callback) {
    // Разрешаем requests без origin (mobile apps, curl)
    if (!origin) return callback(null, true)
    
    // Проверяем по whitelist или regex
    const isAllowed = ALLOWED_ORIGINS.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin)
      return allowed === origin
    })
    
    if (isAllowed) {
      callback(null, true)
    } else {
      console.log('Blocked CORS origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json())

// Статическая раздача загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Добавляем URL backend в ответ для аватарок
app.use((req, res, next) => {
  req.backendUrl = BACKEND_URL
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/oauth', oauthRoutes)
app.use('/api/devices', deviceRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api/activity-logs', activityLogsRoutes)

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Smart Home API is running',
    timestamp: new Date().toISOString()
  })
})

// Обработка ошибок 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`)
  console.log(`🖼️ Backend URL: ${BACKEND_URL}`)
})

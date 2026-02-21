const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { users, activityLogs } = require('../config/database')
const { authMiddleware, JWT_SECRET } = require('../middleware/auth')
const { sendVerificationCode, sendPasswordResetCode } = require('../services/email')

const router = express.Router()

// Генерация 6-значного кода подтверждения
function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// Настройка multer для загрузки аватаров
const uploadsDir = path.join(__dirname, '../uploads/avatars')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `avatar-${req.userId}-${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Регистрация (шаг 1: создание аккаунта + отправка кода)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Все поля обязательны' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' })
  }
  if (!/\d/.test(password)) {
    return res.status(400).json({ error: 'Пароль должен содержать хотя бы одну цифру' })
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return res.status(400).json({ error: 'Пароль должен содержать хотя бы один специальный символ' })
  }

  try {
    // Проверка существования подтверждённого пользователя
    const existingUser = users.findByEmail(email)
    if (existingUser && existingUser.email_verified) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' })
    }

    const code = generateVerificationCode()
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 минут

    if (existingUser && !existingUser.email_verified) {
      // Обновляем существующего неподтверждённого пользователя
      const hashedPassword = await bcrypt.hash(password, 10)
      users.update(existingUser.id, {
        name,
        password: hashedPassword,
        verification_code: code,
        verification_code_expires: codeExpires
      })
      sendVerificationCode(email, code, name)
      return res.status(201).json({ needsVerification: true, email })
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создание неподтверждённого пользователя
    users.create({
      name,
      email,
      password: hashedPassword,
      email_verified: false,
      verification_code: code,
      verification_code_expires: codeExpires
    })

    // Отправляем код на email
    sendVerificationCode(email, code, name)

    res.status(201).json({ needsVerification: true, email })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Подтверждение email (шаг 2)
router.post('/verify', (req, res) => {
  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ error: 'Email и код обязательны' })
  }

  try {
    const user = users.findByEmail(email)
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email уже подтверждён' })
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'Неверный код подтверждения' })
    }

    if (new Date() > new Date(user.verification_code_expires)) {
      return res.status(400).json({ error: 'Код истёк. Запросите новый' })
    }

    // Подтверждаем email
    users.update(user.id, {
      email_verified: true,
      verification_code: null,
      verification_code_expires: null
    })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Verify error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Повторная отправка кода
router.post('/resend-code', (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email обязателен' })
  }

  try {
    const user = users.findByEmail(email)
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email уже подтверждён' })
    }

    const code = generateVerificationCode()
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    users.update(user.id, {
      verification_code: code,
      verification_code_expires: codeExpires
    })

    sendVerificationCode(email, code, user.name)

    res.json({ message: 'Код отправлен повторно' })
  } catch (error) {
    console.error('Resend code error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Запрос сброса пароля
router.post('/forgot-password', (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email обязателен' })
  }

  try {
    const user = users.findByEmail(email)

    // Всегда возвращаем успех (защита от перебора email)
    if (!user || !user.email_verified) {
      return res.json({ message: 'Если аккаунт существует, код отправлен' })
    }

    const code = generateVerificationCode()
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    users.update(user.id, {
      reset_code: code,
      reset_code_expires: codeExpires
    })

    sendPasswordResetCode(email, code, user.name)

    res.json({ message: 'Если аккаунт существует, код отправлен' })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Сброс пароля по коду
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Все поля обязательны' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' })
  }
  if (!/\d/.test(newPassword)) {
    return res.status(400).json({ error: 'Пароль должен содержать хотя бы одну цифру' })
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword)) {
    return res.status(400).json({ error: 'Пароль должен содержать хотя бы один специальный символ' })
  }

  try {
    const user = users.findByEmail(email)
    if (!user) {
      return res.status(400).json({ error: 'Неверный код' })
    }

    if (!user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ error: 'Неверный код' })
    }

    if (new Date() > new Date(user.reset_code_expires)) {
      return res.status(400).json({ error: 'Код истёк. Запросите новый' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    users.update(user.id, {
      password: hashedPassword,
      reset_code: null,
      reset_code_expires: null
    })

    res.json({ message: 'Пароль успешно сброшен' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Вход
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Все поля обязательны' })
  }

  try {
    const user = users.findByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    // Проверка подтверждения email
    if (user.email_verified === false) {
      return res.status(403).json({
        error: 'Email не подтверждён',
        needsVerification: true,
        email: user.email
      })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

    activityLogs.add(user.id, 'user_login', {})

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Получение текущего пользователя
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = users.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Обновление профиля (имя, email)
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { name, email } = req.body
    const user = users.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const updates = {}
    if (name && name.trim()) updates.name = name.trim()
    if (email && email.trim()) {
      const existing = users.findByEmail(email.trim())
      if (existing && existing.id !== req.userId) {
        return res.status(400).json({ error: 'Этот email уже используется' })
      }
      updates.email = email.trim()
    }

    const updated = users.update(req.userId, updates)
    activityLogs.add(req.userId, 'profile_update', {})
    res.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar || null,
        created_at: updated.created_at
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Смена пароля
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Все поля обязательны' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Новый пароль должен содержать минимум 8 символов' })
    }
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ error: 'Пароль должен содержать хотя бы одну цифру' })
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword)) {
      return res.status(400).json({ error: 'Пароль должен содержать хотя бы один специальный символ' })
    }

    const user = users.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return res.status(400).json({ error: 'Неверный текущий пароль' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    users.update(req.userId, { password: hashedPassword })
    activityLogs.add(req.userId, 'password_change', {})

    res.json({ message: 'Пароль успешно изменён' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Загрузка аватара
router.post('/avatar', authMiddleware, (req, res) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Файл слишком большой (макс. 5MB)' })
      }
      return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Файл не выбран' })
    }

    try {
      const user = users.findById(req.userId)
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      // Удаляем старый аватар если есть
      if (user.avatar) {
        const oldPath = path.join(__dirname, '..', user.avatar)
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath)
        }
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`
      users.update(req.userId, { avatar: avatarPath })

      res.json({ avatar: avatarPath })
    } catch (error) {
      console.error('Avatar upload error:', error)
      res.status(500).json({ error: 'Ошибка сервера' })
    }
  })
})

// Удаление аватара
router.delete('/avatar', authMiddleware, (req, res) => {
  try {
    const user = users.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', user.avatar)
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath)
      }
      users.update(req.userId, { avatar: null })
    }

    res.json({ message: 'Аватар удалён' })
  } catch (error) {
    console.error('Delete avatar error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Удаление аккаунта
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body
    if (!password) {
      return res.status(400).json({ error: 'Введите пароль для подтверждения' })
    }

    const user = users.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(400).json({ error: 'Неверный пароль' })
    }

    // Удаляем аватар файл
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', user.avatar)
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath)
      }
    }

    // Удаляем пользователя (каскадно удалит устройства)
    users.delete(req.userId)

    res.json({ message: 'Аккаунт удалён' })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

module.exports = router

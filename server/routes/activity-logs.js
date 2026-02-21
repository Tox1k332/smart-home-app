const express = require('express')
const { activityLogs } = require('../config/database')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.use(authMiddleware)

// Получить логи действий пользователя
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const logs = activityLogs.findByUserId(req.userId, limit)
    res.json({ logs })
  } catch (error) {
    console.error('Get activity logs error:', error)
    res.status(500).json({ error: 'Ошибка при загрузке логов' })
  }
})

module.exports = router

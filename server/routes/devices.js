const express = require('express')
const { devices, activityLogs } = require('../config/database')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// Все роуты требуют авторизации
router.use(authMiddleware)

// Получить все устройства пользователя
router.get('/', (req, res) => {
  try {
    const userDevices = devices.findByUserId(req.userId)
    res.json({ devices: userDevices })
  } catch (error) {
    console.error('Get devices error:', error)
    res.status(500).json({ error: 'Ошибка при загрузке устройств' })
  }
})

// Получить одно устройство
router.get('/:id', (req, res) => {
  try {
    const deviceId = parseInt(req.params.id)
    const device = devices.findById(deviceId, req.userId)

    if (!device) {
      return res.status(404).json({ error: 'Устройство не найдено' })
    }

    res.json({ device })
  } catch (error) {
    console.error('Get device error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Добавить новое устройство
router.post('/', (req, res) => {
  const { name, type, room, properties } = req.body

  if (!name || !type || !room) {
    return res.status(400).json({ error: 'Все поля обязательны' })
  }

  const validTypes = ['light', 'thermostat', 'camera', 'lock', 'speaker', 'tv', 'socket', 'sensor']
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Недопустимый тип устройства' })
  }

  try {
    const deviceData = { user_id: req.userId, name, type, room }
    if (properties && typeof properties === 'object') {
      deviceData.properties = properties
    }
    const device = devices.create(deviceData)

    activityLogs.add(req.userId, 'device_add', { device_name: device.name })
    res.status(201).json({ device })
  } catch (error) {
    console.error('Create device error:', error)
    res.status(500).json({ error: 'Ошибка при добавлении устройства' })
  }
})

// Обновить устройство
router.put('/:id', (req, res) => {
  const { name, type, room, is_on, is_favorite } = req.body
  const deviceId = parseInt(req.params.id)

  try {
    // Проверка существования устройства
    const existingDevice = devices.findById(deviceId, req.userId)
    if (!existingDevice) {
      return res.status(404).json({ error: 'Устройство не найдено' })
    }

    const { properties } = req.body
    const updates = {}
    const changes = []

    if (name !== undefined) updates.name = name
    if (type !== undefined) updates.type = type
    if (room !== undefined) updates.room = room
    if (is_on !== undefined) updates.is_on = is_on
    if (is_favorite !== undefined) updates.is_favorite = is_favorite
    if (properties !== undefined && typeof properties === 'object') {
      updates.properties = { ...existingDevice.properties, ...properties }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' })
    }

    const updatedDevice = devices.update(deviceId, req.userId, updates)

    // Логирование с детальной информацией
    if (is_on !== undefined && is_on !== existingDevice.is_on) {
      activityLogs.add(req.userId, is_on ? 'device_on' : 'device_off', { device_name: existingDevice.name })
    } else if (is_on === undefined) {
      // Собираем информацию о том, что изменилось
      if (name !== undefined && name !== existingDevice.name) {
        changes.push({ field: 'name', from: existingDevice.name, to: name })
      }
      if (room !== undefined && room !== existingDevice.room) {
        changes.push({ field: 'room', from: existingDevice.room, to: room })
      }
      if (type !== undefined && type !== existingDevice.type) {
        changes.push({ field: 'type', from: existingDevice.type, to: type })
      }
      if (properties !== undefined && typeof properties === 'object') {
        // Проверяем каждое свойство properties на изменение
        for (const key in properties) {
          if (existingDevice.properties[key] !== properties[key]) {
            changes.push({
              field: 'property',
              property_name: key,
              from: existingDevice.properties[key],
              to: properties[key]
            })
          }
        }
      }

      activityLogs.add(req.userId, 'device_update', {
        device_name: existingDevice.name,
        changes: changes.length > 0 ? changes : undefined
      })
    }

    res.json({ device: updatedDevice })
  } catch (error) {
    console.error('Update device error:', error)
    res.status(500).json({ error: 'Ошибка при обновлении устройства' })
  }
})

// Удалить устройство
router.delete('/:id', (req, res) => {
  try {
    const deviceId = parseInt(req.params.id)
    const existingDevice = devices.findById(deviceId, req.userId)
    const deleted = devices.delete(deviceId, req.userId)

    if (!deleted) {
      return res.status(404).json({ error: 'Устройство не найдено' })
    }

    activityLogs.add(req.userId, 'device_delete', { device_name: existingDevice.name })
    res.json({ message: 'Устройство успешно удалено' })
  } catch (error) {
    console.error('Delete device error:', error)
    res.status(500).json({ error: 'Ошибка при удалении устройства' })
  }
})

module.exports = router

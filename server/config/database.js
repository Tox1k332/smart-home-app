const fs = require('fs')
const path = require('path')

// Путь к файлу базы данных
const dbPath = path.join(__dirname, '../database/db.json')
const dbDir = path.join(__dirname, '../database')

// Структура базы данных
const defaultDb = {
  users: [],
  devices: [],
  activityLogs: [],
  nextUserId: 1,
  nextDeviceId: 1,
  nextLogId: 1
}

// Создаем директорию если её нет
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Создаем файл БД если его нет
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2))
}

// Чтение базы данных
function readDb() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading database:', error)
    return defaultDb
  }
}

// Запись в базу данных
function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing database:', error)
    return false
  }
}

// API для работы с пользователями
const users = {
  findByEmail(email) {
    const db = readDb()
    return db.users.find(u => u.email === email)
  },

  findById(id) {
    const db = readDb()
    return db.users.find(u => u.id === id)
  },

  findByOAuthId(provider, oauthId) {
    const db = readDb()
    return db.users.find(u => u.oauth_provider === provider && u.oauth_id === oauthId)
  },

  create(userData) {
    const db = readDb()
    const user = {
      id: db.nextUserId,
      ...userData,
      created_at: new Date().toISOString()
    }
    db.users.push(user)
    db.nextUserId++
    writeDb(db)
    return user
  },

  update(id, updates) {
    const db = readDb()
    const index = db.users.findIndex(u => u.id === id)
    if (index === -1) return null

    db.users[index] = { ...db.users[index], ...updates }
    writeDb(db)
    return db.users[index]
  },

  delete(id) {
    const db = readDb()
    const index = db.users.findIndex(u => u.id === id)
    if (index === -1) return false

    db.users.splice(index, 1)
    // Также удаляем все устройства пользователя
    db.devices = db.devices.filter(d => d.user_id !== id)
    writeDb(db)
    return true
  }
}

// API для работы с устройствами
const devices = {
  findByUserId(userId) {
    const db = readDb()
    return db.devices.filter(d => d.user_id === userId)
  },

  findById(id, userId) {
    const db = readDb()
    return db.devices.find(d => d.id === id && d.user_id === userId)
  },

  getDefaultProperties(type) {
    const defaults = {
      thermostat: { temperature: 22, target_temperature: 23 },
      sensor: { temperature: 20 },
      lock: { locked: true }
    }
    return defaults[type] || {}
  },

  create(deviceData) {
    const db = readDb()
    const device = {
      id: db.nextDeviceId,
      ...deviceData,
      properties: deviceData.properties || this.getDefaultProperties(deviceData.type),
      is_on: false,
      is_favorite: false,
      created_at: new Date().toISOString()
    }
    db.devices.push(device)
    db.nextDeviceId++
    writeDb(db)
    return device
  },

  update(id, userId, updates) {
    const db = readDb()
    const index = db.devices.findIndex(d => d.id === id && d.user_id === userId)
    if (index === -1) return null

    db.devices[index] = { ...db.devices[index], ...updates }
    writeDb(db)
    return db.devices[index]
  },

  delete(id, userId) {
    const db = readDb()
    const index = db.devices.findIndex(d => d.id === id && d.user_id === userId)
    if (index === -1) return false

    db.devices.splice(index, 1)
    writeDb(db)
    return true
  }
}

// API для работы с логами действий
const activityLogs = {
  add(userId, action, details = {}) {
    const db = readDb()
    if (!db.activityLogs) db.activityLogs = []
    if (!db.nextLogId) db.nextLogId = 1

    const log = {
      id: db.nextLogId,
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    }
    db.activityLogs.push(log)
    db.nextLogId++
    writeDb(db)
    return log
  },

  findByUserId(userId, limit = 50) {
    const db = readDb()
    if (!db.activityLogs) return []
    return db.activityLogs
      .filter(l => l.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
  }
}

console.log('✅ JSON Database initialized at:', dbPath)

module.exports = { users, devices, activityLogs }

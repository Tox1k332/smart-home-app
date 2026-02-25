const { MongoClient } = require('mongodb')
const jsonDb = require('./database')

let db = null
let client = null

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI

  // Если есть MongoDB URI - используем MongoDB, иначе JSON файл
  if (mongoUri) {
    try {
      client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      await client.connect()
      db = client.db('smart-home-app')

      // Проверка подключения
      await client.db().admin().ping()
      console.log('✅ MongoDB connected')

      // Создаём индексы
      await db.collection('users').createIndex({ email: 1 }, { unique: true })
      await db.collection('devices').createIndex({ user_id: 1 })
      await db.collection('activityLogs').createIndex({ user_id: 1, created_at: -1 })

      // Экспортируем MongoDB адаптер
      module.exports.users = createUsersAdapter(db)
      module.exports.devices = createDevicesAdapter(db)
      module.exports.activityLogs = createActivityLogsAdapter(db)

      return { type: 'mongodb', db }
    } catch (error) {
      console.error('MongoDB connection error:', error.message)
      console.log('⚠️ Falling back to JSON file database')
      
      // Закрываем соединение если оно было
      if (client) {
        await client.close().catch(() => {})
      }
    }
  }

  // Fallback to JSON file
  module.exports.users = jsonDb.users
  module.exports.devices = jsonDb.devices
  module.exports.activityLogs = jsonDb.activityLogs

  return { type: 'json', db: jsonDb }
}

// MongoDB адаптеры
function createUsersAdapter(db) {
  return {
    async findByEmail(email) {
      return await db.collection('users').findOne({ email })
    },
    async findById(id) {
      return await db.collection('users').findOne({ _id: id })
    },
    async findByOAuthId(provider, oauthId) {
      return await db.collection('users').findOne({ oauth_provider: provider, oauth_id: oauthId })
    },
    async create(userData) {
      const result = await db.collection('users').insertOne(userData)
      return { id: result.insertedId, ...userData }
    },
    async update(id, updates) {
      await db.collection('users').updateOne({ _id: id }, { $set: updates })
      return await db.collection('users').findOne({ _id: id })
    },
    async delete(id) {
      await db.collection('users').deleteOne({ _id: id })
      await db.collection('devices').deleteMany({ user_id: id })
      return true
    }
  }
}

function createDevicesAdapter(db) {
  return {
    findByUserId(userId) {
      return db.collection('devices').find({ user_id: userId }).toArray()
    },
    findById(id, userId) {
      return db.collection('devices').findOne({ _id: id, user_id: userId })
    },
    getDefaultProperties(type) {
      const defaults = {
        thermostat: { temperature: 22, target_temperature: 23 },
        sensor: { temperature: 20 },
        lock: { locked: true }
      }
      return defaults[type] || {}
    },
    async create(deviceData) {
      const device = {
        ...deviceData,
        properties: deviceData.properties || this.getDefaultProperties(deviceData.type),
        is_on: false,
        is_favorite: false,
        created_at: new Date().toISOString()
      }
      const result = await db.collection('devices').insertOne(device)
      return { _id: result.insertedId, ...device }
    },
    async update(id, userId, updates) {
      await db.collection('devices').updateOne({ _id: id, user_id: userId }, { $set: updates })
      return await db.collection('devices').findOne({ _id: id, user_id: userId })
    },
    async delete(id, userId) {
      await db.collection('devices').deleteOne({ _id: id, user_id: userId })
      return true
    }
  }
}

function createActivityLogsAdapter(db) {
  return {
    async add(userId, action, details = {}) {
      const log = {
        user_id: userId,
        action,
        details,
        created_at: new Date().toISOString()
      }
      const result = await db.collection('activityLogs').insertOne(log)
      return { _id: result.insertedId, ...log }
    },
    findByUserId(userId, limit = 50) {
      return db.collection('activityLogs')
        .find({ user_id: userId })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray()
    }
  }
}

module.exports = { connectDB }

require('dotenv').config()
const { MongoClient } = require('mongodb')

let db = null
let client = null

async function connectDB() {
  // Если есть MongoDB URI - используем MongoDB, иначе JSON файл
  if (process.env.MONGODB_URI) {
    try {
      client = new MongoClient(process.env.MONGODB_URI)
      await client.connect()
      db = client.db('smart-home-app')
      
      // Создаём индексы
      await db.collection('users').createIndex({ email: 1 }, { unique: true })
      await db.collection('devices').createIndex({ user_id: 1 })
      await db.collection('activityLogs').createIndex({ user_id: 1, created_at: -1 })
      
      console.log('✅ MongoDB connected')
      return { type: 'mongodb', db }
    } catch (error) {
      console.error('MongoDB connection error:', error.message)
      console.log('⚠️ Falling back to JSON file database')
    }
  }
  
  // Fallback to JSON file
  const jsonDb = require('./database-json')
  return { type: 'json', db: jsonDb }
}

module.exports = { connectDB }

/**
 * Скрипт для очистки базы данных (для тестирования)
 * 
 * Использование:
 *   node server/scripts/clear-db.js
 * 
 * или с флагом для подтверждения:
 *   node server/scripts/clear-db.js --confirm
 */

require('dotenv').config()
const { MongoClient } = require('mongodb')

async function clearDatabase() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('❌ MONGODB_URI not set in environment variables')
    process.exit(1)
  }

  console.log('🔍 Connecting to MongoDB...')
  
  const client = new MongoClient(mongoUri)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('smart-home-app')
    
    // Получаем список коллекций
    const collections = await db.listCollections().toArray()
    
    if (collections.length === 0) {
      console.log('ℹ️ No collections found')
      return
    }
    
    console.log('\n📊 Found collections:')
    collections.forEach(col => console.log(`   - ${col.name}`))
    console.log('')
    
    // Проверяем флаг подтверждения
    const confirmFlag = process.argv.includes('--confirm')
    
    if (!confirmFlag) {
      console.log('⚠️  This will DELETE ALL DATA from the database!')
      console.log('ℹ️  Run with --confirm flag to proceed:')
      console.log('   node server/scripts/clear-db.js --confirm\n')
      return
    }
    
    // Удаляем все коллекции
    for (const collection of collections) {
      const result = await db.collection(collection.name).deleteMany({})
      console.log(`🗑️  Deleted ${result.deletedCount} documents from ${collection.name}`)
    }
    
    console.log('\n✅ Database cleared successfully!\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await client.close()
    console.log('👋 Disconnected from MongoDB')
  }
}

clearDatabase()

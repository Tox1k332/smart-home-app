const express = require('express')
const router = express.Router()

const API_KEY = process.env.OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

// GET /api/weather?city=Moscow&lang=ru
router.get('/', async (req, res) => {
  try {
    const city = req.query.city || 'Moscow'
    const lang = req.query.lang || 'en'

    const weatherUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&lang=${lang}&appid=${API_KEY}`
    const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&lang=${lang}&appid=${API_KEY}`

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl)
    ])

    if (!weatherRes.ok) {
      const err = await weatherRes.json()
      return res.status(weatherRes.status).json({ error: err.message || 'Weather API error' })
    }

    const weatherData = await weatherRes.json()
    const forecastData = forecastRes.ok ? await forecastRes.json() : null

    // Текущая погода
    const current = {
      location: `${weatherData.name}, ${weatherData.sys.country}`,
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      tempMin: Math.round(weatherData.main.temp_min),
      tempMax: Math.round(weatherData.main.temp_max),
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      condition: weatherData.weather[0].main
    }

    // Прогноз на 3 дня (берём данные на полдень каждого дня)
    let forecast = []
    if (forecastData && forecastData.list) {
      const today = new Date().getDate()
      const dailyMap = {}

      for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000)
        const day = date.getDate()

        // Пропускаем сегодня
        if (day === today) continue

        // Берём запись ближайшую к 12:00 для каждого дня
        const hour = date.getHours()
        if (!dailyMap[day] || Math.abs(hour - 12) < Math.abs(new Date(dailyMap[day].dt * 1000).getHours() - 12)) {
          dailyMap[day] = item
        }
      }

      forecast = Object.values(dailyMap).slice(0, 3).map(item => {
        const date = new Date(item.dt * 1000)
        return {
          date: date.toISOString(),
          dayOfWeek: date.getDay(),
          temperature: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          condition: item.weather[0].main
        }
      })
    }

    res.json({ current, forecast })
  } catch (err) {
    console.error('Weather API error:', err.message)
    res.status(500).json({ error: 'Failed to fetch weather data' })
  }
})

module.exports = router

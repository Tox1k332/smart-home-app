const express = require('express')
const router = express.Router()

// Open-Meteo API - бесплатный, не требует ключа
// Документация: https://open-meteo.com/en/docs
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'

// Коды погоды WMO: https://open-meteo.com/en/docs
const WEATHER_CODES = {
  0: { condition: 'clear', description: 'Ясно', icon: '01d' },
  1: { condition: 'partly-cloudy', description: 'Преимущественно ясно', icon: '02d' },
  2: { condition: 'partly-cloudy', description: 'Переменная облачность', icon: '03d' },
  3: { condition: 'cloudy', description: 'Пасмурно', icon: '04d' },
  45: { condition: 'foggy', description: 'Туман', icon: '50d' },
  48: { condition: 'foggy', description: 'Иней', icon: '50d' },
  51: { condition: 'drizzle', description: 'Морось', icon: '09d' },
  53: { condition: 'drizzle', description: 'Морось', icon: '09d' },
  55: { condition: 'drizzle', description: 'Морось', icon: '09d' },
  61: { condition: 'rainy', description: 'Дождь', icon: '10d' },
  63: { condition: 'rainy', description: 'Дождь', icon: '10d' },
  65: { condition: 'rainy', description: 'Сильный дождь', icon: '10d' },
  71: { condition: 'snowy', description: 'Снег', icon: '13d' },
  73: { condition: 'snowy', description: 'Снег', icon: '13d' },
  75: { condition: 'snowy', description: 'Сильный снег', icon: '13d' },
  77: { condition: 'snowy', description: 'Снежные зёрна', icon: '13d' },
  80: { condition: 'rainy', description: 'Ливень', icon: '10d' },
  81: { condition: 'rainy', description: 'Сильный ливень', icon: '10d' },
  82: { condition: 'rainy', description: 'Очень сильный ливень', icon: '10d' },
  85: { condition: 'snowy', description: 'Снежные ливни', icon: '13d' },
  86: { condition: 'snowy', description: 'Сильные снежные ливни', icon: '13d' },
  95: { condition: 'stormy', description: 'Гроза', icon: '11d' },
  96: { condition: 'stormy', description: 'Гроза с градом', icon: '11d' },
  99: { condition: 'stormy', description: 'Сильная гроза с градом', icon: '11d' }
}

// Перевод описаний погоды
const WEATHER_TRANSLATIONS = {
  ru: {
    'Ясно': 'Ясно',
    'Преимущественно ясно': 'Преимущественно ясно',
    'Переменная облачность': 'Переменная облачность',
    'Пасмурно': 'Пасмурно',
    'Туман': 'Туман',
    'Иней': 'Иней',
    'Морось': 'Морось',
    'Дождь': 'Дождь',
    'Сильный дождь': 'Сильный дождь',
    'Снег': 'Снег',
    'Сильный снег': 'Сильный снег',
    'Снежные зёрна': 'Снежные зёрна',
    'Ливень': 'Ливень',
    'Сильный ливень': 'Сильный ливень',
    'Очень сильный ливень': 'Очень сильный ливень',
    'Снежные ливни': 'Снежные ливни',
    'Сильные снежные ливни': 'Сильные снежные ливни',
    'Гроза': 'Гроза',
    'Гроза с градом': 'Гроза с градом',
    'Сильная гроза с градом': 'Сильная гроза с градом'
  },
  en: {
    'Ясно': 'Clear sky',
    'Преимущественно ясно': 'Mostly clear',
    'Переменная облачность': 'Partly cloudy',
    'Пасмурно': 'Overcast',
    'Туман': 'Fog',
    'Иней': 'Rime ice',
    'Морось': 'Drizzle',
    'Дождь': 'Rain',
    'Сильный дождь': 'Heavy rain',
    'Снег': 'Snow',
    'Сильный снег': 'Heavy snow',
    'Снежные зёрна': 'Snow grains',
    'Ливень': 'Rain showers',
    'Сильный ливень': 'Heavy rain showers',
    'Очень сильный ливень': 'Violent rain showers',
    'Снежные ливни': 'Snow showers',
    'Сильные снежные ливни': 'Heavy snow showers',
    'Гроза': 'Thunderstorm',
    'Гроза с градом': 'Thunderstorm with hail',
    'Сильная гроза с градом': 'Violent thunderstorm with hail'
  },
  fi: {
    'Ясно': 'Selkeää',
    'Преимущественно ясно': 'Enimmäkseen selkeää',
    'Переменная облачность': 'Puolipilvistä',
    'Пасмурно': 'Pilvistä',
    'Туман': 'Sumuista',
    'Иней': 'Huurre',
    'Морось': 'Tihkusadetta',
    'Дождь': 'Sadetta',
    'Сильный дождь': 'Voimakasta sadetta',
    'Снег': 'Lumisadetta',
    'Сильный снег': 'Voimakasta lumisadetta',
    'Снежные зёрна': 'Lumijyväsiä',
    'Ливень': 'Sadekuuroja',
    'Сильный ливень': 'Voimakkaita sadekuuroja',
    'Очень сильный ливень': 'Erittäin voimakkaita sadekuuroja',
    'Снежные ливни': 'Lumikuuroja',
    'Сильные снежные ливни': 'Voimakkaita lumikuuroja',
    'Гроза': 'Ukkonen',
    'Гроза с градом': 'Ukkonen ja raekuuroja',
    'Сильная гроза с градом': 'Voimakas ukkonen ja raekuuroja'
  }
}

function getWeatherDescription(code, lang = 'ru') {
  const weather = WEATHER_CODES[code] || { condition: 'partly-cloudy', description: 'Переменная облачность', icon: '03d' }
  const translations = WEATHER_TRANSLATIONS[lang] || WEATHER_TRANSLATIONS.ru
  return {
    description: translations[weather.description] || weather.description,
    condition: weather.condition,
    icon: weather.icon
  }
}

// GET /api/weather?city=Moscow&lang=ru
router.get('/', async (req, res) => {
  try {
    const city = req.query.city || 'Moscow'
    const lang = req.query.lang || 'ru'

    // 1. Геокодинг: ищем город
    const geoRes = await fetch(`${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=${lang}&format=json`)
    
    if (!geoRes.ok) {
      return res.status(404).json({ error: 'City not found' })
    }

    const geoData = await geoRes.json()
    
    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: 'City not found' })
    }

    const location = geoData.results[0]
    const { latitude, longitude, name, country, admin1 } = location

    // 2. Получаем погоду
    const weatherParams = new URLSearchParams({
      latitude,
      longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'auto',
      forecast_days: '4'
    })

    const weatherRes = await fetch(`${WEATHER_URL}?${weatherParams}`)

    if (!weatherRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch weather data' })
    }

    const weatherData = await weatherRes.json()
    const current = weatherData.current
    const daily = weatherData.daily

    // Текущая погода
    const weatherInfo = getWeatherDescription(current.weather_code, lang)
    
    const currentWeather = {
      location: `${name}, ${country}`,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
      condition: weatherInfo.condition
    }

    // Прогноз на 3 дня (пропускаем сегодня)
    const forecast = []
    const today = new Date().toISOString().split('T')[0]
    
    for (let i = 1; i < daily.time.length && forecast.length < 3; i++) {
      const date = daily.time[i]
      if (date === today) continue

      const forecastWeather = getWeatherDescription(daily.weather_code[i], lang)
      const tempMax = Math.round(daily.temperature_2m_max[i])
      const tempMin = Math.round(daily.temperature_2m_min[i])
      const temp = Math.round((tempMax + tempMin) / 2)

      forecast.push({
        date,
        dayOfWeek: new Date(date).getDay(),
        temperature: temp,
        description: forecastWeather.description,
        icon: forecastWeather.icon,
        condition: forecastWeather.condition
      })
    }

    res.json({ current: currentWeather, forecast })
  } catch (err) {
    console.error('Weather API error:', err.message)
    res.status(500).json({ error: 'Failed to fetch weather data' })
  }
})

module.exports = router

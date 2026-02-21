<template>
  <div class="status-page">
    <Navbar>
      <router-link to="/dashboard" class="header-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        {{ t('nav.home') }}
      </router-link>

      <router-link to="/profile" class="header-btn header-btn-primary">
        {{ t('nav.profile') }}
      </router-link>
    </Navbar>

    <div class="status-content">
      <div class="container">
        <h1 class="page-title">{{ t('status.title') }}</h1>
        <p class="page-subtitle">{{ t('status.subtitle') }}</p>

        <div class="status-grid">
          <!-- Погода -->
          <div class="status-card weather-card">
            <div class="card-header">
              <h3>🌤️ {{ t('status.weather') }}</h3>
              <div class="weather-city-input">
                <input
                  v-model="weatherCity"
                  class="city-input"
                  :placeholder="t('status.enterCity')"
                  @keyup.enter="fetchWeather"
                />
                <button @click="fetchWeather" class="refresh-btn" :disabled="weatherLoading">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spinning': weatherLoading }">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="weather-location">{{ weather.location }}</div>

            <div v-if="weatherLoading" class="weather-loading">{{ t('common.loading') }}</div>
            <div v-else-if="weatherError" class="weather-error">{{ weatherError }}</div>

            <div class="weather-main">
              <div class="temperature">{{ weather.temperature }}°C</div>
              <div class="weather-icon">
                <img v-if="weather.icon" :src="'https://openweathermap.org/img/wn/' + weather.icon + '@2x.png'" :alt="weather.description" style="width: 80px; height: 80px;">
                <span v-else>{{ getWeatherIcon(weather.condition) }}</span>
              </div>
            </div>

            <div class="weather-description">{{ weather.description || t('status.weatherDescPartlyCloudy') }}</div>

            <div class="weather-details">
              <div class="detail-item">
                <span class="detail-icon">💧</span>
                <span class="detail-label">{{ t('status.humidity') }}</span>
                <span class="detail-value">{{ weather.humidity }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">💨</span>
                <span class="detail-label">{{ t('status.wind') }}</span>
                <span class="detail-value">{{ weather.windSpeed }} {{ t('status.ms') }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🌡️</span>
                <span class="detail-label">{{ t('status.feelsLike') }}</span>
                <span class="detail-value">{{ weather.feelsLike }}°C</span>
              </div>
            </div>

            <div class="forecast">
              <div class="forecast-title">{{ t('status.forecast3days') }}</div>
              <div class="forecast-items">
                <div v-for="day in forecast" :key="day.day" class="forecast-item">
                  <div class="forecast-day">{{ day.day }}</div>
                  <div class="forecast-icon">
                    <img v-if="day.icon" :src="'https://openweathermap.org/img/wn/' + day.icon + '@2x.png'" :alt="day.description" style="width: 48px; height: 48px;">
                    <span v-else>{{ getWeatherIcon(day.condition) }}</span>
                  </div>
                  <div class="forecast-temp">{{ day.temp }}°C</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Температура комнат -->
          <div class="status-card temperature-card">
            <div class="card-header">
              <h3>🌡️ {{ t('status.roomTemperatures') }}</h3>
              <button @click="refreshTemperature" class="refresh-btn" :disabled="refreshing">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spinning': refreshing }">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>

            <div v-if="hasTemperatureDevices" class="rooms-temperature">
              <div v-for="room in roomTemperatures" :key="room.name" class="room-temp-item">
                <div class="room-temp-header">
                  <span class="room-icon">{{ getRoomIcon(room.name) }}</span>
                  <span class="room-name">{{ room.name }}</span>
                </div>
                <div class="temp-display">
                  <div class="temp-value">{{ room.temperature }}°C</div>
                  <div :class="['temp-status', getTempStatus(room.temperature)]">
                    {{ getTempStatusText(room.temperature) }}
                  </div>
                </div>
                <div class="temp-bar">
                  <div class="temp-bar-fill" :style="{ width: getTempBarWidth(room.temperature) }"></div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">🌡️</div>
              <div class="empty-text">{{ t('status.noTemperatureDevices') }}</div>
              <div class="empty-hint">{{ t('status.addThermostatHint') }}</div>
            </div>

            <div v-if="hasTemperatureDevices" class="average-temp">
              <span>{{ t('status.averageTemp') }}:</span>
              <strong>{{ averageTemperature }}°C</strong>
            </div>
          </div>

          <!-- Качество воздуха -->
          <div class="status-card air-quality-card">
            <div class="card-header">
              <h3>💨 {{ t('status.airQuality') }}</h3>
            </div>

            <div class="air-quality-main">
              <div class="aqi-circle" :class="getAQIClass(airQuality.aqi)">
                <div class="aqi-value">{{ airQuality.aqi }}</div>
                <div class="aqi-label">AQI</div>
              </div>
              <div class="aqi-description">
                <div class="aqi-status">{{ getAQIStatus(airQuality.aqi) }}</div>
                <div class="aqi-text">{{ getAQIDescription(airQuality.aqi) }}</div>
              </div>
            </div>

            <div class="air-parameters">
              <div class="air-param">
                <span class="param-label">CO₂</span>
                <span class="param-value">{{ airQuality.co2 }} ppm</span>
                <div class="param-bar">
                  <div class="param-bar-fill" :style="{ width: (airQuality.co2 / 2000 * 100) + '%' }"></div>
                </div>
              </div>
              <div class="air-param">
                <span class="param-label">PM2.5</span>
                <span class="param-value">{{ airQuality.pm25 }} µg/m³</span>
                <div class="param-bar">
                  <div class="param-bar-fill" :style="{ width: (airQuality.pm25 / 100 * 100) + '%' }"></div>
                </div>
              </div>
              <div class="air-param">
                <span class="param-label">{{ t('status.humidity') }}</span>
                <span class="param-value">{{ airQuality.humidity }}%</span>
                <div class="param-bar">
                  <div class="param-bar-fill" :style="{ width: airQuality.humidity + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Энергопотребление -->
          <div class="status-card energy-card">
            <div class="card-header">
              <h3>⚡ {{ t('status.energy') }}</h3>
              <span class="period">{{ t('status.today') }}</span>
            </div>

            <div class="energy-main">
              <div class="energy-value">{{ energy.current }} {{ t('status.kWhUnit') }}</div>
              <div class="energy-comparison">
                <span :class="['comparison-badge', energy.change > 0 ? 'badge-up' : 'badge-down']">
                  {{ energy.change > 0 ? '+' : '' }}{{ energy.change }}%
                </span>
                <span class="comparison-text">{{ t('status.thanYesterday') }}</span>
              </div>
            </div>

            <div class="energy-chart">
              <div class="chart-bars">
                <div v-for="(hour, index) in energy.hourly" :key="index" class="chart-bar">
                  <div class="bar-fill" :style="{ height: (hour / Math.max(...energy.hourly) * 100) + '%' }"></div>
                  <div class="bar-label">{{ index }}</div>
                </div>
              </div>
            </div>

            <div class="energy-devices">
              <div class="device-energy-title">{{ t('status.topConsumers') }}</div>
              <div v-for="device in topEnergyDevices" :key="device.name" class="device-energy-item">
                <span class="device-energy-name">{{ device.icon }} {{ device.name }}</span>
                <span class="device-energy-value">{{ device.consumption }} {{ t('status.wattUnit') }}</span>
              </div>
            </div>
          </div>

          <!-- Безопасность -->
          <div class="status-card security-card">
            <div class="card-header">
              <h3>🔒 {{ t('status.security') }}</h3>
              <span v-if="hasSecurityDevices" :class="['status-indicator', security.allSecure ? 'status-secure' : 'status-alert']">
                {{ security.allSecure ? t('status.allSecure') : t('status.needsAttention') }}
              </span>
            </div>

            <div v-if="hasSecurityDevices" class="security-items">
              <div v-for="item in security.items" :key="item.name" class="security-item">
                <div class="security-icon" :class="{ 'icon-alert': !item.secure }">
                  {{ item.icon }}
                </div>
                <div class="security-info">
                  <div class="security-name">{{ item.name }}</div>
                  <div :class="['security-status', item.secure ? 'status-ok' : 'status-warning']">
                    {{ item.status }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">🔒</div>
              <div class="empty-text">{{ t('status.noSecurityDevices') }}</div>
              <div class="empty-hint">{{ t('status.addSecurityHint') }}</div>
            </div>
          </div>

          <!-- Системная информация -->
          <div class="status-card system-card">
            <div class="card-header">
              <h3>🖥️ {{ t('status.system') }}</h3>
            </div>

            <div class="system-items">
              <div class="system-item">
                <span class="system-label">{{ t('status.devicesOnline') }}</span>
                <span class="system-value">{{ devicesStore.devices.filter(d => d.is_on).length }} / {{ devicesStore.devices.length }}</span>
              </div>
              <div class="system-item">
                <span class="system-label">{{ t('status.uptime') }}</span>
                <span class="system-value">{{ systemInfo.uptime }}</span>
              </div>
              <div class="system-item">
                <span class="system-label">{{ t('status.lastUpdate') }}</span>
                <span class="system-value">{{ systemInfo.lastUpdate }}</span>
              </div>
              <div class="system-item">
                <span class="system-label">{{ t('status.softwareVersion') }}</span>
                <span class="system-value">{{ systemInfo.version }}</span>
              </div>
            </div>

            <button class="system-update-btn" disabled>
              {{ t('status.checkUpdates') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDevicesStore } from '../stores/devices'
import { useI18nStore } from '../stores/i18n'
import Navbar from '../components/Navbar.vue'

const devicesStore = useDevicesStore()
const i18nStore = useI18nStore()

const t = (key) => i18nStore.t(key)

const refreshing = ref(false)
const weatherLoading = ref(false)
const weatherError = ref('')
const weatherCity = ref('Moscow')

const weather = ref({
  location: 'Moscow, Russia',
  temperature: 18,
  condition: 'partly-cloudy',
  description: '',
  icon: '',
  humidity: 65,
  windSpeed: 3.5,
  feelsLike: 16
})

const forecast = ref([])

const dayNames = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  fi: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La']
}

const fetchWeather = async () => {
  weatherLoading.value = true
  weatherError.value = ''

  try {
    const langMap = { en: 'en', ru: 'ru', fi: 'fi' }
    const lang = langMap[i18nStore.locale] || 'en'
    const res = await fetch(`/api/weather?city=${encodeURIComponent(weatherCity.value)}&lang=${lang}`)

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Weather API error')
    }

    const data = await res.json()

    weather.value = {
      location: data.current.location,
      temperature: data.current.temperature,
      feelsLike: data.current.feelsLike,
      humidity: data.current.humidity,
      windSpeed: data.current.windSpeed,
      description: data.current.description,
      icon: data.current.icon,
      condition: data.current.condition
    }

    // Сохраняем город в localStorage при успешном запросе
    localStorage.setItem('weatherCity', weatherCity.value)

    const names = dayNames[i18nStore.locale] || dayNames.en
    forecast.value = data.forecast.map(day => ({
      day: names[day.dayOfWeek],
      temp: day.temperature,
      description: day.description,
      icon: day.icon,
      condition: day.condition
    }))
  } catch (err) {
    console.error('Failed to fetch weather:', err)
    weatherError.value = t('status.weatherError')
    // Оставляем mock-данные как fallback
    forecast.value = [
      { day: t('status.tomorrow'), condition: 'sunny', temp: 20, icon: '', description: '' },
      { day: (dayNames[i18nStore.locale] || dayNames.en)[5], condition: 'rainy', temp: 15, icon: '', description: '' },
      { day: (dayNames[i18nStore.locale] || dayNames.en)[6], condition: 'cloudy', temp: 17, icon: '', description: '' }
    ]
  } finally {
    weatherLoading.value = false
  }
}

const roomTemperatures = computed(() => {
  const tempDevices = devicesStore.devices.filter(
    d => (d.type === 'thermostat' || d.type === 'sensor') && d.properties?.temperature !== undefined
  )
  const roomMap = {}
  for (const device of tempDevices) {
    const room = device.room
    if (!roomMap[room]) {
      roomMap[room] = { name: room, temperature: device.properties.temperature, deviceName: device.name }
    }
  }
  return Object.values(roomMap)
})

const hasTemperatureDevices = computed(() => roomTemperatures.value.length > 0)

const averageTemperature = computed(() => {
  if (roomTemperatures.value.length === 0) return '—'
  const sum = roomTemperatures.value.reduce((acc, room) => acc + room.temperature, 0)
  return (sum / roomTemperatures.value.length).toFixed(1)
})

const airQuality = ref({
  aqi: 42,
  co2: 450,
  pm25: 12,
  humidity: 55
})

const energy = ref({
  current: 12.5,
  change: -8,
  hourly: [5, 3, 2, 4, 6, 8, 12, 15, 11, 9, 7, 10]
})

const topEnergyDevices = computed(() => [
  { name: t('status.conditioner'), icon: '❄️', consumption: 1500 },
  { name: t('status.fridge'), icon: '🧊', consumption: 800 },
  { name: t('status.washingMachine'), icon: '🌀', consumption: 500 }
])

const securityDevices = computed(() => {
  return devicesStore.devices.filter(d => ['camera', 'lock', 'sensor'].includes(d.type))
})

const hasSecurityDevices = computed(() => securityDevices.value.length > 0)

const security = computed(() => {
  const iconMap = { camera: '📹', lock: '🔒', sensor: '👁️' }

  const items = securityDevices.value.map(device => {
    let status, secure
    if (device.type === 'camera') {
      secure = device.is_on
      status = device.is_on ? t('status.working') : t('status.offline')
    } else if (device.type === 'lock') {
      // Замок считается закрытым только если он включён (is_on) и заблокирован (locked)
      const isLocked = device.properties?.locked === true
      secure = device.is_on && isLocked
      status = device.is_on
        ? (isLocked ? t('status.closed') : t('status.opened'))
        : t('status.offline')
    } else {
      secure = device.is_on
      status = device.is_on ? t('status.active') : t('status.inactive')
    }
    return {
      name: device.name,
      icon: iconMap[device.type] || '🛡️',
      status,
      secure
    }
  })

  const allSecure = items.length > 0 && items.every(item => item.secure)
  return { allSecure, items }
})

const systemInfo = ref({
  uptime: '15d 8h',
  lastUpdate: '2d ago',
  version: 'v1.0.0'
})

const getWeatherIcon = (condition) => {
  const icons = { 'sunny': '☀️', 'partly-cloudy': '⛅', 'cloudy': '☁️', 'rainy': '🌧️', 'snowy': '❄️', 'stormy': '⛈️' }
  return icons[condition] || '🌤️'
}

const getRoomIcon = (roomName) => {
  const icons = { 'Гостиная': '🛋️', 'Спальня': '🛏️', 'Кухня': '🍳', 'Ванная': '🚿', 'Детская': '👶' }
  return icons[roomName] || '📍'
}

const getTempStatus = (temp) => {
  if (temp < 18) return 'cold'
  if (temp > 24) return 'hot'
  return 'optimal'
}

const getTempStatusText = (temp) => {
  if (temp < 18) return t('status.cold')
  if (temp > 24) return t('status.hot')
  return t('status.optimal')
}

const getTempBarWidth = (temp) => {
  return `${((temp - 10) / 20 * 100)}%`
}

const getAQIClass = (aqi) => {
  if (aqi <= 50) return 'aqi-good'
  if (aqi <= 100) return 'aqi-moderate'
  if (aqi <= 150) return 'aqi-unhealthy-sensitive'
  return 'aqi-unhealthy'
}

const getAQIStatus = (aqi) => {
  if (aqi <= 50) return t('status.aqiGood')
  if (aqi <= 100) return t('status.aqiModerate')
  if (aqi <= 150) return t('status.aqiUnhealthySensitive')
  return t('status.aqiUnhealthy')
}

const getAQIDescription = (aqi) => {
  if (aqi <= 50) return t('status.aqiDescGood')
  if (aqi <= 100) return t('status.aqiDescModerate')
  if (aqi <= 150) return t('status.aqiDescUnhealthySensitive')
  return t('status.aqiDescUnhealthy')
}

const refreshTemperature = async () => {
  refreshing.value = true
  await devicesStore.fetchDevices()
  refreshing.value = false
}

// Определение города через геопозицию браузера
const detectLocation = async () => {
  // Сначала пробуем получить из localStorage
  const savedCity = localStorage.getItem('weatherCity')
  if (savedCity) {
    weatherCity.value = savedCity
    return
  }

  // Если нет сохранённого города, запрашиваем геопозицию
  if (!navigator.geolocation) {
    return // Геолокация не поддерживается
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 минут
      })
    })

    const { latitude, longitude } = position.coords

    // Обратное геокодирование через OpenStreetMap Nominatim
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${i18nStore.locale}`
    )

    if (res.ok) {
      const data = await res.json()
      const city = data.address.city || data.address.town || data.address.village || data.address.county
      if (city) {
        weatherCity.value = city
        localStorage.setItem('weatherCity', city) // Сохраняем для будущих посещений
      }
    }
  } catch (error) {
    console.log('Геолокация недоступна:', error.message)
    // Оставляем Moscow по умолчанию
  }
}

onMounted(() => {
  devicesStore.fetchDevices()
  detectLocation().then(() => fetchWeather())
})
</script>

<style scoped>
.status-page {
  min-height: 100vh;
  background: var(--bg-secondary, #f8fafc);
}

.status-content {
  padding: 32px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  margin-bottom: 8px;
  animation: slideInUp 0.4s ease-out;
}

.page-subtitle {
  color: var(--text-secondary, #64748b);
  font-size: 16px;
  margin-bottom: 32px;
  animation: slideInUp 0.5s ease-out;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.status-card {
  background: var(--bg-primary, #ffffff);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
  transition: all 0.3s;
  animation: slideInUp 0.6s ease-out;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.1));
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
}

.location {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary, #64748b);
  padding: 4px;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  color: #60a5fa;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.weather-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.temperature {
  font-size: 56px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
}

.weather-icon {
  font-size: 64px;
}

.weather-description {
  color: var(--text-secondary, #64748b);
  font-size: 16px;
  margin-bottom: 20px;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.detail-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.detail-label {
  font-size: 12px;
  color: var(--text-secondary, #64748b);
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
}

.forecast {
  padding-top: 20px;
  border-top: 2px solid var(--border-color, #e2e8f0);
}

.forecast-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  margin-bottom: 16px;
}

.forecast-items {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.forecast-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 8px;
}

.forecast-day {
  font-size: 12px;
  color: var(--text-secondary, #64748b);
  margin-bottom: 8px;
}

.forecast-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.forecast-temp {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
}

.rooms-temperature {
  margin-bottom: 20px;
}

.room-temp-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.room-temp-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.room-temp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.room-icon {
  font-size: 24px;
}

.room-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.temp-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.temp-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
}

.temp-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.temp-status.cold {
  background: #dbeafe;
  color: #1e40af;
}

.temp-status.optimal {
  background: #d1fae5;
  color: #065f46;
}

.temp-status.hot {
  background: #fee2e2;
  color: #991b1b;
}

.temp-bar {
  height: 6px;
  background: var(--border-color, #e2e8f0);
  border-radius: 3px;
  overflow: hidden;
}

.temp-bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.average-temp {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: rgba(96, 165, 250, 0.08);
  border-radius: 8px;
  color: var(--text-primary, #1e293b);
  font-size: 15px;
}

.air-quality-main {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.aqi-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.aqi-good { background: linear-gradient(135deg, #10b981, #059669); }
.aqi-moderate { background: linear-gradient(135deg, #f59e0b, #d97706); }
.aqi-unhealthy-sensitive { background: linear-gradient(135deg, #ef4444, #dc2626); }
.aqi-unhealthy { background: linear-gradient(135deg, #991b1b, #7f1d1d); }

.aqi-value {
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.aqi-label {
  font-size: 12px;
  color: white;
  opacity: 0.9;
}

.aqi-description {
  flex: 1;
}

.aqi-status {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  margin-bottom: 4px;
}

.aqi-text {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
}

.air-parameters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.air-param {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-label {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
  font-weight: 600;
}

.param-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
}

.param-bar {
  height: 6px;
  background: var(--border-color, #e2e8f0);
  border-radius: 3px;
  overflow: hidden;
}

.param-bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.energy-main {
  text-align: center;
  margin-bottom: 24px;
}

.energy-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  margin-bottom: 8px;
}

.energy-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.comparison-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.badge-up { background: #fee2e2; color: #991b1b; }
.badge-down { background: #d1fae5; color: #065f46; }

.comparison-text {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
}

.energy-chart {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 12px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100px;
  gap: 4px;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

.bar-label {
  font-size: 10px;
  color: var(--text-secondary, #64748b);
  margin-top: 4px;
}

.device-energy-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  margin-bottom: 12px;
}

.device-energy-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 8px;
  margin-bottom: 8px;
  gap: 12px;
  min-width: 0;
}

.device-energy-item:last-child {
  margin-bottom: 0;
}

.device-energy-name {
  font-size: 14px;
  color: var(--text-primary, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.device-energy-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  flex-shrink: 0;
  white-space: nowrap;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-secure { background: #d1fae5; color: #065f46; }
.status-alert { background: #fee2e2; color: #991b1b; }

.security-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 12px;
  transition: all 0.2s;
}

.security-item:hover {
  background: var(--bg-tertiary, #f1f5f9);
}

.security-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
}

.security-icon.icon-alert {
  background: #fee2e2;
}

.security-info {
  flex: 1;
}

.security-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.security-status {
  font-size: 13px;
}

.status-ok { color: var(--success-color, #059669); }
.status-warning { color: var(--danger-color, #dc2626); }

.system-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.system-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 8px;
  gap: 12px;
  min-width: 0;
}

.system-label {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.system-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  flex-shrink: 0;
  white-space: nowrap;
}

.system-update-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.system-update-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.system-update-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 13px;
  color: var(--text-secondary, #94a3b8);
}

.period {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .status-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

.weather-city-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.city-input {
  width: 140px;
  padding: 6px 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-primary, #1e293b);
  background: var(--bg-secondary, #f8fafc);
  outline: none;
  transition: border-color 0.2s;
}

.city-input:focus {
  border-color: var(--primary-color, #6366f1);
}

.weather-location {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weather-loading {
  text-align: center;
  padding: 12px;
  color: var(--text-secondary, #64748b);
  font-size: 14px;
}

.weather-error {
  text-align: center;
  padding: 8px 12px;
  color: var(--danger-color, #ef4444);
  background: #fee2e2;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 12px;
  word-break: break-word;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .weather-details {
    grid-template-columns: 1fr;
  }

  .forecast-items {
    flex-direction: column;
  }

  .city-input {
    width: 100px;
  }
}

@media (max-width: 480px) {
  .status-content {
    padding: 16px 0;
  }

  .container {
    padding: 0 12px;
  }

  .page-title {
    font-size: 22px;
  }

  .page-subtitle {
    font-size: 14px;
    margin-bottom: 20px;
  }

  .status-grid {
    gap: 16px;
  }

  .status-card {
    padding: 16px;
    border-radius: 12px;
  }

  .card-header {
    margin-bottom: 14px;
  }

  .card-header h3 {
    font-size: 15px;
  }

  /* Погода */
  .temperature {
    font-size: 40px;
  }

  .weather-icon {
    font-size: 48px;
  }

  .weather-icon img {
    width: 60px !important;
    height: 60px !important;
  }

  .weather-description {
    font-size: 14px;
    margin-bottom: 14px;
  }

  .weather-details {
    padding: 12px;
    gap: 12px;
  }

  .detail-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .detail-label {
    font-size: 11px;
  }

  .detail-value {
    font-size: 14px;
  }

  .forecast-item {
    padding: 10px;
  }

  .forecast-icon {
    font-size: 24px;
  }

  .forecast-icon img {
    width: 36px !important;
    height: 36px !important;
  }

  .city-input {
    width: 80px;
    padding: 5px 8px;
    font-size: 12px;
  }

  .weather-city-input {
    gap: 4px;
  }

  /* Температура комнат */
  .temp-value {
    font-size: 20px;
  }

  .room-icon {
    font-size: 20px;
  }

  .room-name {
    font-size: 14px;
  }

  .average-temp {
    padding: 12px;
    font-size: 14px;
  }

  /* Качество воздуха */
  .air-quality-main {
    gap: 16px;
  }

  .aqi-circle {
    width: 80px;
    height: 80px;
  }

  .aqi-value {
    font-size: 24px;
  }

  .aqi-label {
    font-size: 10px;
  }

  .aqi-status {
    font-size: 18px;
  }

  .aqi-text {
    font-size: 13px;
  }

  .param-value {
    font-size: 16px;
  }

  /* Энергопотребление */
  .energy-value {
    font-size: 36px;
  }

  .chart-bars {
    height: 80px;
  }

  .energy-chart {
    padding: 12px;
  }

  .device-energy-item {
    padding: 10px;
  }

  .device-energy-name,
  .device-energy-value {
    font-size: 13px;
  }

  /* Безопасность */
  .security-item {
    padding: 12px;
    gap: 12px;
  }

  .security-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .security-name {
    font-size: 14px;
  }

  .status-indicator {
    font-size: 11px;
    padding: 3px 8px;
  }

  /* Система */
  .system-item {
    padding: 10px;
  }

  .system-label,
  .system-value {
    font-size: 13px;
  }

  .system-update-btn {
    padding: 10px;
    font-size: 14px;
  }

  .empty-state {
    padding: 24px 12px;
  }

  .empty-icon {
    font-size: 36px;
  }

  .empty-text {
    font-size: 14px;
  }
}
</style>

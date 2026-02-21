<template>
  <div class="dashboard-page">
    <Navbar>
      <button @click="showLogsModal = true" class="header-btn" :title="t('dashboard.actionLogs')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </button>

      <router-link to="/status" class="header-btn" :title="t('nav.status')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        </svg>
      </router-link>

      <router-link to="/profile" class="header-btn header-btn-primary">
        {{ t('nav.profile') }}
      </router-link>
    </Navbar>

    <div class="main-content">
      <aside class="left-panel">
        <div class="welcome-section">
          <h2>{{ t('dashboard.hello') }}, {{ authStore.user?.name }}!</h2>
          <p class="device-count">{{ t('dashboard.devicesConnected') }}: {{ devicesStore.devices.length }}</p>
        </div>

        <div class="add-device-card" @click="showAddModal = true">
          <div class="add-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <p class="add-text">{{ t('dashboard.addDevice') }}</p>
        </div>

        <div class="rooms-filter">
          <h3 class="filter-title">{{ t('dashboard.rooms') }}</h3>
          <div class="filter-buttons">
            <button
              @click="selectedRoom = null; showFavoritesOnly = false"
              :class="['filter-btn', { 'active': selectedRoom === null && !showFavoritesOnly }]"
            >
              <span class="filter-icon">🏠</span>
              {{ t('dashboard.allDevices') }}
              <span class="filter-count">{{ devicesStore.devices.length }}</span>
            </button>

            <button
              @click="showFavoritesOnly = true; selectedRoom = null"
              :class="['filter-btn filter-btn-favorites', { 'active': showFavoritesOnly }]"
            >
              <span class="filter-icon">⭐</span>
              {{ t('dashboard.favorites') }}
              <span class="filter-count">{{ favoritesCount }}</span>
            </button>

            <button
              v-for="room in rooms"
              :key="room"
              @click="selectedRoom = room; showFavoritesOnly = false"
              :class="['filter-btn', { 'active': selectedRoom === room && !showFavoritesOnly }]"
            >
              <span class="filter-icon">{{ getRoomIcon(room) }}</span>
              {{ room }}
              <span class="filter-count">{{ getDevicesByRoom(room).length }}</span>
            </button>
          </div>
        </div>
      </aside>

      <main class="right-panel">
        <div class="panel-header">
          <h2>{{ selectedRoom || t('dashboard.allDevices') }}</h2>
          <p class="device-count-header">{{ filteredDevices.length }} {{ t('dashboard.devices') }}</p>
        </div>

        <div v-if="devicesStore.loading" class="loading-state">
          <div class="spinner"></div>
        </div>

        <div v-else-if="filteredDevices.length === 0" class="empty-state">
          <p v-if="selectedRoom">{{ t('dashboard.noDevicesInRoom').replace('{room}', selectedRoom) }}</p>
          <p v-else>{{ t('dashboard.noDevicesYet') }}</p>
          <button @click="showAddModal = true" class="btn-add-first">
            {{ t('dashboard.addDevice') }}
          </button>
        </div>

        <div v-else class="devices-grid">
          <div
            v-for="device in filteredDevices"
            :key="device.id"
            class="device-card"
            :class="{ 'device-on': device.is_on }"
          >
            <div class="device-header">
              <div class="device-icon">{{ getDeviceIcon(device.type) }}</div>
              <div class="device-actions">
                <button
                  @click="devicesStore.toggleFavorite(device.id)"
                  class="icon-btn favorite-btn"
                  :class="{ 'is-favorite': device.is_favorite }"
                  :title="device.is_favorite ? t('dashboard.removeFromFavorites') : t('dashboard.addToFavorites')"
                >
                  {{ device.is_favorite ? '⭐' : '☆' }}
                </button>
                <button @click="editDevice(device)" class="icon-btn" :title="t('dashboard.edit')">
                  ✏️
                </button>
                <button @click="deleteDevice(device.id)" class="icon-btn" :title="t('dashboard.delete')">
                  🗑️
                </button>
              </div>
            </div>

            <h3 class="device-name">{{ device.name }}</h3>
            <p class="device-room">{{ device.room }}</p>

            <div class="device-footer">
              <span :class="['status-badge', device.is_on ? 'status-on' : 'status-off']">
                {{ device.is_on ? t('dashboard.on') : t('dashboard.off') }}
              </span>

              <button
                @click="toggleDevice(device.id)"
                class="toggle-btn"
                :class="{ 'active': device.is_on }"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <Transition name="modal">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content modal-animate">
          <div class="modal-header">
            <h2>{{ editingDevice ? t('dashboard.editDevice') : t('dashboard.addDevice') }}</h2>
            <button @click="closeModal" class="close-btn">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label>{{ t('dashboard.deviceName') }}</label>
              <input
                type="text"
                v-model="deviceForm.name"
                class="input"
                :placeholder="t('dashboard.deviceNamePlaceholder')"
                required
              />
            </div>

            <div class="form-group">
              <label>{{ t('dashboard.deviceType') }}</label>
              <select v-model="deviceForm.type" class="input" required>
                <option value="">{{ t('dashboard.selectType') }}</option>
                <option value="light">💡 {{ t('deviceTypes.light') }}</option>
                <option value="thermostat">🌡️ {{ t('deviceTypes.thermostat') }}</option>
                <option value="camera">📹 {{ t('deviceTypes.camera') }}</option>
                <option value="lock">🔒 {{ t('deviceTypes.lock') }}</option>
                <option value="speaker">🔊 {{ t('deviceTypes.speaker') }}</option>
                <option value="tv">📺 {{ t('deviceTypes.tv') }}</option>
                <option value="socket">🔌 {{ t('deviceTypes.socket') }}</option>
                <option value="sensor">📡 {{ t('deviceTypes.sensor') }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ t('dashboard.room') }}</label>
              <input
                type="text"
                v-model="deviceForm.room"
                class="input"
                :placeholder="t('dashboard.roomPlaceholder')"
                required
                list="rooms-list"
              />
              <datalist id="rooms-list">
                <option v-for="room in rooms" :key="room" :value="room"></option>
              </datalist>
              <small class="input-hint">{{ t('dashboard.roomHint') }}</small>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>

            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                {{ t('dashboard.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingDevice ? t('dashboard.save') : t('dashboard.add') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showLogsModal" class="modal-overlay" @click.self="showLogsModal = false">
        <div class="modal-content modal-logs modal-animate">
          <div class="modal-header">
            <h2>{{ t('dashboard.today') }} {{ currentDate }}</h2>
            <button @click="showLogsModal = false" class="close-btn">✕</button>
          </div>

          <div class="logs-list">
            <div v-if="activityLogsStore.loading" class="empty-logs">
              <div class="spinner spinner-light"></div>
            </div>

            <template v-else>
              <template v-for="(group, date) in groupedLogs" :key="date">
                <div class="log-date-separator">{{ date }}</div>
                <div v-for="log in group" :key="log.id" class="log-item">
                  <div class="log-content">
                    <div class="log-action">{{ formatLogAction(log) }}</div>
                    <div v-if="log.details?.changes && log.details.changes.length > 0" class="log-details">
                      <div v-for="(change, idx) in log.details.changes" :key="idx" class="log-change">
                        • {{ formatChange(change) }}
                      </div>
                    </div>
                  </div>
                  <div class="log-time">
                    <div class="log-time-relative">{{ formatRelativeTime(log.created_at) }}</div>
                    <div class="log-time-exact">{{ formatExactTime(log.created_at) }}</div>
                  </div>
                </div>
              </template>

              <div v-if="activityLogsStore.logs.length === 0" class="empty-logs">
                <p>{{ t('dashboard.noActions') }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDevicesStore } from '../stores/devices'
import { useActivityLogsStore } from '../stores/activityLogs'
import { useI18nStore } from '../stores/i18n'
import Navbar from '../components/Navbar.vue'

const authStore = useAuthStore()
const devicesStore = useDevicesStore()
const activityLogsStore = useActivityLogsStore()
const i18nStore = useI18nStore()

const t = (key) => i18nStore.t(key)

const showAddModal = ref(false)
const showLogsModal = ref(false)
const editingDevice = ref(null)
const error = ref('')
const selectedRoom = ref(null)
const showFavoritesOnly = ref(false)

const deviceForm = ref({
  name: '',
  type: '',
  room: ''
})

// Получаем уникальные комнаты из устройств
const rooms = computed(() => {
  const roomSet = new Set(devicesStore.devices.map(d => d.room))
  return Array.from(roomSet).sort()
})

// Счётчик избранных
const favoritesCount = computed(() => {
  return devicesStore.devices.filter(d => d.is_favorite).length
})

// Фильтрация устройств по выбранной комнате или избранному
const filteredDevices = computed(() => {
  if (showFavoritesOnly.value) {
    return devicesStore.devices.filter(d => d.is_favorite)
  }
  if (!selectedRoom.value) {
    return devicesStore.devices
  }
  return devicesStore.devices.filter(d => d.room === selectedRoom.value)
})

// Получить устройства по комнате
const getDevicesByRoom = (room) => {
  return devicesStore.devices.filter(d => d.room === room)
}

const getRoomIcon = (room) => {
  const icons = {
    'Гостиная': '🛋️',
    'Спальня': '🛏️',
    'Кухня': '🍳',
    'Ванная': '🚿',
    'Зал': '🏠',
    'Детская': '👶',
    'Кабинет': '💼',
    'Прихожая': '🚪',
    'Балкон': '🌿'
  }
  return icons[room] || '📍'
}

const formatLogAction = (log) => {
  const key = `logs.${log.action}`
  let text = t(key)
  if (text === key) text = log.action
  if (log.details?.device_name) {
    text = text.replace('{name}', log.details.device_name)
  }
  return text
}

const formatChange = (change) => {
  const fieldKey = `logs.field_${change.field}`
  const fieldName = t(fieldKey) !== fieldKey ? t(fieldKey) : change.field

  if (change.field === 'property' && change.property_name) {
    const changeText = t('logs.changed_from_to')
      .replace('{from}', change.from)
      .replace('{to}', change.to)
    return `${change.property_name}: ${changeText}`
  }

  const changeText = t('logs.changed_from_to')
    .replace('{from}', change.from)
    .replace('{to}', change.to)
  return `${fieldName} ${changeText}`
}

const formatRelativeTime = (isoDate) => {
  const now = new Date()
  const date = new Date(isoDate)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('logs.just_now')
  if (diffMins < 60) return t('logs.minutes_ago').replace('{n}', diffMins)
  if (diffHours < 24) return t('logs.hours_ago').replace('{n}', diffHours)
  return t('logs.days_ago').replace('{n}', diffDays)
}

const formatExactTime = (isoDate) => {
  const date = new Date(isoDate)
  const loc = i18nStore.locale === 'fi' ? 'fi-FI' : i18nStore.locale === 'en' ? 'en-GB' : 'ru-RU'
  return date.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatLogTime = (isoDate) => {
  const date = new Date(isoDate)
  const loc = i18nStore.locale === 'fi' ? 'fi-FI' : i18nStore.locale === 'en' ? 'en-GB' : 'ru-RU'
  const day = date.toLocaleDateString(loc, { day: 'numeric', month: 'long' })
  const time = date.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
  return `${day}\n${time}`
}

const groupedLogs = computed(() => {
  const groups = {}
  const loc = i18nStore.locale === 'fi' ? 'fi-FI' : i18nStore.locale === 'en' ? 'en-GB' : 'ru-RU'

  activityLogsStore.logs.forEach(log => {
    const date = new Date(log.created_at)
    const dateKey = date.toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' })

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(log)
  })

  return groups
})

const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString(i18nStore.locale === 'fi' ? 'fi-FI' : i18nStore.locale === 'en' ? 'en-GB' : 'ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

const getDeviceIcon = (type) => {
  const icons = {
    light: '💡',
    thermostat: '🌡️',
    camera: '📹',
    lock: '🔒',
    speaker: '🔊',
    tv: '📺',
    socket: '🔌',
    sensor: '📡'
  }
  return icons[type] || '📱'
}

const toggleDevice = async (deviceId) => {
  await devicesStore.toggleDevice(deviceId)
}

const editDevice = (device) => {
  editingDevice.value = device
  deviceForm.value = {
    name: device.name,
    type: device.type,
    room: device.room
  }
  showAddModal.value = true
}

const deleteDevice = async (deviceId) => {
  if (!confirm(t('dashboard.deleteConfirm'))) return
  await devicesStore.deleteDevice(deviceId)
}

const handleSubmit = async () => {
  error.value = ''

  let result
  if (editingDevice.value) {
    result = await devicesStore.updateDevice(editingDevice.value.id, deviceForm.value)
  } else {
    result = await devicesStore.addDevice(deviceForm.value)
  }

  if (result.success) {
    closeModal()
  } else {
    error.value = result.error
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingDevice.value = null
  deviceForm.value = { name: '', type: '', room: '' }
  error.value = ''
}

watch(showLogsModal, (val) => {
  if (val) activityLogsStore.fetchLogs()
})

onMounted(() => {
  devicesStore.fetchDevices()
  activityLogsStore.fetchLogs()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--bg-secondary, #f8fafc);
}

.main-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
  padding: 32px;
  max-width: 1600px;
  margin: 0 auto;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-section {
  background: var(--bg-primary, #ffffff);
  padding: 24px;
  border-radius: 12px;
  box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
  animation: slideInLeft 0.4s ease-out;
}

.welcome-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-count {
  color: var(--text-secondary, #64748b);
  font-size: 14px;
}

.add-device-card {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  padding: 48px 24px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  animation: slideInLeft 0.5s ease-out;
}

.add-device-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.3);
}

.add-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  transition: transform 0.3s;
}

.add-device-card:hover .add-icon {
  transform: rotate(90deg);
}

.add-text {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.rooms-filter {
  background: var(--bg-primary, #ffffff);
  padding: 24px;
  border-radius: 12px;
  box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
  animation: slideInLeft 0.6s ease-out;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  margin-bottom: 16px;
}

.filter-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-btn {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color, #e2e8f0);
  background: var(--bg-primary, #ffffff);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #64748b);
  transition: all 0.2s;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: #60a5fa;
  background: var(--bg-secondary, #f0f9ff);
  transform: translateX(4px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-color: transparent;
  color: white;
}

.filter-icon {
  font-size: 20px;
}

.filter-count {
  margin-left: auto;
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.2);
}

.right-panel {
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
  padding: 32px;
  box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
  min-height: 600px;
  animation: slideInRight 0.4s ease-out;
}

.panel-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color, #e2e8f0);
}

.panel-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-count-header {
  color: var(--text-secondary, #64748b);
  font-size: 14px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px;
}

.spinner {
  border: 3px solid var(--border-color, #e2e8f0);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-tertiary, #94a3b8);
}

.empty-state p {
  font-size: 18px;
  margin-bottom: 24px;
}

.btn-add-first {
  padding: 12px 32px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-first:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.device-card {
  background: var(--bg-secondary, #f8fafc);
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  animation: fadeIn 0.4s ease-out;
}

.device-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #60a5fa;
}

.device-on {
  background: rgba(96, 165, 250, 0.08);
  border-color: #60a5fa;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.device-icon {
  font-size: 36px;
}

.device-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.6;
  transition: all 0.2s;
}

.icon-btn:hover {
  opacity: 1;
  transform: scale(1.2);
}

.favorite-btn.is-favorite {
  opacity: 1;
}

.device-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-room {
  color: var(--text-secondary, #64748b);
  font-size: 14px;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-on {
  background: #d1fae5;
  color: #065f46;
}

.status-off {
  background: #fee2e2;
  color: #991b1b;
}

.toggle-btn {
  width: 50px;
  height: 26px;
  background: var(--text-tertiary, #cbd5e1);
  border: none;
  border-radius: 13px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
}

.toggle-btn.active {
  background: #60a5fa;
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-btn.active .toggle-slider {
  transform: translateX(24px);
}

/* Модалки */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-primary, #ffffff);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-animate {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary, #64748b);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-secondary, #f1f5f9);
  color: var(--text-primary, #1e293b);
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #1e293b);
}

.input:focus {
  outline: none;
  border-color: #60a5fa;
}

.input-hint {
  display: block;
  margin-top: 6px;
  color: var(--text-tertiary, #94a3b8);
  font-size: 13px;
}

.error-message {
  color: var(--danger-color, #ef4444);
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  word-break: break-word;
}

.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: var(--bg-primary, #ffffff);
  color: var(--text-secondary, #64748b);
  border: 2px solid var(--border-color, #e2e8f0);
}

.btn-secondary:hover {
  border-color: var(--text-tertiary, #cbd5e1);
}

/* Модалка логов */
.modal-logs {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
}

.modal-logs .modal-header {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.modal-logs .modal-header h2 {
  color: white;
}

.modal-logs .close-btn {
  color: white;
}

.modal-logs .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Стилизация скроллбара для логов */
.modal-logs .logs-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
}

.modal-logs .logs-list::-webkit-scrollbar {
  width: 8px;
}

.modal-logs .logs-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.modal-logs .logs-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.2s;
}

.modal-logs .logs-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.logs-list {
  padding: 24px;
}

.log-date-separator {
  font-size: 14px;
  font-weight: 600;
  padding: 12px 0 8px 0;
  margin-top: 8px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.log-date-separator:first-child {
  margin-top: 0;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  animation: fadeIn 0.3s ease-out;
  gap: 16px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-content {
  flex: 1;
  min-width: 0;
}

.log-action {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.log-details {
  margin-top: 6px;
  padding-left: 12px;
}

.log-change {
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.6;
  margin: 2px 0;
}

.log-time {
  text-align: right;
  flex-shrink: 0;
  min-width: 80px;
}

.log-time-relative {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  opacity: 0.9;
}

.log-time-exact {
  font-size: 11px;
  opacity: 0.7;
  font-family: 'Courier New', monospace;
}

.empty-logs {
  text-align: center;
  padding: 40px;
  opacity: 0.7;
}

.spinner-light {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .devices-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
    gap: 16px;
  }

  .devices-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px;
    gap: 12px;
  }

  .welcome-section {
    padding: 16px;
  }

  .welcome-section h2 {
    font-size: 18px;
  }

  .add-device-card {
    padding: 32px 16px;
  }

  .add-icon {
    width: 60px;
    height: 60px;
  }

  .add-icon svg {
    width: 30px;
    height: 30px;
  }

  .add-text {
    font-size: 15px;
  }

  .rooms-filter {
    padding: 16px;
  }

  .filter-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .filter-btn {
    padding: 10px 12px;
    font-size: 13px;
    gap: 8px;
  }

  .filter-icon {
    font-size: 16px;
  }

  .right-panel {
    padding: 16px;
    min-height: auto;
  }

  .panel-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .panel-header h2 {
    font-size: 20px;
  }

  .devices-grid {
    gap: 12px;
  }

  .device-card {
    padding: 14px;
  }

  .device-icon {
    font-size: 28px;
  }

  .device-name {
    font-size: 15px;
  }

  .device-room {
    font-size: 13px;
    margin-bottom: 12px;
  }

  .device-header {
    margin-bottom: 12px;
  }

  .icon-btn {
    font-size: 16px;
  }

  .loading-state {
    padding: 40px;
  }

  .empty-state {
    padding: 40px 16px;
  }

  .empty-state p {
    font-size: 15px;
  }

  .btn-add-first {
    padding: 10px 24px;
    font-size: 14px;
  }

  /* Модалки на мобильных */
  .modal-overlay {
    padding: 12px;
  }

  .modal-content {
    border-radius: 12px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 18px;
  }

  .modal-form {
    padding: 16px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .input {
    padding: 10px 12px;
    font-size: 14px;
  }

  .modal-footer {
    margin-top: 16px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 14px;
  }

  .logs-list {
    padding: 16px;
  }

  .log-item {
    padding: 10px 0;
    gap: 10px;
  }

  .log-action {
    font-size: 13px;
  }

  .log-change {
    font-size: 12px;
  }

  .log-time {
    min-width: 60px;
  }

  .log-time-relative {
    font-size: 11px;
  }

  .log-time-exact {
    font-size: 10px;
  }

  .log-date-separator {
    font-size: 12px;
  }
}
</style>

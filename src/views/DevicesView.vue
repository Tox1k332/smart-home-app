<template>
  <div>
    <Navbar/>
    <div class="devices-content">
      <div class="devices-header">
        <h1>{{ t('devices.title') }}</h1>
        <button @click="showAddModal=true" class="btn btn-primary">{{ t('devices.addDevice') }}</button>
      </div>

      <div v-if="devicesStore.loading" class="loading"><div class="spinner"></div></div>

      <div v-else-if="devicesStore.devices.length===0" class="card empty-card">
        <div class="empty-icon">📱</div>
        <h2>{{ t('devices.noDevices') }}</h2>
        <p class="empty-subtitle">{{ t('devices.noDevicesSubtitle') }}</p>
        <button @click="showAddModal=true" class="btn btn-primary">{{ t('devices.addFirstDevice') }}</button>
      </div>

      <div v-else class="devices-grid">
        <div v-for="device in devicesStore.devices" :key="device.id" class="card">
          <div class="card-top">
            <span class="card-icon">{{ getDeviceIcon(device.type) }}</span>
            <div class="card-actions">
              <button @click="editDevice(device)" class="icon-btn">✏️</button>
              <button @click="deleteDevice(device.id)" class="icon-btn">🗑️</button>
            </div>
          </div>
          <h3 class="card-name">{{ device.name }}</h3>
          <p class="card-meta">{{ t('devices.room') }}: {{ device.room }}</p>
          <p class="card-meta">{{ t('devices.status') }}: <span :class="device.is_on ? 'text-success' : 'text-danger'">{{ device.is_on ? t('devices.on') : t('devices.off') }}</span></p>
          <button @click="toggleDevice(device.id)" :class="['btn', 'btn-full', device.is_on ? 'btn-danger' : 'btn-primary']">
            {{ device.is_on ? t('devices.turnOff') : t('devices.turnOn') }}
          </button>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-top">
            <h2>{{ editingDevice ? t('devices.editDevice') : t('devices.addDeviceTitle') }}</h2>
            <button @click="closeModal" class="close-btn">✕</button>
          </div>
          <form @submit.prevent="handleSubmit" class="modal-form">
            <div class="form-group">
              <label>{{ t('devices.name') }}</label>
              <input type="text" v-model="deviceForm.name" class="input" required/>
            </div>
            <div class="form-group">
              <label>{{ t('devices.type') }}</label>
              <select v-model="deviceForm.type" class="input" required>
                <option value="">{{ t('devices.selectType') }}</option>
                <option value="light">{{ t('deviceTypes.light') }}</option>
                <option value="thermostat">{{ t('deviceTypes.thermostat') }}</option>
                <option value="camera">{{ t('deviceTypes.camera') }}</option>
                <option value="lock">{{ t('deviceTypes.lock') }}</option>
                <option value="speaker">{{ t('deviceTypes.speaker') }}</option>
                <option value="tv">{{ t('deviceTypes.tv') }}</option>
                <option value="socket">{{ t('deviceTypes.socket') }}</option>
                <option value="sensor">{{ t('deviceTypes.sensor') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ t('devices.room') }}</label>
              <input type="text" v-model="deviceForm.room" class="input" required/>
            </div>
            <div v-if="error" class="error-message">{{ error }}</div>
            <div class="modal-buttons">
              <button type="button" @click="closeModal" class="btn btn-secondary">{{ t('devices.cancel') }}</button>
              <button type="submit" class="btn btn-primary">{{ editingDevice ? t('devices.save') : t('devices.add') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDevicesStore } from '../stores/devices'
import { useI18nStore } from '../stores/i18n'
import Navbar from '../components/Navbar.vue'

const devicesStore = useDevicesStore()
const i18nStore = useI18nStore()

const t = (key) => i18nStore.t(key)

const showAddModal = ref(false)
const editingDevice = ref(null)
const error = ref('')
const deviceForm = ref({ name: '', type: '', room: '' })

const getDeviceIcon = (type) => {
  const icons = { light: '💡', thermostat: '🌡️', camera: '📹', lock: '🔒', speaker: '🔊', tv: '📺', socket: '🔌', sensor: '📡' }
  return icons[type] || '📱'
}

const toggleDevice = async (id) => {
  await devicesStore.toggleDevice(id)
}

const editDevice = (device) => {
  editingDevice.value = device
  deviceForm.value = { name: device.name, type: device.type, room: device.room }
  showAddModal.value = true
}

const deleteDevice = async (id) => {
  if (!confirm(t('devices.deleteConfirm'))) return
  await devicesStore.deleteDevice(id)
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

onMounted(() => {
  devicesStore.fetchDevices()
})
</script>

<style scoped>
.devices-content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.devices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;
  flex-wrap: wrap;
}

.devices-header h1 {
  font-size: 32px;
  margin: 0;
  color: var(--text-primary, #1e293b);
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.card {
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
}

.empty-card {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-card h2 {
  margin-bottom: 12px;
  color: var(--text-primary, #1e293b);
}

.empty-subtitle {
  color: var(--text-secondary, #64748b);
  margin-bottom: 24px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-icon {
  font-size: 32px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.6;
  transition: all 0.2s;
}

.icon-btn:hover {
  opacity: 1;
  transform: scale(1.2);
}

.card-name {
  font-size: 18px;
  margin-bottom: 8px;
  color: var(--text-primary, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  color: var(--text-secondary, #64748b);
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta:last-of-type {
  margin-bottom: 16px;
}

.text-success {
  color: var(--success-color, #10b981);
  font-weight: 600;
}

.text-danger {
  color: var(--danger-color, #ef4444);
  font-weight: 600;
}

.btn-full {
  width: 100%;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-box {
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  padding: 24px;
}

.modal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-top h2 {
  font-size: 24px;
  margin: 0;
  color: var(--text-primary, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary, #64748b);
}

.modal-form .form-group {
  margin-bottom: 16px;
}

.modal-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary, #1e293b);
}

.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.error-message {
  color: var(--danger-color, #ef4444);
  font-size: 14px;
  margin-top: 8px;
  word-break: break-word;
}
</style>

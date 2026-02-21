import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useDevicesStore = defineStore('devices', () => {
  const devices = ref([])
  const loading = ref(false)

  const fetchDevices = async () => {
    loading.value = true
    try {
      const response = await api.get('/devices')
      devices.value = response.data.devices
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      loading.value = false
    }
  }

  const addDevice = async (deviceData) => {
    try {
      const response = await api.post('/devices', deviceData)
      devices.value.push(response.data.device)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка' }
    }
  }

  const updateDevice = async (deviceId, updates) => {
    try {
      const response = await api.put(`/devices/${deviceId}`, updates)
      const index = devices.value.findIndex(d => d.id === deviceId)
      if (index !== -1) devices.value[index] = response.data.device
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка' }
    }
  }

  const deleteDevice = async (deviceId) => {
    try {
      await api.delete(`/devices/${deviceId}`)
      devices.value = devices.value.filter(d => d.id !== deviceId)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка' }
    }
  }

  const toggleDevice = async (deviceId) => {
    const device = devices.value.find(d => d.id === deviceId)
    if (!device) return
    return await updateDevice(deviceId, { is_on: !device.is_on })
  }

  const toggleFavorite = async (deviceId) => {
    const device = devices.value.find(d => d.id === deviceId)
    if (!device) return
    return await updateDevice(deviceId, { is_favorite: !device.is_favorite })
  }

  const updateDeviceProperties = async (deviceId, properties) => {
    return await updateDevice(deviceId, { properties })
  }

  return { devices, loading, fetchDevices, addDevice, updateDevice, deleteDevice, toggleDevice, toggleFavorite, updateDeviceProperties }
})
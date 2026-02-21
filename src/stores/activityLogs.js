import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useActivityLogsStore = defineStore('activityLogs', () => {
  const logs = ref([])
  const loading = ref(false)

  const fetchLogs = async (limit = 50) => {
    loading.value = true
    try {
      const response = await api.get('/activity-logs', { params: { limit } })
      logs.value = response.data.logs
    } catch (error) {
      console.error('Ошибка загрузки логов:', error)
    } finally {
      loading.value = false
    }
  }

  return { logs, loading, fetchLogs }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isAuthenticated = computed(() => !!token.value)

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', response.data.token)
      return { success: true }
    } catch (error) {
      const data = error.response?.data
      if (data?.needsVerification) {
        return { success: false, needsVerification: true, email: data.email, error: data.error }
      }
      return { success: false, error: data?.error || 'Ошибка входа' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data.needsVerification) {
        return { success: true, needsVerification: true, email: response.data.email }
      }
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', response.data.token)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка регистрации' }
    }
  }

  const verifyEmail = async (email, code) => {
    try {
      const response = await api.post('/auth/verify', { email, code })
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', response.data.token)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка подтверждения' }
    }
  }

  const resendCode = async (email) => {
    try {
      await api.post('/auth/resend-code', { email })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка отправки кода' }
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  const checkAuth = async () => {
    if (!token.value) return
    try {
      const response = await api.get('/auth/me')
      user.value = response.data.user
    } catch (error) {
      logout()
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/profile', data)
      user.value = response.data.user
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка обновления' }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/password', { currentPassword, newPassword })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка смены пароля' }
    }
  }

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      user.value = { ...user.value, avatar: response.data.avatar }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка загрузки аватара' }
    }
  }

  const deleteAvatar = async () => {
    try {
      await api.delete('/auth/avatar')
      user.value = { ...user.value, avatar: null }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка удаления аватара' }
    }
  }

  const deleteAccount = async (password) => {
    try {
      await api.delete('/auth/account', { data: { password } })
      logout()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка удаления аккаунта' }
    }
  }

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка' }
    }
  }

  const resetPassword = async (email, code, newPassword) => {
    try {
      await api.post('/auth/reset-password', { email, code, newPassword })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка' }
    }
  }

  return {
    user, token, isAuthenticated,
    login, register, verifyEmail, resendCode, logout, checkAuth,
    updateProfile, changePassword, uploadAvatar, deleteAvatar, deleteAccount,
    forgotPassword, resetPassword
  }
})
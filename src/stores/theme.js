import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {

  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const theme = ref(getInitialTheme())

  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        theme.value = e.matches ? 'dark' : 'light'
      }
    })
  }

  return {
    theme,
    toggleTheme,
    setTheme
  }
})

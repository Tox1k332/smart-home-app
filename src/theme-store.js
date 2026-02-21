import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Получаем сохраненную тему или системную
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    
    // Проверяем системную тему
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const theme = ref(getInitialTheme())

  // Применяем тему к document
  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  // Переключение темы
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  // Установка конкретной темы
  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  // Следим за изменениями и применяем
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })

  // Следим за системной темой
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

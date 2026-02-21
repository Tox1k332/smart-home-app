<template>
  <button
    @click="toggleTheme"
    class="theme-toggle-btn"
    :aria-label="theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'"
    :title="theme === 'light' ? 'Тёмная тема' : 'Светлая тема'"
    type="button"
  >
    <span class="theme-toggle-track">
      <span class="theme-toggle-icon" :class="{ 'active': theme === 'light' }">
        ☀️
      </span>
      <span class="theme-toggle-icon" :class="{ 'active': theme === 'dark' }">
        🌙
      </span>
      <span class="theme-toggle-slider"></span>
    </span>
    <span class="sr-only">
      {{ theme === 'light' ? 'Текущая тема: светлая' : 'Текущая тема: тёмная' }}
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
const theme = computed(() => themeStore.theme)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
}

.theme-toggle-btn:hover {
  opacity: 0.8;
}

.theme-toggle-btn:focus {
  outline: var(--focus-outline);
  outline-offset: 2px;
  border-radius: 24px;
}

.theme-toggle-track {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 24px;
  padding: 4px 8px;
  width: 70px;
  height: 36px;
  transition: all 0.3s;
}

.theme-toggle-btn:hover .theme-toggle-track {
  border-color: var(--primary-color);
}

.theme-toggle-icon {
  font-size: 16px;
  opacity: 0.4;
  transition: all 0.3s;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle-icon.active {
  opacity: 1;
  transform: scale(1.1);
}

.theme-toggle-slider {
  position: absolute;
  width: 26px;
  height: 26px;
  background: var(--primary-color);
  border-radius: 50%;
  left: 4px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .theme-toggle-slider {
  transform: translateX(34px);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>

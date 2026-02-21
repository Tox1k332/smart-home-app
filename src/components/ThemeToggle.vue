<template>
  <button
    @click="themeStore.toggleTheme()"
    class="theme-btn"
    type="button"
    :title="themeStore.theme === 'light' ? 'Dark mode' : 'Light mode'"
  >
    <span class="theme-icon">
      {{ themeStore.theme === 'light' ? '🌙' : '☀️' }}
    </span>
    <span class="sr-only">
      Toggle theme (current: {{ themeStore.theme }})
    </span>
  </button>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-btn {
  background: var(--bg-tertiary, #f1f5f9);
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 20px;
}

.theme-btn:hover {
  border-color: var(--primary-color, #6366f1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-btn:active {
  transform: scale(0.95);
}

.theme-icon {
  display: block;
  transition: transform 0.3s;
}

.theme-btn:hover .theme-icon {
  transform: rotate(20deg);
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

@media (max-width: 480px) {
  .theme-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}
</style>

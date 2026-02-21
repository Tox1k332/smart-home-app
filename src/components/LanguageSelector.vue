<template>
  <div class="language-selector">
    <button
      @click="toggleDropdown"
      class="language-button"
      type="button"
      :aria-label="$t('common.settings')"
      :aria-expanded="isOpen"
    >
      <span class="language-icon">🌐</span>
      <span class="language-code">{{ currentLocale.toUpperCase() }}</span>
      <span class="chevron" :class="{ open: isOpen }">▼</span>
    </button>
    
    <div v-if="isOpen" class="language-dropdown" @click.stop>
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="selectLanguage(lang.code)"
        class="language-option"
        :class="{ active: currentLocale === lang.code }"
        type="button"
      >
        <span class="lang-flag">{{ lang.flag }}</span>
        <span class="lang-name">{{ lang.name }}</span>
        <span v-if="currentLocale === lang.code" class="checkmark">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18nStore } from '../stores/i18n'

const i18nStore = useI18nStore()
const isOpen = ref(false)

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
]

const currentLocale = computed(() => i18nStore.locale)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLanguage = (code) => {
  i18nStore.setLocale(code)
  isOpen.value = false
}

// Закрываем dropdown при клике вне
const handleClickOutside = (event) => {
  if (!event.target.closest('.language-selector')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Вспомогательная функция перевода (для доступа через $t)
const $t = (key) => i18nStore.t(key)
</script>

<style scoped>
.language-selector {
  position: relative;
}

.language-button {
  background: var(--bg-tertiary, #f1f5f9);
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.language-button:hover {
  border-color: var(--primary-color, #6366f1);
  background: var(--bg-secondary);
  transform: translateY(-1px);
}

.language-button:focus {
  outline: 3px solid var(--primary-color, #6366f1);
  outline-offset: 2px;
}

.language-icon {
  font-size: 18px;
}

.language-code {
  font-family: 'Unbounded', monospace;
  font-weight: 600;
}

.chevron {
  font-size: 10px;
  transition: transform 0.3s;
  color: var(--text-secondary);
}

.chevron.open {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.language-option {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.language-option:hover {
  background: var(--bg-secondary);
}

.language-option.active {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.lang-flag {
  font-size: 20px;
}

.lang-name {
  flex: 1;
  text-align: left;
}

.checkmark {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 16px;
}

/* Темная тема */
[data-theme="dark"] .language-button {
  background: var(--bg-tertiary, #334155);
  border-color: var(--border-color, #475569);
}

[data-theme="dark"] .language-button:hover {
  border-color: var(--primary-color, #818cf8);
}

[data-theme="dark"] .language-dropdown {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

/* Адаптивность */
@media (max-width: 768px) {
  .language-code {
    display: none;
  }

  .language-button {
    padding: 8px;
  }

  .language-dropdown {
    left: auto;
    right: 0;
  }
}

@media (max-width: 480px) {
  .language-button {
    padding: 6px;
    border-radius: 6px;
  }

  .language-icon {
    font-size: 16px;
  }

  .chevron {
    display: none;
  }

  .language-dropdown {
    min-width: 150px;
  }

  .language-option {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>

<!-- Пример использования i18n в компонентах Vue -->

<template>
  <div class="my-component">
    <!-- Простое использование -->
    <h1>{{ t('dashboard.title') }}</h1>
    <p>{{ t('dashboard.welcome') }}</p>
    
    <!-- В атрибутах -->
    <button :aria-label="t('common.save')">
      {{ t('common.save') }}
    </button>
    
    <!-- В условиях -->
    <p v-if="isLoading">{{ t('common.loading') }}</p>
    
    <!-- В confirm диалогах -->
    <button @click="handleDelete">
      {{ t('common.delete') }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18nStore } from '../stores/i18n'

const i18nStore = useI18nStore()
const isLoading = ref(false)

// Создаем функцию-хелпер для удобства
const t = (key) => i18nStore.t(key)

// Использование в confirm
const handleDelete = () => {
  if (confirm(t('devices.deleteConfirm'))) {
    // Удаляем устройство
  }
}
</script>

<!-- =============================================== -->
<!-- Пример компонента для переключения темы вручную -->
<!-- =============================================== -->

<template>
  <div class="settings">
    <!-- Текущая тема -->
    <p>{{ t('common.settings') }}: {{ themeStore.theme }}</p>
    
    <!-- Текущий язык -->
    <p>Language: {{ i18nStore.locale }}</p>
    
    <!-- Смена темы программно -->
    <button @click="changeTheme">
      Toggle Theme
    </button>
    
    <!-- Смена языка программно -->
    <select v-model="selectedLang" @change="changeLanguage">
      <option value="en">English</option>
      <option value="ru">Русский</option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useI18nStore } from '../stores/i18n'

const themeStore = useThemeStore()
const i18nStore = useI18nStore()
const t = (key) => i18nStore.t(key)

const selectedLang = ref(i18nStore.locale)

const changeTheme = () => {
  const newTheme = themeStore.theme === 'light' ? 'dark' : 'light'
  themeStore.setTheme(newTheme)
}

const changeLanguage = () => {
  i18nStore.setLocale(selectedLang.value)
}
</script>

<!-- =============================================== -->
<!-- Пример добавления новых переводов -->
<!-- =============================================== -->

/*
  В файле src/stores/i18n.js:
  
  1. Найдите объект translations
  2. Добавьте новый раздел или ключ во ВСЕ языки:
*/

const translations = {
  en: {
    // ... существующие переводы
    myNewSection: {
      greeting: 'Hello, {name}!',
      message: 'Welcome to our app'
    }
  },
  ru: {
    // ... существующие переводы
    myNewSection: {
      greeting: 'Привет, {name}!',
      message: 'Добро пожаловать в наше приложение'
    }
  },
}

/*
  3. Использование в компоненте:
  
  <template>
    <p>{{ t('myNewSection.greeting') }}</p>
    <p>{{ t('myNewSection.message') }}</p>
  </template>
*/

<!-- =============================================== -->
<!-- Быстрая проверка работы -->
<!-- =============================================== -->

<template>
  <div>
    <h2>Тест переводов:</h2>
    <ul>
      <li>EN Dashboard: {{ getTranslation('en', 'dashboard.title') }}</li>
      <li>RU Dashboard: {{ getTranslation('ru', 'dashboard.title') }}</li>
    </ul>
    
    <h2>Текущий язык: {{ i18nStore.locale }}</h2>
    <p>{{ t('dashboard.welcome') }}</p>
  </div>
</template>

<script setup>
import { useI18nStore } from '../stores/i18n'

const i18nStore = useI18nStore()
const t = (key) => i18nStore.t(key)

// Функция для тестирования переводов
const getTranslation = (lang, key) => {
  const savedLang = i18nStore.locale
  i18nStore.setLocale(lang)
  const translation = t(key)
  i18nStore.setLocale(savedLang)
  return translation
}
</script>

<template>
  <header class="top-header">
    <div class="logo">LOGO</div>

    <div class="header-actions">
      <slot></slot>

      <ThemeToggle />
      <LanguageSelector />

      <button @click="handleLogout" class="header-btn header-btn-danger" :title="t('nav.exit')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        {{ logoutText }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18nStore } from '../stores/i18n'
import ThemeToggle from './ThemeToggle.vue'
import LanguageSelector from './LanguageSelector.vue'

defineProps({
  logoutText: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const authStore = useAuthStore()
const i18nStore = useI18nStore()

const t = (key) => i18nStore.t(key)

const handleLogout = () => {
  if (confirm(t('nav.logoutConfirm'))) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style>
.top-header {
  background: var(--bg-primary, #ffffff);
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s;
}

.top-header .logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
}

.top-header .header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.top-header .header-btn {
  padding: 10px 20px;
  border: 2px solid var(--border-color, #e2e8f0);
  background: var(--bg-primary, #ffffff);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-secondary, #64748b);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  text-decoration: none;
}

.top-header .header-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.top-header .header-btn-primary {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
  border-color: transparent;
}

.top-header .header-btn-danger {
  border-color: var(--danger-color, #ef4444);
  color: var(--danger-color, #ef4444);
  background: transparent;
}

.top-header .header-btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

@media (max-width: 768px) {
  .top-header {
    padding: 12px 16px;
  }

  .top-header .header-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .top-header {
    padding: 8px 12px;
  }

  .top-header .logo {
    font-size: 18px;
  }

  .top-header .header-actions {
    gap: 6px;
  }

  .top-header .header-btn {
    padding: 6px;
    font-size: 0;
    gap: 0;
  }

  .top-header .header-btn svg {
    width: 18px;
    height: 18px;
  }

  .top-header .header-btn-primary {
    font-size: 11px;
    padding: 6px 10px;
  }
}
</style>

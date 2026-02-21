<template>
  <div class="auth-container">
    <div class="auth-left">
      <div class="auth-content">
        <div class="logo">Logo</div>

        <h1 class="auth-title">{{ t('auth.login') }}</h1>
        <p class="auth-subtitle">
          {{ t('auth.noAccountCanRegister') }} <router-link to="/register" class="link">{{ t('auth.registerLink') }}</router-link>
        </p>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <div class="input-wrapper">
              <span class="input-icon"><img src="../assets/mail.png" alt="email" style="width: 43px; opacity: 0.4;"></span>
              <input
                type="email"
                v-model="form.email"
                class="input"
                :placeholder="t('auth.enterEmail')"
                required
                @blur="validateEmail"
                @input="clearEmailError"
              />
            </div>
            <div v-if="emailError" class="field-error">{{ emailError }}</div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <span class="input-icon"><img src="../assets/key.png" alt="password" style="width: 43px; opacity: 0.4;"></span>
              <input
                type="password"
                v-model="form.password"
                class="input"
                :placeholder="t('auth.enterPassword')"
                required
              />
            </div>
          </div>

          <div class="forgot-password">
            <router-link to="/forgot-password" class="link">{{ t('auth.forgotPassword') }}</router-link>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
            <button v-if="unverifiedEmail" class="verify-link" @click="goToVerify">
              {{ t('auth.goToVerification') }}
            </button>
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? t('auth.loggingIn') : t('auth.login') }}
          </button>
        </form>

        <p class="social-text">{{ t('auth.socialText') }}</p>

        <div class="social-buttons">
          <a href="/api/oauth/github" class="social-btn" title="GitHub">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/%3E%3C/svg%3E" alt="GitHub">
          </a>
          <a href="/api/oauth/google" class="social-btn" title="Google">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E" alt="Google">
          </a>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="right-content">
        <img src="../assets/home.png" alt="Home" style="max-width: 80%;">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18nStore } from '../stores/i18n'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const i18nStore = useI18nStore()

const t = (key) => i18nStore.t(key)

const form = ref({
  email: '',
  password: ''
})

const error = ref('')
const emailError = ref('')
const loading = ref(false)
const unverifiedEmail = ref('')

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const validateEmail = () => {
  if (form.value.email && !isValidEmail(form.value.email)) {
    emailError.value = t('auth.invalidEmail')
  } else {
    emailError.value = ''
  }
}

const clearEmailError = () => {
  if (emailError.value && isValidEmail(form.value.email)) {
    emailError.value = ''
  }
}

// Перехват OAuth-токена или ошибки из URL
onMounted(async () => {
  const token = route.query.token
  const oauthError = route.query.error

  if (token) {
    // Пришли после OAuth — сохраняем токен и загружаем профиль
    localStorage.setItem('token', token)
    authStore.token = token
    await authStore.checkAuth()
    router.replace('/dashboard')
  } else if (oauthError) {
    error.value = t('auth.oauthError')
    router.replace('/login')
  }
})

const handleLogin = async () => {
  error.value = ''
  unverifiedEmail.value = ''

  if (!isValidEmail(form.value.email)) {
    emailError.value = t('auth.invalidEmail')
    return
  }

  loading.value = true

  const result = await authStore.login(form.value.email, form.value.password)

  loading.value = false

  if (result.success) {
    router.push('/dashboard')
  } else if (result.needsVerification) {
    error.value = t('auth.emailNotVerified')
    unverifiedEmail.value = result.email
  } else {
    error.value = result.error
  }
}

const goToVerify = () => {
  router.push({ path: '/register', query: { verify: unverifiedEmail.value } })
}
</script>

<style scoped>
.auth-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary, #ffffff);
}

.auth-left {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.auth-content {
  width: 100%;
  max-width: 400px;
}

.logo {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  margin-bottom: 48px;
}

.auth-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  margin-bottom: 12px;
}

.auth-subtitle {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  margin-bottom: 32px;
}

.link {
  color: var(--primary-color, #6366f1);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.auth-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 2px solid var(--border-color, #e2e8f0);
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-bottom-color: var(--primary-color, #6366f1);
}

.input-icon {
  font-size: 18px;
  margin-right: 12px;
  color: var(--text-secondary, #64748b);
}

.input {
  flex: 1;
  border: none;
  padding: 12px 0;
  font-size: 15px;
  color: var(--text-primary, #1e293b);
  background: transparent;
  outline: none;
}

.input::placeholder {
  color: var(--text-tertiary, #94a3b8);
}

.field-error {
  color: var(--danger-color, #ef4444);
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}

.forgot-password {
  text-align: right;
  margin-bottom: 20px;
}

.forgot-password .link {
  font-size: 13px;
}

.error-message {
  color: var(--danger-color, #ef4444);
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  word-break: break-word;
}

.verify-link {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.verify-link:hover {
  background: #dc2626;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-text {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
  text-align: center;
  margin-bottom: 20px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-btn {
  width: 48px;
  height: 48px;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 50%;
  background: var(--bg-primary, #ffffff);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.social-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.social-btn img {
  width: 24px;
  height: 24px;
}

.auth-right {
  flex: 1;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.right-content {
  text-align: center;
  color: white;
  padding: 40px;
}

@media (max-width: 968px) {
  .auth-container {
    flex-direction: column;
  }

  .auth-right {
    min-height: 300px;
  }

  .auth-left {
    padding: 40px 20px;
  }
}

@media (max-width: 480px) {
  .auth-right {
    display: none;
  }

  .auth-left {
    padding: 24px 16px;
  }

  .logo {
    font-size: 24px;
    margin-bottom: 32px;
  }

  .auth-title {
    font-size: 22px;
    margin-bottom: 8px;
  }

  .auth-subtitle {
    font-size: 13px;
    margin-bottom: 24px;
  }

  .input-icon img {
    width: 32px !important;
  }

  .input {
    font-size: 14px;
    padding: 10px 0;
  }

  .btn-submit {
    padding: 12px;
    font-size: 14px;
  }

  .social-btn {
    width: 42px;
    height: 42px;
    padding: 10px;
  }

  .error-message {
    font-size: 13px;
    padding: 10px;
  }
}
</style>

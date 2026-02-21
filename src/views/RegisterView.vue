<template>
  <div class="auth-container">
    <div class="auth-left">
      <div class="auth-content">
        <div class="logo">Logo</div>

        <template v-if="!verificationEmail">
          <h1 class="auth-title">{{ t('auth.register') }}</h1>
          <p class="auth-subtitle">
            {{ t('auth.alreadyHaveAccount') }} <router-link to="/login" class="link">{{ t('auth.alreadyHaveAccountLink') }}</router-link>
          </p>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <div class="input-wrapper">
                <span class="input-icon"><img src="../assets/user.png" alt="user" style="width: 43px; opacity: 0.4;"></span>
                <input
                  type="text"
                  v-model="form.name"
                  class="input"
                  :placeholder="t('auth.enterName')"
                  required
                />
              </div>
            </div>

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
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  class="input"
                  :placeholder="t('auth.enterPassword')"
                  required
                  minlength="8"
                  @focus="showPasswordHints = true"
                  @blur="showPasswordHints = false"
                />
                <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
                  <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <div v-if="showPasswordHints || form.password" class="password-hints">
                <div :class="['hint', { 'hint-valid': form.password.length >= 8 }]">
                  <span class="hint-icon">{{ form.password.length >= 8 ? '\u2713' : '\u2022' }}</span>
                  {{ t('auth.hintMinLength') }}
                </div>
                <div :class="['hint', { 'hint-valid': /\d/.test(form.password) }]">
                  <span class="hint-icon">{{ /\d/.test(form.password) ? '\u2713' : '\u2022' }}</span>
                  {{ t('auth.hintDigit') }}
                </div>
                <div :class="['hint', { 'hint-valid': /[!@#$%^&*()_+\-=\[\]{};:\'&quot;\\|,.<>\/?`~]/.test(form.password) }]">
                  <span class="hint-icon">{{ /[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?`~]/.test(form.password) ? '\u2713' : '\u2022' }}</span>
                  {{ t('auth.hintSpecial') }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <div class="input-wrapper">
                <span class="input-icon"><img src="../assets/key.png" alt="password" style="width: 43px; opacity: 0.4;"></span>
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="form.confirmPassword"
                  class="input"
                  :placeholder="t('auth.confirmYourPassword')"
                  required
                />
                <button type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword" tabindex="-1">
                  <svg v-if="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <div v-if="form.confirmPassword" class="password-match-hint">
                <div v-if="form.password === form.confirmPassword" class="match-ok">
                  &#10003; {{ t('auth.passwordsMatch') }}
                </div>
                <div v-else class="match-no">
                  &#10007; {{ t('auth.passwordsDontMatch') }}
                </div>
              </div>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>

            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? t('auth.registering') : t('auth.registerButton') }}
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
        </template>

        <template v-else>
          <div class="verify-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1 class="auth-title">{{ t('auth.verifyTitle') }}</h1>
          <p class="auth-subtitle">
            {{ t('auth.verifySubtitle') }} <strong>{{ verificationEmail }}</strong>
          </p>
          <p class="console-hint">{{ t('auth.checkServerConsole') }}</p>

          <form @submit.prevent="handleVerify" class="auth-form">
            <div class="form-group">
              <div class="code-inputs">
                <input
                  v-for="(_, i) in 6"
                  :key="i"
                  ref="codeInputs"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  class="code-input"
                  :value="codeDigits[i]"
                  @input="handleCodeInput($event, i)"
                  @keydown="handleCodeKeydown($event, i)"
                  @paste="handleCodePaste"
                  required
                />
              </div>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-if="successMsg" class="success-message">{{ successMsg }}</div>

            <button type="submit" class="btn-submit" :disabled="loading || codeDigits.join('').length < 6">
              {{ loading ? t('auth.verifying') : t('auth.verifyButton') }}
            </button>
          </form>

          <div class="resend-section">
            <button class="resend-btn" @click="handleResend" :disabled="resendCooldown > 0">
              {{ resendCooldown > 0 ? `${t('auth.resendCode')} (${resendCooldown}s)` : t('auth.resendCode') }}
            </button>
          </div>
        </template>
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
import { ref, nextTick, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18nStore } from '../stores/i18n'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const i18nStore = useI18nStore()

const t = (key) => i18nStore.t(key)

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const emailError = ref('')
const successMsg = ref('')
const loading = ref(false)
const showPasswordHints = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Верификация
const verificationEmail = ref(route.query.verify || '')
const codeDigits = ref(['', '', '', '', '', ''])
const codeInputs = ref([])
const resendCooldown = ref(0)
let cooldownInterval = null

function startCooldown() {
  resendCooldown.value = 60
  if (cooldownInterval) clearInterval(cooldownInterval)
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(cooldownInterval)
  }, 1000)
}

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})

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

const handleRegister = async () => {
  error.value = ''

  if (!isValidEmail(form.value.email)) {
    emailError.value = t('auth.invalidEmail')
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = t('auth.passwordsDontMatch')
    return
  }

  if (form.value.password.length < 8) {
    error.value = t('auth.passwordTooShort')
    return
  }

  if (!/\d/.test(form.value.password)) {
    error.value = t('auth.passwordNeedsDigit')
    return
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(form.value.password)) {
    error.value = t('auth.passwordNeedsSpecial')
    return
  }

  loading.value = true

  const result = await authStore.register({
    name: form.value.name,
    email: form.value.email,
    password: form.value.password
  })

  loading.value = false

  if (result.success && result.needsVerification) {
    verificationEmail.value = result.email
    startCooldown()
  } else if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error
  }
}

function handleCodeInput(event, index) {
  const value = event.target.value.replace(/\D/g, '')
  codeDigits.value[index] = value.charAt(0) || ''
  event.target.value = codeDigits.value[index]

  if (value && index < 5) {
    nextTick(() => {
      codeInputs.value[index + 1]?.focus()
    })
  }
}

function handleCodeKeydown(event, index) {
  if (event.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    codeDigits.value[index - 1] = ''
    nextTick(() => {
      codeInputs.value[index - 1]?.focus()
    })
  }
}

function handleCodePaste(event) {
  event.preventDefault()
  const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < 6; i++) {
    codeDigits.value[i] = pasted[i] || ''
  }
  nextTick(() => {
    const focusIndex = Math.min(pasted.length, 5)
    codeInputs.value[focusIndex]?.focus()
  })
}

const handleVerify = async () => {
  error.value = ''
  successMsg.value = ''
  const code = codeDigits.value.join('')
  if (code.length < 6) return

  loading.value = true
  const result = await authStore.verifyEmail(verificationEmail.value, code)
  loading.value = false

  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error
  }
}

const handleResend = async () => {
  error.value = ''
  successMsg.value = ''
  const result = await authStore.resendCode(verificationEmail.value)
  if (result.success) {
    successMsg.value = t('auth.codeResent')
    startCooldown()
  } else {
    error.value = result.error
  }
}

// Если пришли с параметром verify (из LoginView), сразу запускаем cooldown
if (verificationEmail.value) {
  startCooldown()
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

.auth-subtitle strong {
  color: var(--text-primary, #1e293b);
  word-break: break-all;
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

.eye-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--text-tertiary, #94a3b8);
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.eye-btn:hover {
  color: var(--text-primary, #1e293b);
}

.password-match-hint {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
}

.match-ok {
  color: #059669;
}

.match-no {
  color: var(--danger-color, #ef4444);
}

.password-hints {
  margin-top: 8px;
  padding: 10px 12px;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 8px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-tertiary, #94a3b8);
  padding: 3px 0;
  transition: color 0.2s;
}

.hint-valid {
  color: #059669;
}

.hint-icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
  font-weight: 700;
}

.error-message {
  color: var(--danger-color, #ef4444);
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  word-break: break-word;
}

.success-message {
  color: #15803d;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  background: #dcfce7;
  border-radius: 8px;
  word-break: break-word;
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

/* Verification step */
.verify-icon {
  margin-bottom: 24px;
}

.console-hint {
  font-size: 13px;
  color: var(--text-tertiary, #94a3b8);
  margin-bottom: 24px;
  font-style: italic;
}

.code-inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.code-input {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  background: var(--bg-secondary, #f8fafc);
  color: var(--text-primary, #1e293b);
  outline: none;
  transition: all 0.2s;
}

.code-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.resend-section {
  text-align: center;
}

.resend-btn {
  background: none;
  border: none;
  color: var(--primary-color, #6366f1);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  transition: opacity 0.2s;
}

.resend-btn:hover:not(:disabled) {
  text-decoration: underline;
}

.resend-btn:disabled {
  color: var(--text-tertiary, #94a3b8);
  cursor: not-allowed;
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

  .code-input {
    width: 42px;
    height: 50px;
    font-size: 20px;
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

  .form-group {
    margin-bottom: 16px;
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

  .code-inputs {
    gap: 6px;
  }

  .code-input {
    width: 36px;
    height: 44px;
    font-size: 18px;
    border-radius: 8px;
  }

  .password-hints {
    padding: 8px 10px;
  }

  .hint {
    font-size: 11px;
  }

  .error-message,
  .success-message {
    font-size: 13px;
    padding: 10px;
  }

  .auth-form {
    margin-bottom: 24px;
  }
}
</style>

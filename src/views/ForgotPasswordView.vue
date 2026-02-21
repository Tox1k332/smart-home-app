<template>
  <div class="auth-container">
    <div class="auth-left">
      <div class="auth-content">
        <div class="logo">Logo</div>

        <!-- Шаг 1: Ввод email -->
        <template v-if="step === 1">
          <h1 class="auth-title">{{ t('auth.forgotPasswordTitle') }}</h1>
          <p class="auth-subtitle">{{ t('auth.forgotPasswordSubtitle') }}</p>

          <form @submit.prevent="handleSendCode" class="auth-form">
            <div class="form-group">
              <div class="input-wrapper">
                <span class="input-icon"><img src="../assets/mail.png" alt="email" style="width: 43px; opacity: 0.4;"></span>
                <input
                  type="email"
                  v-model="email"
                  class="input"
                  :placeholder="t('auth.enterEmail')"
                  required
                  @blur="validateEmail"
                  @input="clearEmailError"
                />
              </div>
              <div v-if="emailError" class="field-error">{{ emailError }}</div>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-if="successMsg" class="success-message">{{ successMsg }}</div>

            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? t('auth.sending') : t('auth.sendResetCode') }}
            </button>
          </form>

          <p class="back-link">
            <router-link to="/login" class="link">{{ t('auth.backToLogin') }}</router-link>
          </p>
        </template>

        <!-- Шаг 2: Ввод кода -->
        <template v-else-if="step === 2">
          <div class="verify-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1 class="auth-title">{{ t('auth.enterResetCode') }}</h1>
          <p class="auth-subtitle">
            {{ t('auth.resetCodeSentTo') }} <strong>{{ email }}</strong>
          </p>
          <p class="console-hint">{{ t('auth.checkServerConsole') }}</p>

          <form @submit.prevent="handleVerifyCode" class="auth-form">
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
              {{ loading ? t('auth.verifying') : t('auth.confirmCode') }}
            </button>
          </form>

          <div class="resend-section">
            <button class="resend-btn" @click="handleResend" :disabled="resendCooldown > 0">
              {{ resendCooldown > 0 ? `${t('auth.resendCode')} (${resendCooldown}s)` : t('auth.resendCode') }}
            </button>
          </div>
        </template>

        <!-- Шаг 3: Новый пароль -->
        <template v-else-if="step === 3">
          <h1 class="auth-title">{{ t('auth.newPasswordTitle') }}</h1>
          <p class="auth-subtitle">{{ t('auth.newPasswordSubtitle') }}</p>

          <form @submit.prevent="handleResetPassword" class="auth-form">
            <div class="form-group">
              <div class="input-wrapper">
                <span class="input-icon"><img src="../assets/key.png" alt="password" style="width: 43px; opacity: 0.4;"></span>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="newPassword"
                  class="input"
                  :placeholder="t('auth.enterNewPassword')"
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
              <div v-if="showPasswordHints || newPassword" class="password-hints">
                <div :class="['hint', { 'hint-valid': newPassword.length >= 8 }]">
                  <span class="hint-icon">{{ newPassword.length >= 8 ? '\u2713' : '\u2022' }}</span>
                  {{ t('auth.hintMinLength') }}
                </div>
                <div :class="['hint', { 'hint-valid': /\d/.test(newPassword) }]">
                  <span class="hint-icon">{{ /\d/.test(newPassword) ? '\u2713' : '\u2022' }}</span>
                  {{ t('auth.hintDigit') }}
                </div>
                <div :class="['hint', { 'hint-valid': /[!@#$%^&*()_+\-=\[\]{};:\'&quot;\\|,.<>\/?`~]/.test(newPassword) }]">
                  <span class="hint-icon">{{ /[!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?`~]/.test(newPassword) ? '\u2713' : '\u2022' }}</span>
                  {{ t('auth.hintSpecial') }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <div class="input-wrapper">
                <span class="input-icon"><img src="../assets/key.png" alt="password" style="width: 43px; opacity: 0.4;"></span>
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="confirmPassword"
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
              <div v-if="confirmPassword" class="password-match-hint">
                <div v-if="newPassword === confirmPassword" class="match-ok">
                  &#10003; {{ t('auth.passwordsMatch') }}
                </div>
                <div v-else class="match-no">
                  &#10007; {{ t('auth.passwordsDontMatch') }}
                </div>
              </div>
            </div>

            <div v-if="error" class="error-message">{{ error }}</div>

            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? t('auth.resetting') : t('auth.resetPassword') }}
            </button>
          </form>
        </template>

        <!-- Шаг 4: Успех -->
        <template v-else>
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>

          <h1 class="auth-title">{{ t('auth.passwordResetSuccess') }}</h1>
          <p class="auth-subtitle">{{ t('auth.passwordResetSuccessSubtitle') }}</p>

          <router-link to="/login" class="btn-submit" style="display: block; text-align: center; text-decoration: none;">
            {{ t('auth.backToLogin') }}
          </router-link>
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
import { useAuthStore } from '../stores/auth'
import { useI18nStore } from '../stores/i18n'

const authStore = useAuthStore()
const i18nStore = useI18nStore()

const t = (key) => i18nStore.t(key)

const step = ref(1)
const email = ref('')
const codeDigits = ref(['', '', '', '', '', ''])
const codeInputs = ref([])
const newPassword = ref('')
const confirmPassword = ref('')

const error = ref('')
const emailError = ref('')
const successMsg = ref('')
const loading = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showPasswordHints = ref(false)

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

const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

const validateEmail = () => {
  if (email.value && !isValidEmail(email.value)) {
    emailError.value = t('auth.invalidEmail')
  } else {
    emailError.value = ''
  }
}

const clearEmailError = () => {
  if (emailError.value && isValidEmail(email.value)) {
    emailError.value = ''
  }
}

// Шаг 1: Отправка кода на email
const handleSendCode = async () => {
  error.value = ''
  successMsg.value = ''

  if (!isValidEmail(email.value)) {
    emailError.value = t('auth.invalidEmail')
    return
  }

  loading.value = true

  const result = await authStore.forgotPassword(email.value)
  loading.value = false

  if (result.success) {
    step.value = 2
    startCooldown()
  } else {
    error.value = result.error
  }
}

// Шаг 2: Ввод кода — переход к новому паролю
const handleVerifyCode = () => {
  error.value = ''
  const code = codeDigits.value.join('')
  if (code.length < 6) return
  step.value = 3
}

// Шаг 3: Сброс пароля
const handleResetPassword = async () => {
  error.value = ''

  if (newPassword.value !== confirmPassword.value) {
    error.value = t('auth.passwordsDontMatch')
    return
  }

  if (newPassword.value.length < 8) {
    error.value = t('auth.passwordTooShort')
    return
  }

  if (!/\d/.test(newPassword.value)) {
    error.value = t('auth.passwordNeedsDigit')
    return
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword.value)) {
    error.value = t('auth.passwordNeedsSpecial')
    return
  }

  loading.value = true
  const code = codeDigits.value.join('')
  const result = await authStore.resetPassword(email.value, code, newPassword.value)
  loading.value = false

  if (result.success) {
    step.value = 4
  } else {
    error.value = result.error
  }
}

// Повторная отправка кода
const handleResend = async () => {
  error.value = ''
  successMsg.value = ''
  loading.value = true

  const result = await authStore.forgotPassword(email.value)
  loading.value = false

  if (result.success) {
    successMsg.value = t('auth.codeResent')
    startCooldown()
  } else {
    error.value = result.error
  }
}

// Обработка ввода кода
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

.back-link {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary, #64748b);
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

/* Verification step */
.verify-icon {
  margin-bottom: 24px;
}

.success-icon {
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
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
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

  .verify-icon svg,
  .success-icon svg {
    width: 48px;
    height: 48px;
  }
}
</style>

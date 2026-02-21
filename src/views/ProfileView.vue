<template>
  <div class="profile-page">
    <Navbar :logout-text="t('nav.exit')">
      <router-link to="/dashboard" class="header-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        {{ t('profile.home') }}
      </router-link>

      <router-link to="/status" class="header-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        </svg>
        {{ t('profile.statusPage') }}
      </router-link>
    </Navbar>

    <div class="profile-content">
      <div class="container">
        <!-- Уведомление -->
        <Transition name="toast">
          <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
            {{ toast.message }}
          </div>
        </Transition>

        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-container">
              <div class="avatar-circle" @click="triggerAvatarUpload">
                <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="Avatar" class="avatar-image" />
                <span v-else>{{ authStore.user?.name?.charAt(0).toUpperCase() }}</span>
                <div class="avatar-overlay">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              </div>
              <input
                ref="avatarInput"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                style="display: none"
                @change="handleAvatarUpload"
              />
              <button
                v-if="authStore.user?.avatar"
                class="avatar-remove-btn"
                @click="handleRemoveAvatar"
                :title="t('profile.removeAvatar')"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="profile-info">
              <h1>{{ authStore.user?.name }}</h1>
              <p class="email">{{ authStore.user?.email }}</p>
              <p class="member-since">{{ t('profile.memberSince') }} {{ formatDate(authStore.user?.created_at) }}</p>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">💡</div>
              <div class="stat-content">
                <div class="stat-value">{{ devicesStore.devices.length }}</div>
                <div class="stat-label">{{ t('profile.totalDevices') }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ activeDevices }}</div>
                <div class="stat-label">{{ t('profile.activeCount') }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">📍</div>
              <div class="stat-content">
                <div class="stat-value">{{ roomsCount }}</div>
                <div class="stat-label">{{ t('profile.roomsCount') }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <div class="stat-value">{{ activityPercentage }}%</div>
                <div class="stat-label">{{ t('profile.activity') }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h2>{{ t('profile.accountSettings') }}</h2>

          <div class="settings-grid">
            <!-- Личные данные -->
            <div class="settings-card">
              <div class="card-icon">👤</div>
              <h3>{{ t('profile.personalData') }}</h3>
              <p class="card-description">{{ t('profile.personalDataDesc') }}</p>

              <div class="setting-item">
                <label>{{ t('profile.name') }}</label>
                <div v-if="!editing.name" class="setting-value">
                  {{ authStore.user?.name }}
                  <button class="edit-btn" @click="startEdit('name')">{{ t('profile.change') }}</button>
                </div>
                <form v-else class="edit-form" @submit.prevent="saveName">
                  <input
                    v-model="editData.name"
                    type="text"
                    class="edit-input"
                    :placeholder="t('profile.newName')"
                    required
                  />
                  <div class="edit-actions">
                    <button type="submit" class="btn-save" :disabled="saving">{{ t('profile.save') }}</button>
                    <button type="button" class="btn-cancel" @click="cancelEdit('name')">{{ t('profile.cancel') }}</button>
                  </div>
                </form>
              </div>

              <div class="setting-item">
                <label>{{ t('profile.email') }}</label>
                <div v-if="!editing.email" class="setting-value">
                  {{ authStore.user?.email }}
                  <button class="edit-btn" @click="startEdit('email')">{{ t('profile.change') }}</button>
                </div>
                <form v-else class="edit-form" @submit.prevent="saveEmail">
                  <input
                    v-model="editData.email"
                    type="email"
                    class="edit-input"
                    :placeholder="t('profile.newEmail')"
                    required
                  />
                  <div class="edit-actions">
                    <button type="submit" class="btn-save" :disabled="saving">{{ t('profile.save') }}</button>
                    <button type="button" class="btn-cancel" @click="cancelEdit('email')">{{ t('profile.cancel') }}</button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Безопасность -->
            <div class="settings-card">
              <div class="card-icon">🔒</div>
              <h3>{{ t('profile.security') }}</h3>
              <p class="card-description">{{ t('profile.securityDesc') }}</p>

              <div class="setting-item">
                <label>{{ t('profile.password') }}</label>
                <div v-if="!editing.password" class="setting-value">
                  ••••••••
                  <button class="edit-btn" @click="startEdit('password')">{{ t('profile.change') }}</button>
                </div>
                <form v-else class="edit-form" @submit.prevent="savePassword">
                  <input
                    v-model="editData.currentPassword"
                    type="password"
                    class="edit-input"
                    :placeholder="t('profile.currentPassword')"
                    required
                  />
                  <input
                    v-model="editData.newPassword"
                    type="password"
                    class="edit-input"
                    :placeholder="t('profile.newPassword')"
                    minlength="6"
                    required
                  />
                  <input
                    v-model="editData.confirmPassword"
                    type="password"
                    class="edit-input"
                    :placeholder="t('profile.confirmNewPassword')"
                    minlength="6"
                    required
                  />
                  <div class="edit-actions">
                    <button type="submit" class="btn-save" :disabled="saving">{{ t('profile.save') }}</button>
                    <button type="button" class="btn-cancel" @click="cancelEdit('password')">{{ t('profile.cancel') }}</button>
                  </div>
                </form>
              </div>

              <div class="setting-item">
                <label>{{ t('profile.twoFactor') }}</label>
                <div class="setting-value">
                  <span class="status-badge status-off">{{ t('profile.disabled') }}</span>
                  <button class="edit-btn" disabled>{{ t('profile.setup') }}</button>
                </div>
              </div>
            </div>

            <!-- Уведомления (скрыто) -->
            <div class="settings-card" v-if="false">
              <div class="card-icon">🔔</div>
              <h3>{{ t('profile.notifications') }}</h3>
              <p class="card-description">{{ t('profile.notificationsDesc') }}</p>

              <div class="toggle-setting">
                <div>
                  <div class="toggle-label">{{ t('profile.emailNotifications') }}</div>
                  <div class="toggle-description">{{ t('profile.emailNotificationsDesc') }}</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" checked disabled>
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="toggle-setting">
                <div>
                  <div class="toggle-label">{{ t('profile.pushNotifications') }}</div>
                  <div class="toggle-description">{{ t('profile.pushNotificationsDesc') }}</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" disabled>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <!-- Приватность -->
            <div class="settings-card">
              <div class="card-icon">🛡️</div>
              <h3>{{ t('profile.privacy') }}</h3>
              <p class="card-description">{{ t('profile.privacyDesc') }}</p>

              <button class="action-btn" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {{ t('profile.downloadData') }}
              </button>

              <button class="action-btn action-btn-danger" @click="startDeleteAccount">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                {{ t('profile.deleteAccount') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка удаления аккаунта -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal">
          <h3>{{ t('profile.deleteAccount') }}</h3>
          <p class="modal-desc">{{ t('profile.deleteAccountDesc') }}</p>
          <form @submit.prevent="confirmDeleteAccount">
            <input
              v-model="deletePassword"
              type="password"
              class="edit-input"
              :placeholder="t('profile.enterPassword')"
              required
            />
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="showDeleteModal = false">{{ t('profile.cancel') }}</button>
              <button type="submit" class="btn-danger" :disabled="saving">{{ t('profile.deleteAccount') }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useDevicesStore } from '../stores/devices'
import { useI18nStore } from '../stores/i18n'
import Navbar from '../components/Navbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const devicesStore = useDevicesStore()
const i18nStore = useI18nStore()

const t = (key) => i18nStore.t(key)

const avatarInput = ref(null)
const saving = ref(false)
const showDeleteModal = ref(false)
const deletePassword = ref('')

const toast = reactive({ show: false, message: '', type: 'success' })
let toastTimer = null

const editing = reactive({ name: false, email: false, password: false })
const editData = reactive({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const activeDevices = computed(() =>
  devicesStore.devices.filter(d => d.is_on).length
)

const roomsCount = computed(() => {
  const rooms = new Set(devicesStore.devices.map(d => d.room))
  return rooms.size
})

const activityPercentage = computed(() => {
  if (devicesStore.devices.length === 0) return 0
  return Math.round((activeDevices.value / devicesStore.devices.length) * 100)
})

const formatDate = (dateString) => {
  if (!dateString) return t('profile.recentTime')
  const date = new Date(dateString)
  const localeMap = { ru: 'ru-RU', en: 'en-GB', fi: 'fi-FI' }
  return date.toLocaleDateString(localeMap[i18nStore.locale] || 'ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function showToast(message, type = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.show = true
  toast.message = message
  toast.type = type
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

function startEdit(field) {
  if (field === 'name') {
    editData.name = authStore.user?.name || ''
  } else if (field === 'email') {
    editData.email = authStore.user?.email || ''
  } else if (field === 'password') {
    editData.currentPassword = ''
    editData.newPassword = ''
    editData.confirmPassword = ''
  }
  editing[field] = true
}

function cancelEdit(field) {
  editing[field] = false
}

async function saveName() {
  saving.value = true
  const result = await authStore.updateProfile({ name: editData.name })
  saving.value = false
  if (result.success) {
    editing.name = false
    showToast(t('profile.saveSuccess'))
  } else {
    showToast(result.error, 'error')
  }
}

async function saveEmail() {
  saving.value = true
  const result = await authStore.updateProfile({ email: editData.email })
  saving.value = false
  if (result.success) {
    editing.email = false
    showToast(t('profile.saveSuccess'))
  } else {
    showToast(result.error, 'error')
  }
}

async function savePassword() {
  if (editData.newPassword !== editData.confirmPassword) {
    showToast(t('profile.passwordsDontMatch'), 'error')
    return
  }
  saving.value = true
  const result = await authStore.changePassword(editData.currentPassword, editData.newPassword)
  saving.value = false
  if (result.success) {
    editing.password = false
    showToast(t('profile.passwordChanged'))
  } else {
    showToast(result.error, 'error')
  }
}

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  saving.value = true
  const result = await authStore.uploadAvatar(file)
  saving.value = false
  avatarInput.value.value = ''
  if (result.success) {
    showToast(t('profile.avatarUploaded'))
  } else {
    showToast(result.error, 'error')
  }
}

async function handleRemoveAvatar() {
  saving.value = true
  const result = await authStore.deleteAvatar()
  saving.value = false
  if (result.success) {
    showToast(t('profile.avatarRemoved'))
  } else {
    showToast(result.error, 'error')
  }
}

function startDeleteAccount() {
  deletePassword.value = ''
  showDeleteModal.value = true
}

async function confirmDeleteAccount() {
  saving.value = true
  const result = await authStore.deleteAccount(deletePassword.value)
  saving.value = false
  if (result.success) {
    router.push('/login')
  } else {
    showToast(result.error, 'error')
  }
}

onMounted(() => {
  devicesStore.fetchDevices()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-secondary, #f8fafc);
}

.profile-content {
  padding: 32px 0;
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

/* Toast */
.toast {
  position: fixed;
  top: 90px;
  right: 32px;
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  word-break: break-word;
}

.toast-success {
  background: #22c55e;
  color: white;
}

.toast-error {
  background: #ef4444;
  color: white;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Profile Card */
.profile-card {
  background: var(--bg-primary, #ffffff);
  border-radius: 16px;
  padding: 40px;
  box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
  margin-bottom: 32px;
  animation: slideInUp 0.4s ease-out;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 2px solid var(--border-color, #e2e8f0);
}

.avatar-container {
  position: relative;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  font-size: 48px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.avatar-circle:hover {
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.45);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
}

.avatar-circle:hover .avatar-overlay {
  opacity: 1;
}

.avatar-remove-btn {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid var(--bg-primary, #ffffff);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
}

.avatar-remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.profile-info {
  min-width: 0;
}

.profile-info h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email {
  color: var(--text-secondary, #64748b);
  font-size: 16px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-since {
  color: var(--text-tertiary, #94a3b8);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary, #f8fafc);
  border-radius: 12px;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
  background: rgba(96, 165, 250, 0.08);
}

.stat-icon {
  font-size: 40px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-content {
  min-width: 0;
}

/* Settings */
.settings-section h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #1e293b);
  margin-bottom: 24px;
  animation: slideInUp 0.5s ease-out;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.settings-card {
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.1));
  transition: all 0.3s;
  animation: slideInUp 0.6s ease-out;
}

.settings-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.1));
}

.card-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.settings-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  margin-bottom: 8px;
}

.card-description {
  color: var(--text-secondary, #64748b);
  font-size: 14px;
  margin-bottom: 24px;
}

.setting-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.setting-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.setting-item label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.setting-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary, #1e293b);
  font-size: 15px;
  min-width: 0;
  gap: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.edit-btn {
  padding: 6px 16px;
  background: transparent;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 6px;
  color: var(--text-secondary, #64748b);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

.edit-btn:not(:disabled):hover {
  border-color: #60a5fa;
  color: #60a5fa;
}

.edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Edit form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary, #1e293b);
  background: var(--bg-secondary, #f8fafc);
  transition: border-color 0.2s;
  outline: none;
  box-sizing: border-box;
}

.edit-input:focus {
  border-color: #60a5fa;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.btn-save {
  padding: 8px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #2563eb;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 8px 20px;
  background: transparent;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 6px;
  color: var(--text-secondary, #64748b);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--text-secondary, #64748b);
}

.btn-danger {
  padding: 8px 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toggles */
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-off {
  background: #fee2e2;
  color: #991b1b;
}

.toggle-setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.toggle-setting:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.toggle-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #1e293b);
  margin-bottom: 4px;
}

.toggle-description {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 26px;
  display: inline-block;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--text-tertiary, #cbd5e1);
  border-radius: 13px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .toggle-slider {
  background: #60a5fa;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Action buttons */
.action-btn {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid var(--border-color, #e2e8f0);
  background: var(--bg-primary, #ffffff);
  border-radius: 8px;
  color: var(--text-secondary, #64748b);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.action-btn:last-child {
  margin-bottom: 0;
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn-danger {
  border-color: var(--danger-color, #ef4444);
  color: var(--danger-color, #ef4444);
}

.action-btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.modal {
  background: var(--bg-primary, #ffffff);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--danger-color, #ef4444);
  margin-bottom: 12px;
}

.modal-desc {
  color: var(--text-secondary, #64748b);
  font-size: 14px;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  justify-content: flex-end;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9);
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .profile-card {
    padding: 24px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .toast {
    left: 16px;
    right: 16px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .profile-content {
    padding: 16px 0;
  }

  .container {
    padding: 0 12px;
  }

  .profile-card {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .profile-header {
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 20px;
  }

  .avatar-circle {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }

  .avatar-remove-btn {
    width: 24px;
    height: 24px;
  }

  .avatar-remove-btn svg {
    width: 12px;
    height: 12px;
  }

  .profile-info h1 {
    font-size: 22px;
  }

  .email {
    font-size: 14px;
  }

  .member-since {
    font-size: 12px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-item {
    padding: 12px;
    gap: 10px;
  }

  .stat-icon {
    font-size: 28px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 12px;
  }

  .settings-section h2 {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .settings-grid {
    gap: 16px;
  }

  .settings-card {
    padding: 16px;
    border-radius: 10px;
  }

  .card-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .settings-card h3 {
    font-size: 17px;
  }

  .card-description {
    font-size: 13px;
    margin-bottom: 16px;
  }

  .setting-item {
    margin-bottom: 14px;
    padding-bottom: 14px;
  }

  .setting-value {
    font-size: 14px;
  }

  .edit-btn {
    padding: 5px 12px;
    font-size: 12px;
  }

  .edit-input {
    padding: 8px 12px;
    font-size: 13px;
  }

  .btn-save,
  .btn-cancel {
    padding: 7px 14px;
    font-size: 12px;
  }

  .toggle-label {
    font-size: 14px;
  }

  .toggle-description {
    font-size: 12px;
  }

  .action-btn {
    padding: 10px 16px;
    font-size: 13px;
  }

  /* Модалка */
  .modal-overlay {
    padding: 12px;
  }

  .modal {
    padding: 20px;
    border-radius: 12px;
    max-width: calc(100% - 24px);
  }

  .modal h3 {
    font-size: 18px;
  }

  .modal-desc {
    font-size: 13px;
  }

  .btn-danger {
    padding: 7px 14px;
    font-size: 12px;
  }

  /* Toast */
  .toast {
    top: 60px;
    left: 12px;
    right: 12px;
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>

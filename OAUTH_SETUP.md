# 🔐 Настройка OAuth (GitHub и Google)

OAuth позволяет пользователям входить через GitHub или Google без регистрации.

---

## 📋 Шаг 1: GitHub OAuth

### 1.1 Создайте OAuth App на GitHub

1. Зайдите на: https://github.com/settings/developers
2. **OAuth Apps** → **New OAuth App**
3. Заполните:

| Поле | Значение |
|------|----------|
| **Application name** | `Smart Home App` |
| **Homepage URL** | `https://tox1k332.github.io/smart-home-app/` |
| **Authorization callback URL** | `https://smart-home-api-l5dr.onrender.com/api/oauth/github/callback` |
| **Device Flow** | ❌ Не включать |

4. **Register application**

### 1.2 Получите Client Secret

1. После создания нажмите **Generate a new client secret**
2. **Скопируйте секрет** (показывается только один раз!)
3. Запишите **Client ID** (показывается всегда)

### 1.3 Добавьте переменные на Render

1. Зайдите на: https://dashboard.render.com
2. Ваш сервис `smart-home-api` → **Environment**
3. Добавьте:

```
GITHUB_CLIENT_ID=Ov23li... (ваш Client ID)
GITHUB_CLIENT_SECRET=... (ваш Client Secret)
```

---

## 📋 Шаг 2: Google OAuth

### 2.1 Создайте проект в Google Cloud

1. Зайдите на: https://console.cloud.google.com/
2. **Создайте новый проект** (или выберите существующий)
3. Название: `Smart Home App`

### 2.2 Включите Google+ API

1. В поиске введите **Google+ API**
2. Нажмите **Enable**

### 2.3 Создайте OAuth Credentials

1. Зайдите на: https://console.cloud.google.com/apis/credentials
2. **Create Credentials** → **OAuth client ID**
3. **Application type**: **Web application**
4. Заполните:

| Поле | Значение |
|------|----------|
| **Name** | `Smart Home App Web` |
| **Authorized JavaScript origins** | `https://tox1k332.github.io` |
| **Authorized redirect URIs** | `https://smart-home-api-l5dr.onrender.com/api/oauth/google/callback` |

5. **Create**

### 2.4 Получите Client ID и Secret

После создания скопируйте:
- **Client ID** (например: `123456789-xxx.apps.googleusercontent.com`)
- **Client Secret**

### 2.5 Добавьте переменные на Render

1. Зайдите на: https://dashboard.render.com
2. Ваш сервис `smart-home-api` → **Environment**
3. Добавьте:

```
GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=... (ваш Client Secret)
```

---

## 📋 Шаг 3: Перезапустите Render

1. Зайдите на: https://dashboard.render.com
2. Ваш сервис → **Settings** → **Factory reboot**
3. **Reboot Service**

---

## ✅ Проверка

### 1. Проверьте переменные на Render

https://dashboard.render.com → ваш сервис → **Environment**

Должны быть:
```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 2. Попробуйте войти

1. Откройте: https://tox1k332.github.io/smart-home-app/
2. Нажмите **Войти через GitHub** или **Войти через Google**
3. Авторизуйтесь
4. Должно перекинуть на Dashboard с токеном

---

## 🔍 Отладка

### Если не работает GitHub:

1. Проверьте **callback URL** в настройках GitHub App
2. Должен быть: `https://smart-home-api-l5dr.onrender.com/api/oauth/github/callback`
3. Проверьте логи Render — должна быть ошибка

### Если не работает Google:

1. Проверьте **Authorized redirect URIs** в Google Console
2. Должен быть: `https://smart-home-api-l5dr.onrender.com/api/oauth/google/callback`
3. Проверьте, что Google+ API включён

### Ошибка "OAuth не настроен":

1. Проверьте, что переменные добавлены на Render
2. Сделайте **Factory reboot**
3. Проверьте логи — должна быть ошибка

---

## 📊 Логи

В логах Render должно быть:
```
✅ Resend configured — email sending enabled
🔍 Connecting to MongoDB...
✅ MongoDB connected to database: smart-home-app
🚀 Server is running on port 7860
```

При OAuth входе:
```
🔍 GitHub OAuth callback
✅ GitHub user: { login: '...', email: '...' }
🔑 Generated JWT for user: ...
```

---

## 🎉 Готово!

Теперь пользователи могут входить через GitHub или Google! 🍀

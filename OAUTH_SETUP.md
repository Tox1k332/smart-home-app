# 🔐 Настройка OAuth (GitHub и Google)

OAuth позволяет пользователям входить через свои аккаунты GitHub и Google.

---

## 📋 Шаг 1: Настройка GitHub OAuth

### 1.1 Создайте OAuth приложение на GitHub

1. Зайди на https://github.com/settings/developers
2. **New OAuth App** (или выбери существующее)
3. Заполни настройки:

| Поле | Значение |
|------|----------|
| **Application name** | `Smart Home App` |
| **Homepage URL** | `https://tox1k332.github.io/smart-home-app` |
| **Authorization callback URL** | `https://smart-home-api-l5dr.onrender.com/api/oauth/github/callback` |

4. **Register application**

### 1.2 Получи Client Secret

1. После создания нажми **Generate a new client secret**
2. **Скопируй Client Secret** (показывается только один раз!)
3. Client ID уже виден

### 1.3 Добавь переменные на Render

1. Зайди на https://dashboard.render.com
2. Твой сервис `smart-home-api` → **Environment**
3. Добавь переменные:

| Имя | Значение |
|-----|----------|
| `GITHUB_CLIENT_ID` | `Ov23li4JWccIITSDPyc1` (твой Client ID) |
| `GITHUB_CLIENT_SECRET` | `...` (твой Client Secret) |

4. **Save Changes** — сервис перезапустится

---

## 📋 Шаг 2: Настройка Google OAuth

### 2.1 Создайте OAuth клиент в Google Cloud

1. Зайди на https://console.cloud.google.com/apis/credentials
2. **Create Credentials** → **OAuth client ID**
3. **Application type:** Web application
4. **Name:** `Smart Home App`

### 2.2 Настрой Authorized redirect URIs

В разделе **Authorized redirect URIs** добавь:

```
https://smart-home-api-l5dr.onrender.com/api/oauth/google/callback
```

### 2.3 Получи Client ID и Secret

После создания скопируй:
- **Client ID**
- **Client Secret**

### 2.4 Добавь переменные на Render

В Render Dashboard добавь:

| Имя | Значение |
|-----|----------|
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` (твой Client ID) |
| `GOOGLE_CLIENT_SECRET` | `...` (твой Client Secret) |

**Save Changes** — сервис перезапустится

---

## ✅ Шаг 3: Проверка

### 1. Проверь логи Render

После перезапуска в логах должно быть:
```
📊 Database type: mongodb
🚀 Server is running on port 7860
```

### 2. Протестируй вход

1. Открой https://tox1k332.github.io/smart-home-app/login
2. Нажми на иконку **GitHub** или **Google**
3. Авторизуйся через сервис
4. Должно перенаправить обратно на `/login?token=...`

### 3. Проверь консоль браузера

Не должно быть ошибок CORS или 404.

---

## 🔍 Если OAuth не работает

### Ошибка: "GitHub OAuth не настроен"

**Причина:** Не добавлены переменные на Render

**Решение:**
1. Проверь `.env` на Render
2. Убедись что `GITHUB_CLIENT_ID` и `GITHUB_CLIENT_SECRET` установлены
3. Перезапусти сервис

### Ошибка: "redirect_uri_mismatch"

**Причина:** Callback URL в настройках OAuth не совпадает с реальным

**Решение для GitHub:**
1. Зайди в настройки OAuth приложения
2. Обнови **Authorization callback URL**:
   ```
   https://smart-home-api-l5dr.onrender.com/api/oauth/github/callback
   ```

**Решение для Google:**
1. Зайди в Google Cloud Console → Credentials
2. Обнови **Authorized redirect URIs**:
   ```
   https://smart-home-api-l5dr.onrender.com/api/oauth/google/callback
   ```

### OAuth работает локально, но не на production

**Причина:** Frontend использует неправильный URL

**Решение:**
1. Убедись что `src/services/oauth.js` содержит правильный URL
2. Пересобери frontend: `npm run build`
3. Запушь: `git push`

---

## 📊 Тарифы

OAuth от GitHub и Google — **полностью бесплатно!**

---

## 🎉 Готово!

Теперь пользователи могут входить через GitHub и Google! 🚀

# 🚀 Деплой на Render.com

Быстрая инструкция по развёртыванию Smart Home Application на Render.com.

---

## 💰 Стоимость

| Услуга | Цена |
|--------|------|
| **Render Web Service** | Бесплатно (750 часов/мес) |
| **MongoDB Atlas** | Бесплатно |
| **Итого:** | **0 руб/мес** 🎉 |

---

## 📋 Шаг 1: Подготовка MongoDB Atlas

1. Зайдите на https://cloud.mongodb.com
2. Выберите свой кластер
3. **Network Access** → **Add IP Address**
4. Выберите **Allow Access from Anywhere** (0.0.0.0/0)
5. **Confirm**

---

## 📋 Шаг 2: Создание Web Service на Render

### 2.1. Регистрация

1. Зайдите на https://render.com
2. **Sign Up** → через GitHub
3. Подтвердите email

### 2.2. Создание сервиса

1. **New +** → **Web Service**
2. Выберите **Connect a repository**
3. Найдите репозиторий `smart-home-app`
4. **Connect**

### 2.3. Настройка

Заполните поля:

| Поле | Значение |
|------|----------|
| **Name** | `smart-home-api` |
| **Region** | Frankfurt (Germany) |
| **Branch** | `main` |
| **Root Directory** | (оставьте пустым) |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server/index.js` |
| **Instance Type** | `Free` |

### 2.4. Переменные окружения

Нажмите **Advanced** → **Add Environment Variable** и добавьте:

| Имя | Значение |
|-----|----------|
| `MONGODB_URI` | `mongodb+srv://smarthome:3Ej0jaDEXvCBEQZN@cluster0.pktf6p2.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `smarthome-jwt-secret-key-2026-change-in-production` |
| `BACKEND_URL` | `https://smart-home-api-XXXX.onrender.com` |
| `FRONTEND_URL` | `https://tox1k332.github.io/smart-home-app` |
| `OPENWEATHER_API_KEY` | `46954c93e53c9992375e3904ec3618a7` |
| `PORT` | `7860` |
| `NODE_ENV` | `production` |

**Важно:** `BACKEND_URL` будет известен после первого деплоя (см. шаг 3).

### 2.5. Создание

1. Нажмите **Create Web Service**
2. Дождитесь деплоя (~3-5 минут)

---

## 📋 Шаг 3: Получение URL backend

После деплоя:

1. Зайдите в сервис на Render
2. Скопируйте URL сверху (например: `https://smart-home-api-xxxx.onrender.com`)
3. Обновите переменную `BACKEND_URL` в настройках:
   - **Environment** → найдите `BACKEND_URL` → **Edit**
   - Вставьте актуальный URL
   - **Save Changes**

---

## 📋 Шаг 4: Проверка работы

### 4.1. Health check

Откройте:
```
https://smart-home-api-xxxx.onrender.com/api/health
```

Должно вернуться:
```json
{
  "status": "ok",
  "message": "Smart Home API is running"
}
```

### 4.2. Проверка базы данных

В логах Render должно быть:
```
✅ MongoDB connected
📊 Database type: mongodb
```

**Логи находятся:**
- Зайдите в сервис на Render
- Вкладка **Logs**

---

## 📋 Шаг 5: Обновление frontend

Обновите `BACKEND_URL` в настройках GitHub Pages:

1. Зайдите в репозиторий на GitHub
2. **Settings** → **Environments** → **github-pages**
3. Обновите переменную `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=https://smart-home-api-xxxx.onrender.com/api
   ```

Или обновите `src/services/api.js`:

```javascript
const getBaseURL = () => {
  if (window.location.hostname.includes('github.io')) {
    return 'https://smart-home-api-xxxx.onrender.com/api'
  }
  return import.meta.env.VITE_API_BASE_URL || '/api'
}
```

---

## ⚠️ Важные замечания

### "Пробуждение" сервиса

Render на бесплатном тарифе "засыпает" после 15 минут бездействия:
- Первый запрос после простоя занимает ~30-50 секунд
- subsequent запросы быстрые

**Перед демонстрацией:**
1. Откройте `/api/health` за 1 минуту до защиты
2. Дождитесь ответа
3. После этого приложение будет работать быстро

### Ограничения бесплатного тарифа

| Параметр | Значение |
|----------|----------|
| Часы в месяц | 750 часов (хватает на 24/7) |
| RAM | 512 MB |
| CPU | Shared |
| Storage | Неограниченно |

---

## 🛠️ Решение проблем

### ❌ Service not found

**Проблема:** Неправильный URL

**Решение:** Проверьте URL в настройках Render

### ❌ MongoDB connection error

**Проблема:** Неверный `MONGODB_URI` или доступ к кластеру

**Решение:**
1. Проверьте `MONGODB_URI` в переменных окружения
2. Проверьте **Network Access** в MongoDB Atlas (0.0.0.0/0)

### ❌ CORS ошибки

**Проблема:** Backend не разрешает запросы с frontend

**Решение:** Проверьте `FRONTEND_URL` в переменных Render:
```
FRONTEND_URL=https://tox1k332.github.io/smart-home-app
```

---

## 📊 Мониторинг

### Render
- https://dashboard.render.com
- **Logs** вкладка в сервисе

### MongoDB Atlas
- https://cloud.mongodb.com
- **Clusters** → **Collections**

---

## 🎉 Итог

Ваше приложение доступно:
- **Frontend:** https://tox1k332.github.io/smart-home-app
- **Backend:** https://smart-home-api-xxxx.onrender.com
- **База данных:** MongoDB Atlas (бесплатно)

**Стоимость:** 0 руб/мес 🎉

---

**Удачи на защите! 🍀**

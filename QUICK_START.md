# ⚡ Быстрый старт - Деплой за 30 минут

Краткая инструкция для развёртывания Smart Home App на бесплатных хостингах.

---

## 📋 Чек-лист

### 1. GitHub (5 мин)
```bash
git init
git add .
git commit -m "Deploy ready"
# Создай репозиторий на github.com и запуш:
git remote add origin https://github.com/USERNAME/smart-home-app.git
git push -u origin main
```

### 2. MongoDB Atlas (5 мин)
1. https://mongodb.com/cloud/atlas/register
2. **Build a Database** → **FREE**
3. **Database Access**: создай пользователя `smarthome` с паролем
4. **Network Access**: **Allow Access from Anywhere** (0.0.0.0/0)
5. **Connect**: скопируй строку подключения
6. Замени `<password>` в строке на свой пароль

### 3. Render - Backend (10 мин)
1. https://render.com → Sign in with GitHub
2. **New +** → **Web Service**
3. Выбери репозиторий `smart-home-app`
4. Настройки:
   - **Name**: `smart-home-api`
   - **Region**: Frankfurt
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
5. **Environment** → добавь переменные:
   ```
   NODE_ENV=production
   MONGODB_URI=<строка из MongoDB>
   JWT_SECRET=any-random-string-min-32-chars
   FRONTEND_URL=https://smart-home-app.vercel.app
   OPENWEATHER_API_KEY=46954c93e53c9992375e3904ec3618a7
   ```
6. **Create Web Service** → жди 3-5 мин
7. Скопируй URL (типа `https://smart-home-api-xxxx.onrender.com`)

### 4. Vercel - Frontend (5 мин)
1. https://vercel.com → Sign in with GitHub
2. **Add New...** → **Project**
3. Выбери `smart-home-app` → **Import**
4. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://smart-home-api-xxxx.onrender.com/api
   ```
5. **Deploy** → жди 2 мин
6. Готово! URL: `https://smart-home-app.vercel.app`

### 5. Проверка (5 мин)
1. Открой `https://smart-home-api-xxxx.onrender.com/api/health`
   - Должно вернуться: `{"status": "ok", ...}`
2. Открой `https://smart-home-app.vercel.app`
3. Зарегистрируйся
4. Создай устройство
5. Обнови страницу — устройство должно остаться

---

## 🔗 Ссылки на дашборды

- **Vercel**: https://vercel.com/dashboard
- **Render**: https://dashboard.render.com
- **MongoDB**: https://cloud.mongodb.com

---

## ⚠️ Важно!

1. **Render "засыпает"** через 15 мин бездействия
   - Первый запрос после простоя грузится ~30 сек
   - Решение: открой `/api/health` за минуту до демонстрации

2. **CORS ошибки**
   - Проверь что `FRONTEND_URL` на Render совпадает с Vercel URL

3. **Данные не сохраняются**
   - Проверь `MONGODB_URI` (пароль без спецсимволов)
   - Проверь Network Access в MongoDB (0.0.0.0/0)

---

## 🎓 Для защиты

- [ ] Открой приложение за 5 мин до защиты
- [ ] Оставь вкладку открытой (не закрывай)
- [ ] Сделай скриншоты на всякий случай
- [ ] Подготовь локальную версию на флешке

---

## 📞 Если что-то пошло не так

1. Проверь логи на Render: **Logs** вкладка
2. Проверь консоль браузера (F12)
3. Проверь переменные окружения на обоих хостингах
4. Попробуй перезапустить сервис на Render

---

**Удачи на защите! 🍀**

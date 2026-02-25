# ⚡ БЫСТРЫЙ СТАРТ - БЕСПЛАТНЫЙ ДЕПЛОЙ

Развёртывание за 30 минут на GitHub Pages + Hugging Face Spaces.

---

## 💰 Стоимость: 0 руб! 🎉

---

## 📋 Пошаговая инструкция

### 1. GitHub репозиторий (5 мин)

```bash
cd d:\vue\smart-home-app
git init
git add .
git commit -m "Initial commit"
```

1. https://github.com/new
2. Репозиторий: `smart-home-app` (Public)
3. Запуш:

```bash
git remote add origin https://github.com/USERNAME/smart-home-app.git
git branch -M main
git push -u origin main
```

---

### 2. Настрой vite.config.js (2 мин)

Открой `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/smart-home-app/',  // Твой репозиторий
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

Запуш:
```bash
git add vite.config.js
git commit -m "Update vite config for GitHub Pages"
git push
```

---

### 3. Создай Dockerfile (3 мин)

Создай `Dockerfile` в корне:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server/ ./server/

EXPOSE 7860

CMD ["node", "server/index.js"]
```

Запуш:
```bash
git add Dockerfile
git commit -m "Add Dockerfile for Hugging Face"
git push
```

---

### 4. Hugging Face Space (10 мин)

1. https://huggingface.co/signup (через GitHub)
2. **New Space**:
   - **Name**: `smart-home-api`
   - **SDK**: Docker
   - **Public**
3. **Create Space**

#### Загрузи файлы:

1. В Space → **Files** → **Add file** → **Upload files**
2. Загрузи:
   - `Dockerfile`
   - `package.json`
   - `package-lock.json`
   - Папку `server/` (всю)
3. **Commit**

#### Настрой переменные:

**Settings** → **Variables and secrets**:

```
PORT=7860
NODE_ENV=production
BACKEND_URL=https://USERNAME-smart-home-api.hf.space
FRONTEND_URL=https://USERNAME.github.io/smart-home-app
MONGODB_URI=<твоя строка из MongoDB Atlas>
JWT_SECRET=smarthome-secret-2026
OPENWEATHER_API_KEY=46954c93e53c9992375e3904ec3618a7
```

Жди пока Space запустится (~5 мин).

---

### 5. GitHub Pages (5 мин)

1. Репозиторий → **Settings** → **Pages**
2. **Source**: GitHub Actions
3. Готово! Деплой настроен автоматически

При каждом пуше в `main` фронтенд будет деплоиться автоматически.

Первый деплой:
- Перейди во вкладку **Actions**
- Выбери **Deploy to GitHub Pages**
- Дождись завершения (~2-3 мин)

После деплоя:
```
https://USERNAME.github.io/smart-home-app
```

---

### 6. MongoDB Atlas (5 мин)

1. https://mongodb.com/cloud/atlas/register
2. **Build a Database** → **FREE**
3. **Database Access**: создай пользователя
4. **Network Access**: 0.0.0.0/0
5. **Connect**: скопируй строку
6. Вставь в `MONGODB_URI` на Hugging Face

---

### 7. Проверка (2 мин)

**Backend:**
```
https://USERNAME-smart-home-api.hf.space/api/health
```

**Frontend:**
```
https://USERNAME.github.io/smart-home-app
```

**Тест:**
- [ ] Регистрация работает
- [ ] Устройства создаются

---

## ⚠️ Важно!

### Перед защитой:

1. **"Разбуди" Space** за 5 минут:
   - Открой https://USERNAME-smart-home-api.hf.space/api/health
   - Подожди 30-60 сек

2. **Оставь вкладку открытой** во время защиты

3. **Сделай скриншоты** на всякий случай

---

## 🔧 Команды

```bash
# Локальный запуск
npm run dev
npm run server

# Сборка
npm run build

# Деплой
git add .
git commit -m "Update"
git push
```

---

## 🆘 Если проблемы

### 404 на GitHub Pages
Проверь `vite.config.js`:
```javascript
base: '/smart-home-app/',
```

### Backend не грузится
Space "заснул" - открой `/api/health` и подожди 1 мин.

### CORS ошибки
Проверь `FRONTEND_URL` в переменных Hugging Face.

---

## 📚 Полная инструкция

[DEPLOYMENT_FREE.md](./DEPLOYMENT_FREE.md)

---

**Успехов! 🎉**

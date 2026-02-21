# 🆓 ДЕПЛОЙ НА GITHUB PAGES + HUGGING FACE SPACES

Полностью бесплатное развёртывание Smart Home Application.

---

## 💰 Стоимость

| Услуга | Цена |
|--------|------|
| **GitHub Pages** (Frontend) | Бесплатно |
| **Hugging Face Spaces** (Backend) | Бесплатно |
| **MongoDB Atlas** (База данных) | Бесплатно |
| **Итого:** | **0 руб/мес** 🎉 |

---

## 📋 Что будем использовать

| Компонент | Сервис | URL |
|-----------|--------|-----|
| **Frontend** | GitHub Pages | https://username.github.io/smart-home-app |
| **Backend** | Hugging Face Spaces | https://username-smart-home-api.hf.space |
| **База данных** | MongoDB Atlas | Бесплатный кластер |

---

## 📦 Шаг 1: Подготовка проекта

### 1.1. Создай GitHub репозиторий

```bash
cd d:\vue\smart-home-app
git init
git add .
git commit -m "Initial commit"
```

1. Зайди на https://github.com/new
2. Создай репозиторий: `smart-home-app`
3. Сделай **Public**
4. Запуш:

```bash
git remote add origin https://github.com/USERNAME/smart-home-app.git
git branch -M main
git push -u origin main
```

---

## 🎨 Шаг 2: Деплой Frontend на GitHub Pages

### 2.1. Настрой vite.config.js

Открой `vite.config.js` и добавь `base` путь:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/smart-home-app/',  // Замени USERNAME на свой логин
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

### 2.2. Создай файл для GitHub Pages

Создай `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: https://YOUR-USERNAME-smart-home-api.hf.space/api
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Замени `YOUR-USERNAME` на свой GitHub логин!**

### 2.3. Запуш изменения

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push
```

### 2.4. Включи GitHub Pages

1. Зайди в репозиторий на GitHub
2. **Settings** → **Pages**
3. **Source**: Deploy from a branch
4. **Branch**: main → **gh-pages**
5. **Save**

Через 2-3 минуты сайт будет доступен:
```
https://USERNAME.github.io/smart-home-app
```

---

## 🔧 Шаг 3: Деплой Backend на Hugging Face Spaces

### 3.1. Создай аккаунт на Hugging Face

1. Зайди на https://huggingface.co
2. **Sign Up** через GitHub
3. Подтверди email

### 3.2. Создай Space

1. Кликни на аватар → **New Space**
2. Заполни:
   - **Space name**: `smart-home-api`
   - **License**: MIT
   - **Space SDK**: Docker
   - **Visibility**: Public
3. **Create Space**

### 3.3. Создай Dockerfile

В корне проекта создай `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем сервер
COPY server/ ./server/

# Открываем порт
EXPOSE 7860

# Запускаем сервер
CMD ["node", "server/index.js"]
```

### 3.4. Обнови server/index.js для Hugging Face

Открой `server/index.js` и измени порт:

```javascript
const PORT = process.env.PORT || 7860  // Hugging Face использует порт 7860
```

### 3.5. Создай .env для Hugging Face

Создай файл `server/.env` (для локальной разработки):

```env
PORT=7860
NODE_ENV=production
BACKEND_URL=https://YOUR-USERNAME-smart-home-api.hf.space
FRONTEND_URL=https://YOUR-USERNAME.github.io/smart-home-app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-home
JWT_SECRET=smarthome-hf-secret-key-2026
OPENWEATHER_API_KEY=46954c93e53c9992375e3904ec3618a7
```

### 3.6. Загрузи на Hugging Face

#### Вариант 1: Через Git

```bash
# Клонируй свой Space
git clone https://huggingface.co/spaces/YOUR-USERNAME/smart-home-api
cd smart-home-api

# Скопируй файлы проекта
cp ../smart-home-app/Dockerfile .
cp ../smart-home-app/package*.json .
cp -r ../smart-home-app/server .

# Запуш
git add .
git commit -m "Initial commit"
git push
```

#### Вариант 2: Через веб-интерфейс

1. Зайди в свой Space на Hugging Face
2. **Files** → **Add file** → **Upload files**
3. Загрузи:
   - `Dockerfile`
   - `package.json`
   - `package-lock.json`
   - Папку `server/`
4. **Commit changes**

### 3.7. Настрой переменные окружения

1. Зайди в свой Space → **Settings**
2. **Variables and secrets** → **New variable**
3. Добавь переменные:

```
PORT=7860
NODE_ENV=production
BACKEND_URL=https://YOUR-USERNAME-smart-home-api.hf.space
FRONTEND_URL=https://YOUR-USERNAME.github.io/smart-home-app
MONGODB_URI=<твоя строка MongoDB>
JWT_SECRET=smarthome-hf-secret-key-2026
OPENWEATHER_API_KEY=46954c93e53c9992375e3904ec3618a7
```

### 3.8. Дождись деплоя

Space автоматически начнёт сборку (~3-5 минут).

Когда появится **Running** - backend готов!

Проверь:
```
https://YOUR-USERNAME-smart-home-api.hf.space/api/health
```

---

## 🔗 Шаг 4: Соедини Frontend и Backend

### 4.1. Обнови переменную на GitHub Pages

1. Зайди в репозиторий на GitHub
2. **Settings** → **Environments** → **github-pages**
3. **Add variable**:

```
Name: VITE_API_BASE_URL
Value: https://YOUR-USERNAME-smart-home-api.hf.space/api
```

### 4.2. Пересобери Frontend

```bash
# Локально
npm run build

# Запуш dist (если нужно)
git add dist
git commit -m "Rebuild for Hugging Face backend"
git push
```

Или просто сделай новый коммит в main - GitHub Actions пересоберёт автоматически.

---

## ✅ Шаг 5: Проверка работы

### 5.1. Frontend

Открой:
```
https://USERNAME.github.io/smart-home-app
```

### 5.2. Backend

Открой:
```
https://USERNAME-smart-home-api.hf.space/api/health
```

Должно вернуться:
```json
{
  "status": "ok",
  "message": "Smart Home API is running"
}
```

### 5.3. Протестируй

- [ ] Страница входа загружается
- [ ] Регистрация работает
- [ ] Вход работает
- [ ] Устройства создаются
- [ ] Аватарки загружаются

---

## ⚠️ Важные замечания

### "Пробуждение" backend

Hugging Face Spaces "засыпает" после 48 часов бездействия.

**Перед защитой:**
1. Открой https://USERNAME-smart-home-api.hf.space/api/health
2. Подожди 30-60 секунд пока Space "проснётся"
3. После этого frontend будет работать быстро

### Ограничения

| Параметр | Значение |
|----------|----------|
| CPU | 2 vCPU |
| RAM | 16GB |
| Storage | 50GB |
| Uptime | ~99% (засыпает через 48ч) |

---

## 🛠️ Решение проблем

### ❌ 404 на GitHub Pages

**Проблема:** Неправильный base путь

**Решение:** Проверь `vite.config.js`:
```javascript
base: '/smart-home-app/',  // Должен совпадать с именем репозитория
```

### ❌ Failed to fetch API

**Проблема:** Backend "заснул" или неверный URL

**Решение:**
1. Проверь https://USERNAME-smart-home-api.hf.space/api/health
2. Если не грузится - Space "проснётся" через 30-60 сек
3. Проверь `VITE_API_BASE_URL` в сборке

### ❌ CORS ошибки

**Проблема:** Backend не разрешает запросы с GitHub Pages

**Решение:** Проверь `FRONTEND_URL` в переменных Hugging Face:
```
FRONTEND_URL=https://USERNAME.github.io/smart-home-app
```

---

## 📊 Мониторинг

### GitHub Pages
- https://github.com/USERNAME/smart-home-app/actions
- Логи сборок

### Hugging Face
- https://huggingface.co/spaces/USERNAME/smart-home-api
- **Logs** вкладка

### MongoDB Atlas
- https://cloud.mongodb.com
- **Clusters** → **Collections**

---

## 💡 Советы для защиты

1. **"Разбуди" Space за 5 минут до защиты:**
   - Открой https://USERNAME-smart-home-api.hf.space/api/health
   - Дождись ответа

2. **Оставь вкладку открытой** во время защиты

3. **Сделай скриншоты** на всякий случай

4. **Запиши видео** работающего приложения

5. **Подготовь локальную версию** на флешке

---

## 🎉 Итог

Твоё приложение доступно:
- **Frontend:** https://USERNAME.github.io/smart-home-app
- **Backend:** https://USERNAME-smart-home-api.hf.space
- **База данных:** MongoDB Atlas (бесплатно)

**Стоимость:** 0 руб/мес 🎉

**Преимущества:**
- ✅ Полностью бесплатно
- ✅ GitHub работает в РФ
- ✅ Не нужна карта
- ✅ Надёжно для демонстрации

---

## 📞 Помощь

- [Официальная документация GitHub Pages](https://pages.github.com/)
- [Hugging Face Spaces Docs](https://huggingface.co/docs/hub/spaces)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)

---

**Удачи на защите! 🍀**

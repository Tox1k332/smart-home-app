# ⚙️ Настройка GitHub Actions

## 📋 Что делает workflow

При каждом пуше в ветку `main`:

1. **Frontend**:
   - Собирает Vue проект
   - Деплоит на GitHub Pages
   - Обновляет https://tox1k332.github.io/smart-home-app/

2. **Backend**:
   - Render автоматически деплоит при изменении `main`
   - Опционально можно триггерить через API

---

## 🚀 Автоматический деплой

### Frontend (GitHub Pages)

Работает автоматически! После пуша в `main`:
1. Запускается GitHub Actions
2. Собирается frontend (`npm run build`)
3. Деплоится на GitHub Pages
4. Обновляется сайт

**Время:** ~2-3 минуты

### Backend (Render)

Render автоматически деплоит при пуше в `main`!

1. Render подключён к GitHub репозиторию
2. При пуше в `main` Render видит изменения
3. Автоматически запускает деплой

**Время:** ~2-3 минуты

---

## 🔧 Ручной запуск (опционально)

Можно запустить деплой вручную:

1. Зайдите на: https://github.com/Tox1k332/smart-home-app/actions
2. Выберите workflow **"Deploy Full Stack"**
3. Нажмите **"Run workflow"**
4. Выберите ветку (обычно `main`)
5. Нажмите **"Run workflow"**

---

## 📊 Мониторинг деплоя

### GitHub Actions

https://github.com/Tox1k332/smart-home-app/actions

- 🟡 Жёлтый — идёт деплой
- 🟢 Зелёный — успешно
- 🔴 Красный — ошибка

### GitHub Pages

https://github.com/Tox1k332/smart-home-app/deployments/github-pages

### Render

https://dashboard.render.com → ваш сервис → **Logs**

---

## 🔑 Секреты (опционально)

Если хотите триггерить Render через API:

1. Зайдите на: https://dashboard.render.com
2. Ваш сервис → **Settings** → **Web Hooks**
3. Скопируйте URL
4. В GitHub: https://github.com/Tox1k332/smart-home-app/settings/secrets/actions
5. Добавьте секрет:
   - Name: `RENDER_API_KEY`
   - Value: ваш ключ

---

## ✅ Чек-лист после пуша

1. [ ] GitHub Actions зелёный
2. [ ] Frontend обновился (проверить версию)
3. [ ] Render деплой завершён
4. [ ] Backend отвечает (проверить `/api/health`)

---

**Готово!** 🎉

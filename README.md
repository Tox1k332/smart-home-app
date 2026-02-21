# 🏠 Smart Home Application

Веб-приложение для управления устройствами умного дома.

**Дипломный проект** по специальности 09.02.07 "Информационные системы и программирование"

---

## ✨ Возможности

- 🔐 **Аутентификация**: регистрация, вход, OAuth (Google, GitHub)
- 📱 **Устройства**: управление 8 типами устройств
- 🌤️ **Мониторинг**: погода, температура, качество воздуха
- 🎨 **Темы**: светлая и тёмная тема
- 🌐 **i18n**: русский и английский языки
- 📊 **Логи действий**: история операций
- 📱 **Адаптивность**: работает на мобильных

---

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Установка
npm install

# Frontend (терминал 1)
npm run dev

# Backend (терминал 2)
npm run server
```

Открой http://localhost:3000

---

## 🌐 Деплой

### 🆓 Полностью бесплатно (рекомендую)

**GitHub Pages + Hugging Face Spaces** - 0 руб/мес

👉 [QUICK_START_FREE.md](./QUICK_START_FREE.md) - деплой за 30 минут

👉 [DEPLOYMENT_FREE.md](./DEPLOYMENT_FREE.md) - подробная инструкция

**Преимущества:**
- 🆓 Полностью бесплатно
- 🇷🇺 GitHub работает в РФ
- 💳 Не нужна карта

### 🇷🇺 Российский хостинг (~200 руб/мес)

**Timeweb Cloud** - VPS в России

👉 [QUICK_START_TIMEWEB.md](./QUICK_START_TIMEWEB.md) - за 40 минут

👉 [DEPLOYMENT_TIMEWEB.md](./DEPLOYMENT_TIMEWEB.md) - подробно

**Преимущества:**
- 🇷🇺 Не блокируется
- ⚡ Быстро в РФ
- 💰 Оплата рублями

---

## 📁 Структура

```
smart-home-app/
├── src/                    # Frontend (Vue 3)
│   ├── views/              # Страницы
│   ├── components/         # Компоненты
│   ├── stores/             # Pinia
│   └── router/             # Роутинг
├── server/                 # Backend (Express)
│   ├── routes/             # API
│   └── middleware/         # Auth
├── .env                    # Переменные
├── package.json
└── README.md
```

---

## 🛠️ Технологии

**Frontend:**
- Vue 3 (Composition API)
- Pinia
- Vue Router
- Axios
- Vite

**Backend:**
- Node.js
- Express
- JWT
- MongoDB

---

## 📡 API

```
POST   /api/auth/register       Регистрация
POST   /api/auth/login          Вход
GET    /api/auth/me             Пользователь
GET    /api/devices             Устройства
POST   /api/devices             Создать устройство
GET    /api/weather             Погода
```

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| [НАЧНИТЕ_ЗДЕСЬ.md](./НАЧНИТЕ_ЗДЕСЬ.md) | 🎯 Старт здесь |
| [QUICK_START_FREE.md](./QUICK_START_FREE.md) | ⚡ Бесплатный деплой за 30 мин |
| [DEPLOYMENT_FREE.md](./DEPLOYMENT_FREE.md) | 📖 Подробный бесплатный деплой |
| [QUICK_START_TIMEWEB.md](./QUICK_START_TIMEWEB.md) | 🇷🇺 Российский хостинг за 40 мин |
| [TECHNICAL_SPECIFICATION.md](./TECHNICAL_SPECIFICATION.md) | 📋 ТЗ |
| [ЭКОНОМИЧЕСКАЯ_ЧАСТЬ.md](./ЭКОНОМИЧЕСКАЯ_ЧАСТЬ.md) | 💰 Расчёты |

---

## 👨‍💻 Автор

Студент группы XXX-XXX  
Специальность: 09.02.07 "Информационные системы и программирование"  
Период: 26 января — 23 февраля 2026 г.

---

## 📄 Лицензия

MIT

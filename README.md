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

### 🎯 Render.com (рекомендую)

**Backend на Render** + **Frontend на GitHub Pages** - 0 руб/мес

👉 [DEPLOY_RENDER.md](./DEPLOY_RENDER.md) - инструкция по деплою

**Преимущества:**
- 🆓 Бесплатно (750 часов/мес)
- ✅ Переменные окружения работают из коробки
- ⚡ Автоматический деплой из Git
- 🔒 Безопасное хранение секретов

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| [DEPLOY_RENDER.md](./DEPLOY_RENDER.md) | Деплой на Render.com |
| [НАЧНИТЕ_ЗДЕСЬ.md](./НАЧНИТЕ_ЗДЕСЬ.md) | Общая информация о проекте |
| [TECHNICAL_SPECIFICATION.md](./TECHNICAL_SPECIFICATION.md) | Техническое задание по ГОСТ |
| [ЭКОНОМИЧЕСКАЯ_ЧАСТЬ.md](./ЭКОНОМИЧЕСКАЯ_ЧАСТЬ.md) | Расчёт затрат и эффективность |

---

## 🛠️ Технологии

### Frontend
- Vue 3 (Composition API)
- Pinia (state management)
- Vue Router
- Axios
- Vite

### Backend
- Node.js
- Express
- MongoDB (документоориентированная СУБД)
- JWT (аутентификация)
- bcryptjs (хеширование паролей)
- Nodemailer

### DevOps
- Docker
- Render.com (хостинг backend)
- GitHub Pages (хостинг frontend)
- MongoDB Atlas (облачная база данных)

---

## 📊 Структура проекта

```
smart-home-app/
├── src/                    # Frontend (Vue 3)
│   ├── components/         # Vue компоненты
│   ├── views/              # Страницы
│   ├── stores/             # Pinia store'ы
│   ├── services/           # API сервисы
│   └── router/             # Маршрутизация
├── server/                 # Backend (Express)
│   ├── config/             # Конфигурация (DB, etc.)
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── services/           # Email, etc.
│   └── database/           # MongoDB адаптеры
├── package.json            # Зависимости
├── Dockerfile              # Docker образ
└── render.yaml             # Render конфигурация
```

---

## 🗄️ Хранение данных (MongoDB + bcryptjs)

В качестве системы управления базами данных проект использует **MongoDB** — документоориентированную NoSQL СУБД. Это обеспечивает масштабируемость, надёжность и возможность развёртывания в облаке через MongoDB Atlas.

### Структура данных

Проект использует следующие коллекции:

| Коллекция | Описание |
|-----------|----------|
| `users` | Пользователи: email, имя, дата регистрации, пароль, OAuth-данные, аватар |
| `devices` | Устройства умного дома: датчики, лампы, розетки, термостаты, замки |
| `activityLogs` | Журнал действий пользователей: история операций с устройствами |

### Коллекция `users`

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,              // уникальный индекс
  password: String,           // хэш bcrypt
  email_verified: Boolean,
  oauth_provider: String,     // "google", "github"
  oauth_id: String,
  avatar: String,
  created_at: ISODate
}
```

### Коллекция `devices`

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // индекс по user_id
  name: String,
  type: String,               // "light", "thermostat", "sensor", "lock", etc.
  room: String,
  properties: Object,         // специфичные для типа устройства
  is_on: Boolean,
  is_favorite: Boolean,
  created_at: ISODate
}
```

### Коллекция `activityLogs`

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  action: String,             // "device_on", "device_add", etc.
  details: Object,
  created_at: ISODate         // индекс по убыванию
}
```

### 🔐 Обеспечение безопасности

Для защиты учётных записей пользователей используется библиотека **bcryptjs**:

- ✅ Пароли хранятся только в виде хэша
- ✅ При аутентификации сравнивается хэш, а не исходный пароль
- ✅ Даже при утечке базы данных злоумышленники не получат исходные пароли

### 🌐 MongoDB Atlas (облачное развёртывание)

Проект поддерживает подключение к облачной базе данных **MongoDB Atlas**:

- 🆓 Бесплатный тариф: 512 MB
- ☁️ Доступ из любой точки мира
- 🔒 Встроенная аутентификация и шифрование
- 📊 Автоматическое резервное копирование

Подключение настраивается через переменную окружения:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-home
```

### 📌 Индексы

Для оптимизации запросов созданы следующие индексы:

| Коллекция | Поле | Тип |
|-----------|------|-----|
| `users` | `email` | уникальный |
| `devices` | `user_id` | обычный |
| `activityLogs` | `user_id`, `created_at` | составной |

---

## 🔐 Переменные окружения

### Backend (.env)

```env
PORT=7860
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-home
JWT_SECRET=your-secret-key
BACKEND_URL=https://your-api.onrender.com
FRONTEND_URL=https://your-username.github.io/smart-home-app
OPENWEATHER_API_KEY=your-api-key
```

### Frontend (Vite)

```env
VITE_API_BASE_URL=https://your-api.onrender.com/api
```

---

## 📅 Информация о проекте

- **Период разработки:** 26 января — 23 февраля 2026 г.
- **Специальность:** 09.02.07 "Информационные системы и программирование"
- **Автор:** Студент группы XXX-XXX

---



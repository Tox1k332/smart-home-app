FROM node:18-alpine

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем весь сервер
COPY server/ ./server/

# Копируем frontend (если есть после сборки)
COPY dist/ ./dist/ 2>/dev/null || true

EXPOSE 7860

# Переменные окружения по умолчанию
ENV PORT=7860
ENV NODE_ENV=production

# Хостинг передаёт переменные через docker run -e
# Убедитесь что MONGODB_URI передан при запуске контейнера

CMD ["node", "server/index.js"]
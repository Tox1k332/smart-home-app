FROM node:18-alpine

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем сервер
COPY server/ ./server/

# Открываем порт
EXPOSE 7860

# Переменные окружения
ENV PORT=7860
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
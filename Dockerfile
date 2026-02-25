FROM node:18-alpine

WORKDIR /app

# Объявляем переменные которые будут переданы из HF Spaces
ARG MONGODB_URI
ARG JWT_SECRET
ARG BACKEND_URL
ARG FRONTEND_URL
ARG OPENWEATHER_API_KEY
ARG PORT
ARG NODE_ENV

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем сервер
COPY server/ ./server/

# Открываем порт
EXPOSE 7860

# Переменные окружения по умолчанию (если не переданы)
ENV PORT=${PORT:-7860}
ENV NODE_ENV=${NODE_ENV:-production}
ENV MONGODB_URI=${MONGODB_URI:-}
ENV JWT_SECRET=${JWT_SECRET:-}
ENV BACKEND_URL=${BACKEND_URL:-http://localhost:7860}
ENV FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
ENV OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY:-}

CMD ["node", "server/index.js"]
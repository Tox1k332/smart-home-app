FROM node:18-alpine

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем сервер
COPY server/ ./server/

# Копируем скрипт запуска и делаем исполняемым
COPY server/start.sh /start.sh
RUN chmod +x /start.sh

# Открываем порт
EXPOSE 7860

# Переменные окружения (значения по умолчанию)
ENV PORT=7860
ENV NODE_ENV=production

# Запускаем через скрипт проверки
CMD ["/start.sh"]
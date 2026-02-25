FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server/ ./server/

EXPOSE 7860

ENV PORT=7860
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
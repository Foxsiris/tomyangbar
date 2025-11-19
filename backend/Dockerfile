# Dockerfile для бэкенда
FROM node:20-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем директорию для uploads если её нет
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["node", "src/server.js"]


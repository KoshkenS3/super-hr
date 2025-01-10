#!/bin/bash

# Название файла конфигурации PM2
CONFIG_FILE="ecosystem.config.js"

# Название приложения (из config.js)
APP_NAME="hr-bot"

# Папка с проектом
PROJECT_DIR="/root/super-hr"

# Переходим в директорию проекта
cd "$PROJECT_DIR" || {
  echo "Не удалось перейти в директорию $PROJECT_DIR"
  exit 1
}

# Обновляем код из Git
echo "Обновляем код из Git..."
git pull origin main || {
  echo "Ошибка при выполнении git pull"
  exit 1
}

# Устанавливаем зависимости
echo "Устанавливаем зависимости..."
npm install || {
  echo "Ошибка при установке зависимостей"
  exit 1
}

# Выполняем сборку приложения
echo "Выполняем сборку приложения..."
npm run build || {
  echo "Ошибка при сборке"
  exit 1
}

# Перезапускаем приложение с использованием ecosystem.config.js
echo "Перезапускаем приложение через PM2..."
pm2 startOrRestart "$CONFIG_FILE" --name "$APP_NAME" || {
  echo "Ошибка при запуске приложения через PM2"
  exit 1
}

# Проверяем состояние приложения
echo "Текущее состояние PM2:"
pm2 list

echo "Деплой завершен успешно!"

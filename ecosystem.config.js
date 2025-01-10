module.exports = {
  // Конфигурация процессов PM2
  apps: [
    {
      name: 'hr-bot', // Имя приложения в PM2
      script: './dist/main.js', // Путь к запускаемому файлу
      watch: true, // Автоматический перезапуск при изменении файлов
      autorestart: true, // Автоматический перезапуск при падении
      max_restarts: 10, // Максимальное количество попыток перезапуска
      exec_mode: 'fork', // Режим запуска (один процесс)
      instances: 1, // Количество экземпляров приложения
      env: {
        // Переменные окружения
        NODE_ENV: 'production', // Режим работы
        TZ: 'Europe/Moscow', // Временная зона
      },
    },
  ],
}

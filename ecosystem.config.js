module.exports = {
  apps: [
    {
      name: 'hr-bot',
      script: './dist/main.js',
      watch: true,
      autorestart: true,
      max_restarts: 10,
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        TZ: 'Europe/Moscow',
      },
    },
  ],
}

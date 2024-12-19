import { Scenes, Telegraf, session } from 'telegraf'
import * as dotenv from 'dotenv'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { DataSource } from 'typeorm'
import * as cron from 'node-cron'
import { EmployeeService } from './services/employee.service'
import { NotificationService } from './services/notification.service'
import { addEmployeeScene } from './scenes/addEmployee'
import { mainKeyboard } from './keyboards/main'
import { showEmployeesScene } from './scenes/showEmployees'
import { BotContext, WizardContext } from './types/context'
import { Employee } from './entities/Employee.entity'

// Загрузка переменных окружения
dotenv.config()

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN не указан в переменных окружения')
}

// Инициализация бота с типом контекста
const bot = new Telegraf<WizardContext>(process.env.BOT_TOKEN)

// Подключение к базе данных
const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'employees.sqlite',
  entities: [Employee],
  synchronize: true,
  logging: false,
})

const init = async () => {
  try {
    // Инициализация базы данных
    await AppDataSource.initialize()
    console.log('База данных успешно инициализирована')

    const employeeService = new EmployeeService(AppDataSource)
    const notificationService = new NotificationService(bot, employeeService)

    // Используем только WizardContext
    const stage = new Scenes.Stage<WizardContext>([addEmployeeScene, showEmployeesScene])

    bot.use(
      session({
        defaultSession: () => ({
          __scenes: {},
          employeeData: {},
        }),
      }),
    )
    bot.use((ctx, next) => {
      ctx.employeeService = employeeService
      return next()
    })
    bot.use(stage.middleware())

    // Команды
    bot.command('start', async (ctx) => {
      await ctx.reply('🌸 Добро пожаловать! Выберите действие:', mainKeyboard)
    })

    bot.command('add_employee', (ctx) => ctx.scene.enter('addEmployee'))
    bot.command('show_employees', (ctx) => ctx.scene.enter('showEmployees'))

    // Обработка текстовых команд с клавиатуры
    bot.hears('👤 Добавить сотрудника', (ctx) => ctx.scene.enter('addEmployee'))
    bot.hears('📋 Показать сотрудников', (ctx) => ctx.scene.enter('showEmployees'))

    // Планировщик уведомлений
    cron.schedule(
      '* 9 * * *', // В 15:28 каждый день
      async () => {
        console.log('Запуск проверки уведомлений:', new Date().toLocaleString('ru-RU'))
        await notificationService.checkAndSendNotifications()
      },
      {
        timezone: 'Europe/Moscow',
      },
    )

    // Запуск бота
    await bot.launch()
    console.log('Бот успешно запущен')
  } catch (error) {
    console.error('Ошибка при инициализации:', error)
    process.exit(1)
  }
}

init()

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

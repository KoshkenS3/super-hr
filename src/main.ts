// Импортируем необходимые библиотеки
import { Scenes, Telegraf, session } from 'telegraf' // Telegraf - основная библиотека для создания Telegram ботов
import * as dotenv from 'dotenv' // Библиотека для работы с переменными окружения
import { format } from 'date-fns' // Библиотека для работы с датами
import { ru } from 'date-fns/locale' // Русская локализация для дат
import { DataSource } from 'typeorm' // Библиотека для работы с базой данных
import * as cron from 'node-cron' // Библиотека для создания расписаний задач
import { ReplyKeyboardMarkup } from 'telegraf/types'

// Импортируем наши сервисы и компоненты
import { EmployeeService } from './services/employee.service'
import { NotificationService } from './services/notification.service'
import { addEmployeeScene } from './scenes/addEmployee'
import { mainKeyboard } from './keyboards/main'
import { showEmployeesScene } from './scenes/showEmployees'
import { updateEmployeeDaysScene } from './scenes/updateEmployeeDays'
import { MyContext } from './types/context'
import { Employee } from './entities/Employee.entity'

// Загружаем переменные окружения из файла .env
dotenv.config()

// Проверяем наличие токена бота
if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN не указан в переменных окружения')
}

// Создаем экземпляр бота с указанным токеном
const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN)

// Настраиваем подключение к базе данных SQLite
const AppDataSource = new DataSource({
  type: 'sqlite', // Тип базы данных
  database: 'employees.sqlite', // Имя файла базы данных
  entities: [Employee], // Список сущностей (таблиц)
  synchronize: true, // Автоматическая синхронизация схемы базы данных
  logging: false, // Отключаем логирование SQL запросов
})

// Функция инициализации бота
const init = async () => {
  try {
    // Подключаемся к базе данных
    await AppDataSource.initialize()
    console.log('База данных успешно инициализирована')

    // Создаем экземпляры сервисов
    const employeeService = new EmployeeService(AppDataSource)
    const notificationService = new NotificationService(bot, employeeService)

    // Создаем сцены для диалогов с пользователем
    const stage = new Scenes.Stage<MyContext>([addEmployeeScene, showEmployeesScene, updateEmployeeDaysScene])

    // Настраиваем middleware для бота
    bot.use(
      session({
        defaultSession: () => ({
          __scenes: {
            cursor: 0,
            step: 0,
          },
          employeeData: {},
        }),
      }),
    )

    // Добавляем сервис работы с сотрудниками в контекст бота
    bot.use((ctx, next) => {
      ctx.employeeService = employeeService
      return next()
    })

    // Подключаем обработчик сцен
    bot.use(stage.middleware())

    // Глобальная команда отмены
    bot.command('cancel', async (ctx) => {
      await ctx.scene.leave()
      await ctx.reply('Операция отменена', { reply_markup: mainKeyboard.reply_markup })
    })

    // Регистрируем команду /start
    bot.command('start', async (ctx) => {
      await ctx.reply('🌸 Добро пожаловать! Выберите действие:', {
        reply_markup: mainKeyboard.reply_markup,
      })
    })

    // Регистрируем остальные команды
    bot.command('add_employee', (ctx) => ctx.scene.enter('addEmployee'))
    bot.command('show_employees', (ctx) => ctx.scene.enter('showEmployees'))

    // Обрабатываем нажатия на кнопки клавиатуры
    bot.hears('👤 Добавить сотрудника', (ctx) => ctx.scene.enter('addEmployee'))
    bot.hears('📋 Показать сотрудников', (ctx) => ctx.scene.enter('showEmployees'))
    bot.hears('⏰ Изменить сроки', (ctx) => ctx.scene.enter('updateEmployeeDays'))

    // Настраиваем ежедневные уведомления в 09:00 по московскому времени
    cron.schedule(
      '0 9 * * *', // Крон-выражение: минуты(0) часы(9) дни(*) месяцы(*) дни_недели(*)
      async () => {
        console.log('Запуск проверки уведомлений:', new Date().toLocaleString('ru-RU'))
        await notificationService.checkAndSendNotifications()
      },
      {
        timezone: 'Europe/Moscow',
      },
    )

    // Запускаем бота
    await bot.launch()
    console.log('Бот успешно запущен')
  } catch (error) {
    console.error('Ошибка при инициализации:', error)
    process.exit(1) // Завершаем процесс с ошибкой
  }
}

// Запускаем инициализацию
init()

// Корректное завершение работы бота при остановке процесса
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

import { Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { isValidDate, isValidNumber } from '../utils/validators'
import { confirmKeyboard } from '../keyboards/main'
import { WizardContext } from '../types/context'

// Создаем сцену с пошаговым диалогом для добавления сотрудника
export const addEmployeeScene = new Scenes.WizardScene<WizardContext>(
  'addEmployee', // Уникальный идентификатор сцены

  // Шаг 1: Запрос ФИО сотрудника
  async (ctx) => {
    await ctx.reply('Введите ФИО сотрудника:')
    ctx.session.employeeData = {} // Создаем пустой объект для хранения данных
    return ctx.wizard.next() // Переходим к следующему шагу
  },

  // Шаг 2: Запрос даты начала работы
  async (ctx) => {
    // Проверяем, что получили текстовое сообщение
    if (!ctx.message || !('text' in ctx.message)) return

    // Сохраняем ФИО в сессии
    ctx.session.employeeData.fullName = ctx.message.text
    await ctx.reply('Введите дату начала работы (формат: DD.MM.YYYY):')
    return ctx.wizard.next()
  },

  // Шаг 3: Запрос количества дней адаптации
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return

    const date = ctx.message.text
    // Проверяем корректность введенной даты
    if (!isValidDate(date)) {
      await ctx.reply('Неверный формат даты. Попробуйте еще раз (DD.MM.YYYY):')
      return // Остаемся на текущем шаге если дата некорректна
    }

    // Сохраняем дату начала работы
    ctx.session.employeeData.startDate = date
    await ctx.reply('Введите количество дней адаптации (число):')
    return ctx.wizard.next()
  },

  // Шаг 4: Запрос количества дней испытательного срока
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return

    const days = ctx.message.text
    // Проверяем, что введено корректное число
    if (!isValidNumber(days)) {
      await ctx.reply('Пожалуйста, введите положительное число:')
      return
    }

    // Сохраняем количество дней адаптации
    ctx.session.employeeData.adaptationDays = parseInt(days)
    await ctx.reply('Введите количество дней испытательного срока (число):')
    return ctx.wizard.next()
  },

  // Шаг 5: Показ собранных данных и запрос подтверждения
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return

    const days = ctx.message.text
    if (!isValidNumber(days)) {
      await ctx.reply('Пожалуйста, введите положительное число:')
      return
    }

    // Сохраняем количество дней испытательного срока
    ctx.session.employeeData.probationDays = parseInt(days)
    const data = ctx.session.employeeData

    // Формируем сообщение для проверки данных
    const message = `
Проверьте данные:
👤 ФИО: ${data.fullName}
📅 Дата начала: ${data.startDate}
⏳ Дней адаптации: ${data.adaptationDays}
🎯 Дней испытательного срока: ${data.probationDays}
`
    // Отправляем сообщение с кнопками подтверждения/отмены
    await ctx.reply(message, confirmKeyboard)
    return ctx.wizard.next()
  },

  // Шаг 6: Обработка подтверждения и сохранение данных
  async (ctx) => {
    // Проверяем, что получили callback query (нажатие на кнопку)
    if (!('callback_query' in ctx.update)) return

    const action = (ctx.update.callback_query as any).data || ''
    if (action === 'confirm' && ctx.session.employeeData) {
      // Добавляем ID пользователя к данным сотрудника
      const data = {
        ...ctx.session.employeeData,
        userId: ctx.from?.id.toString() || '',
      }

      try {
        // Сохраняем данные в базу
        await ctx.employeeService.createEmployee(data)
        await ctx.reply('✅ Сотрудник успешно добавлен!')
      } catch (error) {
        console.error('Ошибка при сохранении сотрудника:', error)
        await ctx.reply('❌ Произошла ошибка при сохранении. Попробуйте еще раз.')
      }
    } else {
      await ctx.reply('❌ Добавление сотрудника отменено')
    }

    // Выходим из сцены
    return await ctx.scene.leave()
  },
)

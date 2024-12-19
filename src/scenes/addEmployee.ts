import { Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { isValidDate, isValidNumber } from '../utils/validators'
import { confirmKeyboard } from '../keyboards/main'
import { WizardContext } from '../types/context'

export const addEmployeeScene = new Scenes.WizardScene<WizardContext>(
  'addEmployee',
  // Шаг 1: Запрос ФИО
  async (ctx) => {
    await ctx.reply('Введите ФИО сотрудника:')
    ctx.session.employeeData = {}
    return ctx.wizard.next()
  },
  // Шаг 2: Запрос даты начала работы
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return

    ctx.session.employeeData.fullName = ctx.message.text
    await ctx.reply('Введите дату начала работы (формат: DD.MM.YYYY):')
    return ctx.wizard.next()
  },
  // Шаг 3: Запрос дней адаптации
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return

    const date = ctx.message.text
    if (!isValidDate(date)) {
      await ctx.reply('Неверный формат даты. Попробуйте еще раз (DD.MM.YYYY):')
      return
    }

    ctx.session.employeeData.startDate = date
    await ctx.reply('Введите количество дней адаптации (число):')
    return ctx.wizard.next()
  },
  // Шаг 4: Запрос дней испытательного срока
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return

    const days = ctx.message.text
    if (!isValidNumber(days)) {
      await ctx.reply('Пожалуйста, введите положительное число:')
      return
    }

    ctx.session.employeeData.adaptationDays = parseInt(days)
    await ctx.reply('Введите количество дней испытательного срока (число):')
    return ctx.wizard.next()
  },
  // Шаг 5: Подтверждение
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return

    const days = ctx.message.text
    if (!isValidNumber(days)) {
      await ctx.reply('Пожалуйста, введите положительное число:')
      return
    }

    ctx.session.employeeData.probationDays = parseInt(days)
    const data = ctx.session.employeeData

    const message = `
Проверьте данные:
👤 ФИО: ${data.fullName}
📅 Дата начала: ${data.startDate}
⏳ Дней адаптации: ${data.adaptationDays}
🎯 Дней испытательного срока: ${data.probationDays}
`
    await ctx.reply(message, confirmKeyboard)
    return ctx.wizard.next()
  },
  // Шаг 6: Сохранение
  async (ctx) => {
    if (!('callback_query' in ctx.update)) return

    const action = (ctx.update.callback_query as any).data || ''
    if (action === 'confirm' && ctx.session.employeeData) {
      const data = {
        ...ctx.session.employeeData,
        userId: ctx.from?.id.toString() || '',
      }

      try {
        await ctx.employeeService.createEmployee(data)
        await ctx.reply('✅ Сотрудник успешно добавлен!')
      } catch (error) {
        console.error('Ошибка при сохранении сотрудника:', error)
        await ctx.reply('❌ Произошла ошибка при сохранении. Попробуйте еще раз.')
      }
    } else {
      await ctx.reply('❌ Добавление сотрудника отменено')
    }

    return await ctx.scene.leave()
  },
)

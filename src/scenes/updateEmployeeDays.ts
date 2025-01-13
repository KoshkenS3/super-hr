import { Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import { MyContext } from '../types/context'
import { mainKeyboard } from '../keyboards/main'
import { ReplyKeyboardMarkup } from 'telegraf/types'

export const updateEmployeeDaysScene = new Scenes.BaseScene<MyContext>('updateEmployeeDays')

// Начало сцены
updateEmployeeDaysScene.enter(async (ctx) => {
  await ctx.reply(
    'Для изменения сроков, отправьте сообщение в формате:\n' +
      '<ID сотрудника> <новые дни адаптации> <новые дни испытательного срока>\n' +
      'Например: 1 14 90\n\n' +
      'Чтобы оставить текущее значение, поставьте прочерк (-)\n' +
      'Например: 1 - 90',
    { reply_markup: { remove_keyboard: true } },
  )
})

// Обработка команды отмены
updateEmployeeDaysScene.command('cancel', async (ctx) => {
  await ctx.reply('Операция отменена', { reply_markup: mainKeyboard.reply_markup })
  await ctx.scene.leave()
})

// Обработка ввода пользователя
updateEmployeeDaysScene.on(message('text'), async (ctx) => {
  // Проверяем, не является ли сообщение командой
  if (ctx.message.text.startsWith('/')) {
    return
  }

  const input = ctx.message.text.trim().split(' ')

  if (input.length !== 3) {
    await ctx.reply('Неверный формат. Попробуйте еще раз или нажмите /cancel для отмены.')
    return
  }

  const employeeId = parseInt(input[0])
  if (isNaN(employeeId)) {
    await ctx.reply('ID сотрудника должен быть числом. Попробуйте еще раз.')
    return
  }

  const adaptationDays = input[1] === '-' ? undefined : parseInt(input[1])
  const probationDays = input[2] === '-' ? undefined : parseInt(input[2])

  if ((adaptationDays !== undefined && isNaN(adaptationDays)) || (probationDays !== undefined && isNaN(probationDays))) {
    await ctx.reply('Количество дней должно быть числом. Попробуйте еще раз.')
    return
  }

  if ((adaptationDays !== undefined && adaptationDays < 0) || (probationDays !== undefined && probationDays < 0)) {
    await ctx.reply('Количество дней не может быть отрицательным. Попробуйте еще раз.')
    return
  }

  try {
    const updatedEmployee = await ctx.employeeService.updateEmployeeDays(employeeId, adaptationDays, probationDays)

    if (!updatedEmployee) {
      await ctx.reply('Сотрудник с указанным ID не найден.')
      return
    }

    await ctx.reply(
      `Сроки успешно обновлены для сотрудника ${updatedEmployee.fullName}:\n` +
        `Дни адаптации: ${updatedEmployee.adaptationDays}\n` +
        `Дни испытательного срока: ${updatedEmployee.probationDays}`,
      { reply_markup: mainKeyboard.reply_markup },
    )
    await ctx.scene.leave()
  } catch (error) {
    console.error('Ошибка при обновлении сроков:', error)
    await ctx.reply('Произошла ошибка при обновлении сроков. Попробуйте позже.')
  }
})

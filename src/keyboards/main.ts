import { Markup } from 'telegraf'

export const mainKeyboard = Markup.keyboard([['👤 Добавить сотрудника', '📋 Показать сотрудников']]).resize()

export const confirmKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('✅ Подтвердить', 'confirm'), Markup.button.callback('❌ Отменить', 'cancel')],
])

export const employeeListKeyboard = (currentPage: number, totalPages: number) => {
  const buttons = []

  if (currentPage > 0) {
    buttons.push(Markup.button.callback('⬅️ Назад', `page_${currentPage - 1}`))
  }

  if (currentPage < totalPages - 1) {
    buttons.push(Markup.button.callback('➡️ Вперед', `page_${currentPage + 1}`))
  }

  return Markup.inlineKeyboard(buttons)
}

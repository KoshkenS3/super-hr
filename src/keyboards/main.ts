import { Markup } from 'telegraf'

// Основная клавиатура с двумя кнопками
export const mainKeyboard = Markup.keyboard([['👤 Добавить сотрудника', '📋 Показать сотрудников']]).resize() // resize() делает кнопки компактнее

// Клавиатура для подтверждения действий
export const confirmKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('✅ Подтвердить', 'confirm'), Markup.button.callback('❌ Отменить', 'cancel')],
])

// Клавиатура для навигации по списку сотрудников
export const employeeListKeyboard = (currentPage: number, totalPages: number) => {
  const buttons = []

  // Добавляем кнопку "Назад" если не на первой странице
  if (currentPage > 0) {
    buttons.push(Markup.button.callback('⬅️ Назад', `page_${currentPage - 1}`))
  }

  // Добавляем кнопку "Вперед" если не на последней странице
  if (currentPage < totalPages - 1) {
    buttons.push(Markup.button.callback('➡️ Вперед', `page_${currentPage + 1}`))
  }

  return Markup.inlineKeyboard(buttons)
}

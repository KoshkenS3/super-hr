import { Scenes } from 'telegraf'
import { employeeListKeyboard } from '../keyboards/main'
import { format, addDays, parse } from 'date-fns'
import { ru } from 'date-fns/locale'
import { WizardContext } from '../types/context'
import { Employee } from 'src/entities/Employee.entity'

// Создаем базовую сцену для отображения списка сотрудников
export const showEmployeesScene = new Scenes.BaseScene<WizardContext>('showEmployees')

// Обработчик входа в сцену - показывает первую страницу списка
showEmployeesScene.enter(async (ctx) => {
  const userId = ctx.from?.id.toString()
  if (!userId) return

  try {
    // Получаем список сотрудников для текущего пользователя
    const [employees, total] = await ctx.employeeService.getEmployeesByUserId(userId)
    if (employees.length === 0) {
      await ctx.reply('У вас пока нет добавленных сотрудников')
      return await ctx.scene.leave()
    }

    // Вычисляем общее количество страниц (по 5 сотрудников на странице)
    const totalPages = Math.ceil(total / 5)
    const message = formatEmployeesList(employees)

    // Отправляем сообщение со списком и кнопками навигации
    await ctx.reply(message, employeeListKeyboard(0, totalPages))
  } catch (error) {
    console.error('Ошибка при получении списка сотрудников:', error)
    await ctx.reply('Произошла ошибка при получении списка сотрудников')
    return await ctx.scene.leave()
  }
})

// Обработчик нажатий на кнопки навигации по страницам
showEmployeesScene.action(/^page_(\d+)$/, async (ctx) => {
  const match = ctx.match[1]
  const page = parseInt(match)
  const userId = ctx.from?.id.toString()
  if (!userId) return

  try {
    // Получаем список сотрудников для выбранной страницы
    const [employees, total] = await ctx.employeeService.getEmployeesByUserId(userId, page * 5)
    const totalPages = Math.ceil(total / 5)
    const message = formatEmployeesList(employees)

    // Обновляем существующее сообщение новым списком
    await ctx.editMessageText(message, employeeListKeyboard(page, totalPages))
  } catch (error) {
    console.error('Ошибка при получении списка сотрудников:', error)
  }
})

// Функция форматирования списка сотрудников
function formatEmployeesList(employees: Employee[]): string {
  let message = '📋 Список сотрудников:\n\n'

  employees.forEach((employee) => {
    const startDateObj = parse(employee.startDate, 'dd.MM.yyyy', new Date())
    const adaptationEndDate = addDays(startDateObj, employee.adaptationDays)
    const probationEndDate = addDays(startDateObj, employee.probationDays)

    message += `👤 ${employee.fullName} (ID: ${employee.id})\n`
    message += `📅 Дата начала: ${employee.startDate}\n`
    message += `⏳ Дни адаптации: ${employee.adaptationDays} (до ${format(adaptationEndDate, 'dd.MM.yyyy', { locale: ru })})\n`
    message += `🎯 Испытательный срок: ${employee.probationDays} (до ${format(probationEndDate, 'dd.MM.yyyy', {
      locale: ru,
    })})\n\n`
  })

  return message
}

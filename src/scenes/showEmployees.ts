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

// Функция форматирования списка сотрудников в текстовое сообщение
function formatEmployeesList(employees: Employee[]): string {
  return employees
    .map((emp, index) => {
      try {
        // Преобразуем строковую дату начала работы в объект Date
        const startDateObj = parse(emp.startDate, 'dd.MM.yyyy', new Date())

        // Форматируем все даты в русском формате
        const startDate = format(startDateObj, 'd MMMM yyyy', { locale: ru })
        const adaptationEndDate = format(addDays(startDateObj, emp.adaptationDays), 'd MMMM yyyy', { locale: ru })
        const probationEndDate = format(addDays(startDateObj, emp.probationDays), 'd MMMM yyyy', { locale: ru })

        // Формируем карточку сотрудника с информацией
        return `
👤 

ФИО: ${emp.fullName}
Дата начала: ${startDate}
Конец адаптации: ${adaptationEndDate}
Конец испытательного срока: ${probationEndDate}
───────────────`
      } catch (error) {
        // В случае ошибки форматирования дат выводим базовую информацию
        console.error(`Ошибка форматирования данных сотрудника ${emp.fullName}:`, error)
        return `
👤 Сотрудник ${index + 1}:
ФИО: ${emp.fullName}
Ошибка отображения дат
───────────────`
      }
    })
    .join('\n') // Объединяем все карточки в одно сообщение
}

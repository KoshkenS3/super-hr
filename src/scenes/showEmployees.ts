import { Scenes } from 'telegraf'
import { employeeListKeyboard } from '../keyboards/main'
import { format, addDays, parse } from 'date-fns'
import { ru } from 'date-fns/locale'
import { WizardContext } from '../types/context'
import { Employee } from 'src/entities/Employee.entity'

export const showEmployeesScene = new Scenes.BaseScene<WizardContext>('showEmployees')

showEmployeesScene.enter(async (ctx) => {
  const userId = ctx.from?.id.toString()
  if (!userId) return

  try {
    const [employees, total] = await ctx.employeeService.getEmployeesByUserId(userId)
    if (employees.length === 0) {
      await ctx.reply('У вас пока нет добавленных сотрудников')
      return await ctx.scene.leave()
    }

    const totalPages = Math.ceil(total / 5)
    const message = formatEmployeesList(employees)

    await ctx.reply(message, employeeListKeyboard(0, totalPages))
  } catch (error) {
    console.error('Ошибка при получении списка сотрудников:', error)
    await ctx.reply('Произошла ошибка при получении списка сотрудников')
    return await ctx.scene.leave()
  }
})

showEmployeesScene.action(/^page_(\d+)$/, async (ctx) => {
  const match = ctx.match[1]
  const page = parseInt(match)
  const userId = ctx.from?.id.toString()
  if (!userId) return

  try {
    const [employees, total] = await ctx.employeeService.getEmployeesByUserId(userId, page * 5)
    const totalPages = Math.ceil(total / 5)
    const message = formatEmployeesList(employees)

    await ctx.editMessageText(message, employeeListKeyboard(page, totalPages))
  } catch (error) {
    console.error('Ошибка при получении списка сотрудников:', error)
  }
})

function formatEmployeesList(employees: Employee[]): string {
  return employees
    .map((emp, index) => {
      try {
        const startDateObj = parse(emp.startDate, 'dd.MM.yyyy', new Date())
        
        const startDate = format(startDateObj, 'd MMMM yyyy', { locale: ru })
        const adaptationEndDate = format(addDays(startDateObj, emp.adaptationDays), 'd MMMM yyyy', { locale: ru })
        const probationEndDate = format(addDays(startDateObj, emp.probationDays), 'd MMMM yyyy', { locale: ru })

        return `
👤 

ФИО: ${emp.fullName}
Дата начала: ${startDate}
Конец адаптации: ${adaptationEndDate}
Конец испытательного срока: ${probationEndDate}
───────────────`
      } catch (error) {
        console.error(`Ошибка форматирования данных сотрудника ${emp.fullName}:`, error)
        return `
👤 Сотрудник ${index + 1}:
ФИО: ${emp.fullName}
Ошибка отображения дат
───────────────`
      }
    })
    .join('\n')
}

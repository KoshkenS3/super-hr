import { Context, Telegraf } from 'telegraf'
import { Employee } from '../entities/Employee.entity'
import { EmployeeService } from './employee.service'
import { WizardContext } from 'src/types/context'
import { parse, addDays, isSameDay } from 'date-fns'

export class NotificationService {
  constructor(
    private bot: Telegraf<WizardContext>,
    private employeeService: EmployeeService,
  ) {}

  async checkAndSendNotifications(): Promise<void> {
    try {
      const employees = await this.employeeService.getEmployeesWithDeadlines()
      const today = new Date()

      for (const employee of employees) {
        const startDateObj = parse(employee.startDate, 'dd.MM.yyyy', new Date())
        const adaptationEndDate = addDays(startDateObj, employee.adaptationDays)
        const probationEndDate = addDays(startDateObj, employee.probationDays)

        if (isSameDay(today, adaptationEndDate)) {
          await this.sendNotification(employee, 'адаптация')
          console.log(`Отправлено уведомление об окончании адаптации для ${employee.fullName}`)
        }

        if (isSameDay(today, probationEndDate)) {
          await this.sendNotification(employee, 'испытательный срок')
          console.log(`Отправлено уведомление об окончании испытательного срока для ${employee.fullName}`)
        }
      }
    } catch (error) {
      console.error('Ошибка при отправке уведомлений:', error)
    }
  }

  private async sendNotification(employee: Employee, period: string): Promise<void> {
    const message = `❗️ Внимание! Сегодня у сотрудника ${employee.fullName} заканчивается ${period}.`
    try {
      await this.bot.telegram.sendMessage(employee.userId, message)
      console.log(`Уведомление успешно отправлено для ${employee.fullName} (${period})`)
    } catch (error) {
      console.error(`Ошибка при отправке уведомления для ${employee.fullName}:`, error)
    }
  }
}

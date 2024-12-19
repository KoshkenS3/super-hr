import { Context, Telegraf } from 'telegraf'
import { Employee } from '../entities/Employee.entity'
import { EmployeeService } from './employee.service'
import { WizardContext } from 'src/types/context'

export class NotificationService {
  constructor(
    private bot: Telegraf<WizardContext>,
    private employeeService: EmployeeService,
  ) {}

  async checkAndSendNotifications(): Promise<void> {
    try {
      const employees = await this.employeeService.getEmployeesWithDeadlines()

      for (const employee of employees) {
        const startDate = new Date(employee.startDate)
        const today = new Date()
        const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysPassed === employee.adaptationDays) {
          await this.sendNotification(employee, 'адаптация')
        }

        if (daysPassed === employee.probationDays) {
          await this.sendNotification(employee, 'испытательный срок')
        }
      }
    } catch (error) {
      console.error('Ошибка при отправке уведомлений:', error)
    }
  }

  private async sendNotification(employee: Employee, period: string): Promise<void> {
    const message = `Сегодня у сотрудника ${employee.fullName} заканчивается ${period}.`
    await this.bot.telegram.sendMessage(employee.userId, message)
  }
}

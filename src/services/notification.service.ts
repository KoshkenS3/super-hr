import { Context, Telegraf } from 'telegraf'
import { Employee } from '../entities/Employee.entity'
import { EmployeeService } from './employee.service'
import { WizardContext } from 'src/types/context'
import { parse, addDays, isSameDay } from 'date-fns'

// Сервис для отправки уведомлений о дедлайнах сотрудников
export class NotificationService {
  constructor(
    private bot: Telegraf<WizardContext>, // Экземпляр бота для отправки сообщений
    private employeeService: EmployeeService, // Сервис для работы с данными сотрудников
  ) {}

  // Метод проверки и отправки уведомлений
  async checkAndSendNotifications(): Promise<void> {
    try {
      // Получаем всех сотрудников с активными дедлайнами
      const employees = await this.employeeService.getEmployeesWithDeadlines()
      const today = new Date()

      // Проверяем каждого сотрудника
      for (const employee of employees) {
        // Преобразуем строковую дату в объект Date
        const startDateObj = parse(employee.startDate, 'dd.MM.yyyy', new Date())
        // Вычисляем даты окончания периодов
        const adaptationEndDate = addDays(startDateObj, employee.adaptationDays)
        const probationEndDate = addDays(startDateObj, employee.probationDays)

        // Проверяем, заканчивается ли сегодня период адаптации
        if (isSameDay(today, adaptationEndDate)) {
          await this.sendNotification(employee, 'адаптация')
          console.log(`Отправлено уведомление об окончании адаптации для ${employee.fullName}`)
        }

        // Проверяем, заканчивается ли сегодня испытательный срок
        if (isSameDay(today, probationEndDate)) {
          await this.sendNotification(employee, 'испытательный срок')
          console.log(`Отправлено уведомление об окончании испытательного срока для ${employee.fullName}`)
        }
      }
    } catch (error) {
      console.error('Ошибка при отправке уведомлений:', error)
    }
  }

  // Приватный метод для отправки уведомления конкретному сотруднику
  private async sendNotification(employee: Employee, period: string): Promise<void> {
    const message = `❗️ Внимание! Сегодня у сотрудника ${employee.fullName} заканчивается ${period}.`
    try {
      // Отправляем сообщение через Telegram API
      await this.bot.telegram.sendMessage(employee.userId, message)
      console.log(`Уведомление успешно отправлено для ${employee.fullName} (${period})`)
    } catch (error) {
      console.error(`Ошибка при отправке уведомления для ${employee.fullName}:`, error)
    }
  }
}

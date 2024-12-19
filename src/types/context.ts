import { Context, Scenes } from 'telegraf'
import { EmployeeService } from '../services/employee.service'

// Интерфейс для данных сотрудника
interface EmployeeData {
  fullName?: string
  startDate?: string
  adaptationDays?: number
  probationDays?: number
  userId?: string
}

// Базовый контекст с минимальной типизацией
export interface BotContext extends Context {
  employeeService: EmployeeService
  session: any
  scene: any
  wizard?: any
}

// Контекст для wizard сцен с минимальной типизацией
export interface WizardContext extends BotContext {
  wizard: any
}

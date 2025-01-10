import { Context, Scenes } from 'telegraf'
import { EmployeeService } from '../services/employee.service'

// Интерфейс для данных сотрудника
interface EmployeeData {
  fullName?: string // ФИО сотрудника
  startDate?: string // Дата начала работы
  adaptationDays?: number // Дни адаптации
  probationDays?: number // Дни испытательного срока
  userId?: string // ID пользователя в Telegram
}

// Базовый контекст с минимальной типизацией
export interface BotContext extends Context {
  employeeService: EmployeeService // Сервис для работы с сотрудниками
  session: any // Данные сессии
  scene: any // Текущая сцена
  wizard?: any // Мастер для пошагового диалога
}

// Контекст для wizard сцен с минимальной типизацией
export interface WizardContext extends BotContext {
  wizard: any // Обязательное поле для wizard сцен
}

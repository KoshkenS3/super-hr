import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

// Декоратор @Entity указывает, что это класс является сущностью базы данных
@Entity('employees')
export class Employee {
  // Автоматически генерируемый первичный ключ
  @PrimaryGeneratedColumn()
  id!: number

  // ID пользователя в Telegram
  @Column()
  userId!: string

  // ФИО сотрудника
  @Column()
  fullName!: string

  // Дата начала работы в формате DD.MM.YYYY
  @Column()
  startDate!: string

  // Количество дней адаптационного периода
  @Column()
  adaptationDays!: number

  // Количество дней испытательного срока
  @Column()
  probationDays!: number

  // Дата создания записи (заполняется автоматически)
  @CreateDateColumn()
  createdAt!: Date

  // Конструктор для создания объекта сотрудника
  constructor(data?: Partial<Employee>) {
    if (data) {
      this.userId = data.userId || ''
      this.fullName = data.fullName || ''
      this.startDate = data.startDate || ''
      this.adaptationDays = data.adaptationDays || 0
      this.probationDays = data.probationDays || 0
      this.createdAt = data.createdAt || new Date()
    }
  }
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  userId!: string

  @Column()
  fullName!: string

  @Column()
  startDate!: string

  @Column()
  adaptationDays!: number

  @Column()
  probationDays!: number

  @CreateDateColumn()
  createdAt!: Date

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

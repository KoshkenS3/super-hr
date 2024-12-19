import { DataSource, Repository } from 'typeorm'
import { Employee } from '../entities/Employee.entity'
import { addDays, format, parse, isSameDay } from 'date-fns'

export class EmployeeService {
  private employeeRepository: Repository<Employee>

  constructor(private dataSource: DataSource) {
    this.employeeRepository = dataSource.getRepository(Employee)
  }

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const employee = new Employee(data)
    return await this.employeeRepository.save(employee)
  }

  async getEmployeesByUserId(userId: string, skip = 0, take = 5): Promise<[Employee[], number]> {
    return await this.employeeRepository.findAndCount({
      where: { userId },
      skip,
      take,
      order: { createdAt: 'DESC' },
    })
  }

  async getEmployeesWithDeadlines(): Promise<Employee[]> {
    const employees = await this.employeeRepository.find()
    const today = new Date()

    return employees.filter((employee) => {
      const startDateObj = parse(employee.startDate, 'dd.MM.yyyy', new Date())
      const adaptationEndDate = addDays(startDateObj, employee.adaptationDays)
      const probationEndDate = addDays(startDateObj, employee.probationDays)

      return isSameDay(today, adaptationEndDate) || isSameDay(today, probationEndDate)
    })
  }
}

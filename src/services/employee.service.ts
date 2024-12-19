import { DataSource, Repository } from 'typeorm'
import { Employee } from '../entities/Employee.entity'
import { addDays, format, parse } from 'date-fns'

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
    const today = format(new Date(), 'yyyy-MM-dd')
    const employees = await this.employeeRepository.find()

    return employees.filter((employee) => {
      const startDate = parse(employee.startDate, 'dd.MM.yyyy', new Date())
      const adaptationEndDate = format(addDays(startDate, employee.adaptationDays), 'yyyy-MM-dd')
      const probationEndDate = format(addDays(startDate, employee.probationDays), 'yyyy-MM-dd')

      return adaptationEndDate === today || probationEndDate === today
    })
  }
}

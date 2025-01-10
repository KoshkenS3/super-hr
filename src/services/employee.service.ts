import { DataSource, Repository } from 'typeorm'
import { Employee } from '../entities/Employee.entity'
import { addDays, format, parse, isSameDay } from 'date-fns'

// Сервис для работы с данными сотрудников в базе данных
export class EmployeeService {
  // Репозиторий для работы с таблицей сотрудников
  private employeeRepository: Repository<Employee>

  constructor(private dataSource: DataSource) {
    // Получаем репозиторий для работы с сущностью Employee
    this.employeeRepository = dataSource.getRepository(Employee)
  }

  // Метод создания нового сотрудника
  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const employee = new Employee(data)
    return await this.employeeRepository.save(employee) // Сохраняем в базу данных
  }

  // Получение списка сотрудников конкретного пользователя с пагинацией
  async getEmployeesByUserId(userId: string, skip = 0, take = 5): Promise<[Employee[], number]> {
    return await this.employeeRepository.findAndCount({
      where: { userId }, // Фильтр по ID пользователя
      skip, // Сколько записей пропустить (для пагинации)
      take, // Сколько записей взять
      order: { createdAt: 'DESC' }, // Сортировка по дате создания (сначала новые)
    })
  }

  // Получение сотрудников, у которых сегодня заканчивается адаптация или испытательный срок
  async getEmployeesWithDeadlines(): Promise<Employee[]> {
    const employees = await this.employeeRepository.find()
    const today = new Date()

    // Фильтруем сотрудников
    return employees.filter((employee) => {
      const startDateObj = parse(employee.startDate, 'dd.MM.yyyy', new Date())
      const adaptationEndDate = addDays(startDateObj, employee.adaptationDays)
      const probationEndDate = addDays(startDateObj, employee.probationDays)

      // Возвращаем true если сегодня заканчивается адаптация или испытательный срок
      return isSameDay(today, adaptationEndDate) || isSameDay(today, probationEndDate)
    })
  }
}

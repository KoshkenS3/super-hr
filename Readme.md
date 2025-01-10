# Руководство по коду HR Telegram бота 🌸

## 📁 Структура проекта

Проект разделен на несколько основных частей, каждая в своей папке:

### 🗂 Основные папки:

src/
├── entities/       # Описание данных для базы
├── keyboards/      # Кнопки для бота
├── scenes/         # Диалоги с пользователем
├── services/       # Работа с данными и уведомления
├── types/          # Описание типов данных
└── utils/          # Вспомогательные функции

### 📦 Основные файлы:

- `src/main.ts` - Главный файл, запускает бота
- `.env` - Настройки бота (токен и другие параметры)
- `ecosystem.config.js` - Настройки запуска в продакшене
- `package.json` - Зависимости проекта

## 🔧 Как устроен код

### 1️⃣ Хранение данных (src/entities/Employee.entity.ts)
Здесь описано, какие данные хранятся о каждом сотруднике:

```typescript
@Entity('employees')
export class Employee {
  @Column()
  fullName!: string        // ФИО сотрудника
  
  @Column()
  startDate!: string      // Когда начал работать
  
  @Column()
  adaptationDays!: number // Сколько дней длится адаптация
  
  @Column()
  probationDays!: number  // Сколько дней испытательный срок
}
```

Если нужно добавить новое поле (например, должность), добавьте его сюда:
```typescript
@Column()
position!: string        // Должность сотрудника
```

### 2️⃣ Кнопки бота (src/keyboards/main.ts)
Здесь находятся все кнопки, которые видит пользователь. Чтобы изменить текст кнопки:
```typescript
// Было:
['👤 Добавить сотрудника', '📋 Показать сотрудников']

// Стало:
['👤 Новый сотрудник', '📋 Список сотрудников']
```

### 3️⃣ Диалоги (src/scenes/)

#### addEmployee.ts - Добавление сотрудника
Пошаговый диалог (WizardScene) для добавления нового сотрудника. Состоит из 6 шагов:
1. Запрос ФИО
2. Запрос даты начала работы (с валидацией формата DD.MM.YYYY)
3. Запрос дней адаптации (с проверкой на положительное число)
4. Запрос дней испытательного срока
5. Показ всех введенных данных и запрос подтверждения
6. Сохранение в базу данных

Каждый шаг имеет свою валидацию и обработку ошибок. Данные временно хранятся в ctx.session.employeeData

#### showEmployees.ts - Просмотр списка
Сцена для отображения списка сотрудников с пагинацией:
- Показывает по 5 сотрудников на странице
- Форматирует даты в русском формате (например, "1 января 2024")
- Автоматически вычисляет даты окончания адаптации и испытательного срока
- Имеет навигационные кнопки "Вперед" и "Назад"

### 4️⃣ Сервисы (src/services/)

#### employee.service.ts
Сервис для работы с базой данных SQLite через TypeORM:
- Создание новых сотрудников
- Получение списка с пагинацией
- Поиск сотрудников с истекающими сроками

#### notification.service.ts
Автоматическая система уведомлений:
- Запускается каждый день в 09:00 по московскому времени
- Проверяет даты адаптации и испытательного срока
- Отправляет уведомления при истечении сроков

### 5️⃣ Проверка данных (src/utils/validators.ts)
Проверяет правильность введенных данных:
```typescript
// Проверка даты (формат DD.MM.YYYY)
export const isValidDate = (dateString: string): boolean => {
  const parsedDate = parse(dateString, 'dd.MM.yyyy', new Date())
  return isValid(parsedDate)
}

// Проверка что число положительное
export const isValidNumber = (value: string): boolean => {
  const number = parseInt(value)
  return !isNaN(number) && number > 0
}
```

## ✏️ Как вносить изменения

### Изменить текст сообщений
1. Найдите нужный файл в src/scenes/
2. Измените текст в ctx.reply('Ваш новый текст')

### Добавить новое поле для сотрудника
1. Добавьте поле в src/entities/Employee.entity.ts
2. Добавьте запрос этого поля в диалог (src/scenes/addEmployee.ts)
3. Добавьте поле в отображение (src/scenes/showEmployees.ts)

### Изменить формат уведомлений
1. Откройте src/services/notification.service.ts
2. Найдите метод sendNotification
3. Измените формат сообщения

### Изменить кнопки
1. Откройте src/keyboards/main.ts
2. Измените текст в массивах кнопок

## ⚠️ Чего нельзя делать
- Менять имена файлов
- Удалять файлы
- Менять структуру папок
- Удалять декораторы (@Entity, @Column и т.д.)
- Менять типы данных (string на number и т.п.)

## 🆘 Если что-то сломалось
1. Отмените последние изменения)
3. Перезапустите бота)

## 📝 Примеры изменений

### Пример 1: Изменить текст кнопки
```typescript
// src/keyboards/main.ts
export const mainKeyboard = Markup.keyboard([
  ['👤 Новый работник', '📋 Все работники'] // Было: 'Добавить сотрудника', 'Показать сотрудников'
]).resize()
```

### Пример 2: Изменить формат карточки сотрудника
```typescript
// src/scenes/showEmployees.ts
return `
🧑‍💼 КАРТОЧКА СОТРУДНИКА
───────────────
Имя: ${emp.fullName}
Работает с: ${startDate}
Адаптация до: ${adaptationEndDate}
Испытательный срок до: ${probationEndDate}
───────────────`
```

### Пример 3: Изменить текст уведомления
```typescript
// src/services/notification.service.ts
const message = `
🔔 НАПОМИНАНИЕ!
У сотрудника ${employee.fullName} 
сегодня заканчивается ${period}.
Не забудьте провести встречу!`
```
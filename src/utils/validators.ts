import { parse, isValid } from 'date-fns'

// Проверяет корректность введенной даты в формате DD.MM.YYYY
export const isValidDate = (dateString: string): boolean => {
  // Пытаемся распарсить строку в объект даты
  const parsedDate = parse(dateString, 'dd.MM.yyyy', new Date())
  // Проверяем, что дата валидна
  return isValid(parsedDate)
}

// Проверяет, что строка является положительным числом
export const isValidNumber = (value: string): boolean => {
  const number = parseInt(value)
  // Проверяем, что это число и оно больше нуля
  return !isNaN(number) && number > 0
}

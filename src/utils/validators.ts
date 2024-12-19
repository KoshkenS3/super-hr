import { parse, isValid } from 'date-fns'

export const isValidDate = (dateString: string): boolean => {
  const parsedDate = parse(dateString, 'dd.MM.yyyy', new Date())
  return isValid(parsedDate)
}

export const isValidNumber = (value: string): boolean => {
  const number = parseInt(value)
  return !isNaN(number) && number > 0
}

import { Context, Scenes } from 'telegraf'
import { EmployeeService } from '../services/employee.service'

interface EmployeeData {
  fullName?: string
  startDate?: string
  adaptationDays?: number
  probationDays?: number
  userId?: string
}

type BotWizardSession = {
  employeeData: EmployeeData
} & Scenes.WizardSession

export interface WizardContext extends Context {
  scene: Scenes.SceneContextScene<WizardContext, Scenes.WizardSessionData>
  wizard: Scenes.WizardContextWizard<WizardContext>
  session: BotWizardSession
  employeeService: EmployeeService
}

export type MyContext = WizardContext

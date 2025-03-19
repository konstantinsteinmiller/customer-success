export interface LogoutResult {
  message: string
  success: boolean
}

export interface VerifyTokenResult {
  message: string
  isValid: boolean
}

export interface VisitorResult {
  message: string
  data: any[]
}

export interface DateRange {
  start: string
  end: string
}

export interface ProcessResult {
  message: string
  data: any[]
}

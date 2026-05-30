type ErrorStatus = 'fail' | 'error'

interface ValidationIssue {
  path: string
  message: string
}

class AppError extends Error {
  statusCode: number
  status: ErrorStatus
  isOperational: boolean
  errors?: ValidationIssue[]

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error'
    this.isOperational = true // an error we threw on purpose, not an unexpected bug
    Error.captureStackTrace(this, this.constructor)
  }
}

export default AppError

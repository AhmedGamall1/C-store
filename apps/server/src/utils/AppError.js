class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true // marking this error as operational (trusted) error not a programming or other unknown error
    Error.captureStackTrace(this, this.constructor)
  }
}

export default AppError

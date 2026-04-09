import multer from 'multer'
import AppError from '../utils/AppError.js'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const storage = multer.memoryStorage()

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400), false)
  }
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
})

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'Image must not exceed 5 MB',
      LIMIT_FILE_COUNT: 'Too many files uploaded',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
    }
    return next(new AppError(messages[err.code] ?? err.message, 400))
  }
  next(err)
}

export default upload

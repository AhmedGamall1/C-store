import { Readable } from 'stream'
import cloudinary from '../config/cloudinary.js'

export const uploadImage = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],

        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
        ...options,
      },
      (error, result) => {
        if (error) return reject(new Error(error.message))
        resolve(result)
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}

export const deleteImage = async (publicId) => {
  if (!publicId) return
  await cloudinary.uploader.destroy(publicId)
}

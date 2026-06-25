import { mailer } from '../config/mailer.js'
import { env } from '../config/env.js'

export const sendVerificationEmail = async (to: string, rawToken: string) => {
  const link = `${env.CLIENT_URL}/verify-email?token=${rawToken}`
  await mailer.sendMail({
    from: `"C-Store" <${env.GMAIL_USER}>`,
    to,
    subject: 'Verify your email',
    html: `
      <h2>Welcome to C-Store 👋</h2>
      <p>Confirm your email:</p>
      <a href="${link}">Verify my email</a>
      <p>This link expires in 24 hours.</p>`,
  })
}

export const sendPasswordResetEmail = async (to: string, rawToken: string) => {
  const link = `${env.CLIENT_URL}/reset-password?token=${rawToken}`
  await mailer.sendMail({
    from: `"C-Store" <${env.GMAIL_USER}>`,
    to,
    subject: 'Reset your password',
    html: `
      <h2>Reset your password</h2>
      <p>Click below to set a new password:</p>
      <a href="${link}">Reset password</a>
      <p>This link expires in 30 minutes. If you didn't ask for this, ignore this email.</p>`,
  })
}

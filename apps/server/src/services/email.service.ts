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

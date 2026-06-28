interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'PUGI-LMS';
const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL || 'no-reply@pugi.local';

export async function sendMail({ to, subject, text, html }: MailOptions) {
  if (!BREVO_API_KEY) {
    console.log(`\n[MAILER:DEV]\nTo: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: MAIL_FROM_NAME, email: MAIL_FROM_EMAIL },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html || `<p>${text}</p>`,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo send failed: ${response.status} ${errorBody}`);
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  await sendMail({
    to: email,
    subject: 'Your PUGI verification code',
    text: `Your PUGI verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>PUGI email verification</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  await sendMail({
    to: email,
    subject: 'Reset your PUGI password',
    text: `Use this reset token to reset your PUGI password: ${token}. It expires in 1 hour.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>PUGI password reset</h2>
        <p>Use this reset token:</p>
        <p style="font-size: 18px; font-weight: 700; word-break: break-all;">${token}</p>
        <p>This token expires in 1 hour.</p>
      </div>
    `,
  });
}

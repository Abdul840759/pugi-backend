import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () => {
  if (!hasSmtpConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10s to establish connection
    greetingTimeout: 10000,   // 10s for SMTP greeting
    socketTimeout: 15000,     // 15s of inactivity before killing socket
  });
};

export async function sendMail({ to, subject, text, html }: MailOptions) {
  const transporter = createTransporter();
  const from = process.env.MAIL_FROM || 'PUGI <no-reply@pugi.local>';

  if (!transporter) {
    console.log(`\n[MAILER:DEV]\nTo: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }

  await transporter.sendMail({ from, to, subject, text, html });
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

import nodemailer from "nodemailer";

export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Resimpli <no-reply@resimpli.local>';
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendResetEmail = async (email, resetLink, username) => {
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email transport is not configured. Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env');
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject: 'Resimpli Password Reset Request',
    html: `
      <p>Hi ${username || 'there'},</p>
      <p>We received a request to reset your password for your Resimpli account.</p>
      <p><a href="${resetLink}" target="_blank">Click here to reset your password</a></p>
      <p>If you did not request a password reset, you can safely ignore this message.</p>
      <p>This link expires in 1 hour.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

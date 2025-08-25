import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ⚠️ allows self-signed certs
  },
});

export const sendOTPEmail = async (to, code) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your verification code",
    text: `Your OTP is ${code}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <b>${code}</b>. It expires in 10 minutes.</p>`,
  });
  return info.messageId;
};

// Generic transaction email sender
export const sendTransactionEmail = async (to, subject, text) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html: `<p>${text}</p>`,
  });
  return info.messageId;
};

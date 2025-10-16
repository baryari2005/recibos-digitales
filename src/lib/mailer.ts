import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST!;
const port = Number(process.env.SMTP_PORT || 587);
const secure = String(process.env.SMTP_SECURE || "false") === "true";
const user = process.env.SMTP_USER!;
const pass = process.env.SMTP_PASS!;
const from = process.env.SMTP_FROM || "no-reply@example.com";

const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

export async function sendPasswordReset(to: string, resetLink: string, name?: string) {
  const html = `
    <p>Hola ${name ?? ""}</p>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente enlace (válido por tiempo limitado):</p>
    <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
  `;
  const text =
    `Hola ${name ?? ""}\n\n` +
    `Recibimos una solicitud para restablecer tu contraseña.\n` +
    `Enlace (válido por tiempo limitado): ${resetLink}\n\n` +
    `Si no solicitaste este cambio, ignora este correo.`;

  await transporter.sendMail({ to, from, subject: "Restablecer contraseña", html, text });
}

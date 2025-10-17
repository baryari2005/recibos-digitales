// import nodemailer from "nodemailer";

// const host = process.env.SMTP_HOST!;
// const port = Number(process.env.SMTP_PORT || 587);
// const secure = String(process.env.SMTP_SECURE || "false") === "true";
// const user = process.env.SMTP_USER!;
// const pass = process.env.SMTP_PASS!;
// const from = process.env.SMTP_FROM || "no-reply@example.com";

// const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

// export async function sendPasswordReset(to: string, resetLink: string, name?: string) {
//   const html = `
//     <p>Hola ${name ?? ""}</p>
//     <p>Recibimos una solicitud para restablecer tu contraseña.</p>
//     <p>Haz clic en el siguiente enlace (válido por tiempo limitado):</p>
//     <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
//     <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
//   `;
//   const text =
//     `Hola ${name ?? ""}\n\n` +
//     `Recibimos una solicitud para restablecer tu contraseña.\n` +
//     `Enlace (válido por tiempo limitado): ${resetLink}\n\n` +
//     `Si no solicitaste este cambio, ignora este correo.`;

//   await transporter.sendMail({ to, from, subject: "Restablecer contraseña", html, text });
// }

import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST!;
const port = Number(process.env.SMTP_PORT || 587);
const secure = String(process.env.SMTP_SECURE || "false") === "true";
const user = process.env.SMTP_USER!;
const pass = process.env.SMTP_PASS!;
const from = process.env.SMTP_FROM || "no-reply@example.com";

// Opcional: branding (no afecta el envío)
const BRAND_NAME = process.env.BRAND_NAME || "Mi Sistema";
const BRAND_LOGO_URL = process.env.BRAND_LOGO_URL || "";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || from;

// Paleta (inline)
const PRIMARY = "#008C93";
const TEXT = "#2D3135";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";

const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

function buildHtml(name: string | undefined, resetLink: string) {
  const safeName = name ?? "👋";
  const preheader = "Restablecé tu contraseña. Si no fuiste vos, ignorá este correo.";
  return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Restablecer contraseña</title>
<style>@media (max-width:600px){.container{width:100%!important}.content{padding:24px!important}.btn{width:100%!important}}</style>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;">
  <!-- Preheader oculto -->
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${preheader}</span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" class="container" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;overflow:hidden">
          <!-- Header -->
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid ${BORDER}">
              <table role="presentation" width="100%">
                <tr>
                  <td align="left">
                    ${
                      BRAND_LOGO_URL
                        ? `<img src="${BRAND_LOGO_URL}" alt="${BRAND_NAME}" height="32" style="display:block;height:32px">`
                        : `<span style="font-size:18px;font-weight:700;color:${TEXT}">${BRAND_NAME}</span>`
                    }
                  </td>
                  <td align="right" style="font-size:12px;color:${MUTED}">Notificación de seguridad</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="content" style="padding:32px">
              <h1 style="margin:0 0 8px 0;font-size:20px;line-height:28px;color:${TEXT};font-weight:700">Hola ${safeName}</h1>
              <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:${TEXT}">
                Recibimos una solicitud para restablecer tu contraseña de <strong>${BRAND_NAME}</strong>.
              </p>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:22px;color:${TEXT}">
                Hacé clic en el siguiente botón para crear una contraseña nueva. El enlace es válido por tiempo limitado.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0">
                <tr>
                  <td align="center" bgcolor="${PRIMARY}" style="border-radius:10px">
                    <a href="${resetLink}" target="_blank"
                      style="display:inline-block;padding:12px 18px;font-size:14px;line-height:20px;color:#ffffff;text-decoration:none;font-weight:600;border-radius:10px"
                      class="btn">Restablecer contraseña</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px 0;font-size:12px;line-height:20px;color:${MUTED}">
                Si el botón no funciona, copiá y pegá este enlace en tu navegador:
              </p>
              <p style="word-break:break-all;margin:0 0 24px 0;font-size:12px;line-height:20px">
                <a href="${resetLink}" target="_blank" style="color:${PRIMARY};text-decoration:underline">${resetLink}</a>
              </p>

              <p style="margin:0 0 8px 0;font-size:12px;line-height:20px;color:${MUTED}">
                Si no solicitaste este cambio, podés ignorar este mensaje. Tu contraseña seguirá siendo la misma.
              </p>
              <p style="margin:0;font-size:12px;line-height:20px;color:${MUTED}">
                ¿Necesitás ayuda? Escribinos a <a href="mailto:${SUPPORT_EMAIL}" style="color:${PRIMARY};text-decoration:none">${SUPPORT_EMAIL}</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px;border-top:1px solid ${BORDER};background:#F9FAFB">
              <p style="margin:0;font-size:11px;line-height:18px;color:${MUTED}">© ${new Date().getFullYear()} ${BRAND_NAME}. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>

        <div style="height:24px"></div>
        <div style="font-size:11px;color:${MUTED};max-width:600px">
          Estás recibiendo este correo porque alguien (posiblemente vos) inició un proceso de restablecimiento de contraseña.
        </div>
      </td>
    </tr>
  </table>
</body></html>`;
}

function buildText(name: string | undefined, resetLink: string) {
  return `Hola ${name ?? ""}

Recibimos una solicitud para restablecer tu contraseña de ${BRAND_NAME}.
Usá este enlace (válido por tiempo limitado):

${resetLink}

Si no solicitaste este cambio, ignorá este correo.
¿Ayuda? Escribinos a ${SUPPORT_EMAIL}.`;
}

export async function sendPasswordReset(to: string, resetLink: string, name?: string) {
  const html = buildHtml(name, resetLink);
  const text = buildText(name, resetLink);

  // *** Igual que tu versión que funciona ***
  await transporter.sendMail({
    to,
    from,                            // <- sin nombre, sin envelope
    subject: "Restablecer contraseña", // <- ASCII simple
    html,
    text,
  });
}

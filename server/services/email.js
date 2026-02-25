const nodemailer = require('nodemailer')

// Проверка наличия SMTP настроек
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('⚠️ SMTP credentials not set! Email sending will fallback to console logs')
  console.warn('⚠️ Add SMTP_USER and SMTP_PASS environment variables to enable email sending')
}

// Транспорт Яндекс
const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Увеличенные таймауты для стабильности
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
})

// HTML-шаблон письма с кодом подтверждения
function buildVerificationEmail(code, userName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#60a5fa,#3b82f6);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Smart Home</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;">Подтверждение email</h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.5;">
                Привет${userName ? ', ' + userName : ''}! Используй этот код для подтверждения твоего аккаунта:
              </p>
              <!-- Code -->
              <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1e293b;">${code}</span>
              </div>
              <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;">Код действителен 10 минут.</p>
              <p style="margin:0;color:#94a3b8;font-size:13px;">Если ты не регистрировался — просто проигнорируй это письмо.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">Smart Home App</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Отправка с повторными попытками
async function sendWithRetry(mailOptions, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error(`❌ Попытка ${attempt}/${maxRetries} — ошибка: ${error.message}`)
      if (attempt < maxRetries) {
        // Ждём перед повторной попыткой (1с, 2с, 3с)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
      } else {
        throw error
      }
    }
  }
}

// Отправка кода подтверждения
async function sendVerificationCode(toEmail, code, userName) {
  const html = buildVerificationEmail(code, userName)

  const mailOptions = {
    from: `"Smart Home" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `${code} — код подтверждения Smart Home`,
    html
  }

  // Всегда выводим код в логи для отладки
  console.log(`📧 Код подтверждения для ${toEmail}: ${code}`)

  // Если SMTP не настроен — только логируем
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️ SMTP not configured — email not sent')
    return false
  }

  try {
    await sendWithRetry(mailOptions)
    console.log(`✅ Письмо с кодом отправлено на ${toEmail}`)
    return true
  } catch (error) {
    console.error(`❌ Не удалось отправить письмо на ${toEmail}: ${error.message}`)
    return false
  }
}

// HTML-шаблон письма для сброса пароля
function buildPasswordResetEmail(code, userName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Smart Home</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;">Сброс пароля</h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.5;">
                Привет${userName ? ', ' + userName : ''}! Используй этот код для сброса пароля:
              </p>
              <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1e293b;">${code}</span>
              </div>
              <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;">Код действителен 10 минут.</p>
              <p style="margin:0;color:#94a3b8;font-size:13px;">Если ты не запрашивал сброс пароля — просто проигнорируй это письмо.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">Smart Home App</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Отправка кода сброса пароля
async function sendPasswordResetCode(toEmail, code, userName) {
  const html = buildPasswordResetEmail(code, userName)

  const mailOptions = {
    from: `"Smart Home" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `${code} — код сброса пароля Smart Home`,
    html
  }

  try {
    await sendWithRetry(mailOptions)
    console.log(`✅ Письмо со сбросом пароля отправлено на ${toEmail}`)
    return true
  } catch (error) {
    console.error(`❌ Не удалось отправить письмо на ${toEmail} после 3 попыток`)
    console.log(`📧 Fallback — код сброса пароля для ${toEmail}: ${code}`)
    return false
  }
}

module.exports = { sendVerificationCode, sendPasswordResetCode }

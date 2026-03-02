const { Resend } = require('resend')

// Инициализация Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Проверка наличия API ключа
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY not set — email sending disabled')
  console.warn('💡 Код подтверждения будет показан только в логах сервера')
} else {
  console.log('✅ Resend configured — email sending enabled')
}

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

// Отправка кода подтверждения через Resend
async function sendVerificationCode(toEmail, code, userName) {
  const html = buildVerificationEmail(code, userName)

  // Всегда выводим код в логи для отладки
  console.log('')
  console.log('📬 ──────────────────────────────────────')
  console.log(`📧 Код подтверждения для ${toEmail}: ${code}`)
  console.log('📬 ──────────────────────────────────────')
  console.log('')

  // Если Resend не настроен — только логируем
  if (!resend) {
    console.log('⚠️ Resend not configured — email not sent (code shown in logs above)')
    return false
  }

  try {
    console.log('📤 Отправка email через Resend...')
    
    const data = await resend.emails.send({
      from: 'Smart Home <onboarding@resend.dev>',
      to: toEmail,
      subject: `${code} — код подтверждения Smart Home`,
      html
    })

    console.log(`✅ Email отправлен через Resend: ${data.id}`)
    return true
  } catch (error) {
    console.error(`❌ Ошибка отправки email: ${error.message}`)
    console.log('💡 Используйте код из логов выше:', code)
    return false
  }
}

// Отправка кода сброса пароля через Resend
async function sendPasswordResetCode(toEmail, code, userName) {
  const html = buildPasswordResetEmail(code, userName)

  // Всегда выводим код в логи
  console.log('')
  console.log('📬 ──────────────────────────────────────')
  console.log(`📧 Код сброса пароля для ${toEmail}: ${code}`)
  console.log('📬 ──────────────────────────────────────')
  console.log('')

  // Если Resend не настроен — только логируем
  if (!resend) {
    console.log('⚠️ Resend not configured — email not sent')
    return false
  }

  try {
    console.log('📤 Отправка email через Resend...')
    
    const data = await resend.emails.send({
      from: 'Smart Home <onboarding@resend.dev>',
      to: toEmail,
      subject: `${code} — код сброса пароля Smart Home`,
      html
    })

    console.log(`✅ Email отправлен через Resend: ${data.id}`)
    return true
  } catch (error) {
    console.error(`❌ Ошибка отправки email: ${error.message}`)
    return false
  }
}

module.exports = { sendVerificationCode, sendPasswordResetCode }

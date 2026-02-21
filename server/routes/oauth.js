const express = require('express')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const { users } = require('../config/database')
const { JWT_SECRET } = require('../middleware/auth')

const router = express.Router()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// Вспомогательная: найти или создать OAuth-пользователя
function findOrCreateOAuthUser(provider, oauthId, profile) {
  // Ищем по OAuth ID
  let user = users.findByOAuthId(provider, oauthId)
  if (user) return user

  // Ищем по email (если уже есть аккаунт с таким email — привязываем)
  if (profile.email) {
    user = users.findByEmail(profile.email)
    if (user) {
      users.update(user.id, { oauth_provider: provider, oauth_id: oauthId })
      return users.findById(user.id)
    }
  }

  // Создаём нового пользователя
  return users.create({
    name: profile.name || profile.email || 'User',
    email: profile.email || `${provider}_${oauthId}@oauth.local`,
    password: null,
    email_verified: true,
    oauth_provider: provider,
    oauth_id: oauthId,
    avatar: profile.avatar || null
  })
}

// Вспомогательная: сгенерировать JWT и перенаправить на фронтенд
function redirectWithToken(res, user) {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  res.redirect(`${FRONTEND_URL}/login?token=${token}`)
}

// ========================
//        GITHUB
// ========================
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) return res.status(500).json({ error: 'GitHub OAuth не настроен' })

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'user:email',
    redirect_uri: `${req.protocol}://${req.get('host')}/api/oauth/github/callback`
  })
  res.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

router.get('/github/callback', async (req, res) => {
  const { code } = req.query
  if (!code) return res.redirect(`${FRONTEND_URL}/login?error=no_code`)

  try {
    // Обмениваем code на access_token
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, { headers: { Accept: 'application/json' } })

    const accessToken = tokenRes.data.access_token
    if (!accessToken) return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`)

    // Получаем профиль
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    // Получаем email (может быть приватным)
    let email = userRes.data.email
    if (!email) {
      const emailsRes = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const primary = emailsRes.data.find(e => e.primary) || emailsRes.data[0]
      email = primary?.email
    }

    const user = findOrCreateOAuthUser('github', String(userRes.data.id), {
      name: userRes.data.name || userRes.data.login,
      email,
      avatar: userRes.data.avatar_url
    })

    redirectWithToken(res, user)
  } catch (error) {
    console.error('GitHub OAuth error:', error.message)
    res.redirect(`${FRONTEND_URL}/login?error=auth_failed`)
  }
})

// ========================
//        GOOGLE
// ========================
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return res.status(500).json({ error: 'Google OAuth не настроен' })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${req.protocol}://${req.get('host')}/api/oauth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account'
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

router.get('/google/callback', async (req, res) => {
  const { code } = req.query
  if (!code) return res.redirect(`${FRONTEND_URL}/login?error=no_code`)

  try {
    // Обмениваем code на токены
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: `${req.protocol}://${req.get('host')}/api/oauth/google/callback`,
      grant_type: 'authorization_code'
    })

    const accessToken = tokenRes.data.access_token
    if (!accessToken) return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`)

    // Получаем профиль
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    const user = findOrCreateOAuthUser('google', String(userRes.data.id), {
      name: userRes.data.name,
      email: userRes.data.email,
      avatar: userRes.data.picture
    })

    redirectWithToken(res, user)
  } catch (error) {
    console.error('Google OAuth error:', error.message)
    res.redirect(`${FRONTEND_URL}/login?error=auth_failed`)
  }
})

module.exports = router

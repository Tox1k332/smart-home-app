// URL backend для OAuth
const getBackendUrl = () => {
  // Если запущено на GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    return 'https://smart-home-api-l5dr.onrender.com'
  }
  // Локально используем proxy
  return ''
}

// OAuth URLs
export const getOAuthUrl = (provider) => {
  const baseUrl = getBackendUrl()
  return `${baseUrl}/api/oauth/${provider}`
}

// Ping backend every 4 minutes to prevent Render free tier sleep
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://assign-fma7.onrender.com'

export function startKeepalive() {
  fetch(`${BACKEND_URL}/api/health`).catch(() => {})
  setInterval(() => {
    fetch(`${BACKEND_URL}/api/health`).catch(() => {})
  }, 4 * 60 * 1000)
}

const API_BASE = '/api'

export async function api(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { ...options.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (res.status === 401) {
    // Only fire session-expired if there was an active token (not a failed login attempt)
    if (localStorage.getItem('token')) {
      window.dispatchEvent(new Event('auth:session-expired'))
    }
  }

  if (!res.ok) {
    throw new Error(data.message || 'Error en la solicitud')
  }

  return data
}

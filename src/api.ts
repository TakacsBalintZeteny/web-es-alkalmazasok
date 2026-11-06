
const API_URL = 'http://localhost:3001/api'

export type User = {
  id: number
  name: string
  email: string
  role: 'GUEST' | 'MANAGER'
}

export type AuthResponse = {
  token: string
  user: User
}

const TOKEN_KEY = 'tablebook_token'
const USER_KEY = 'tablebook_user'

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  const storedUser = sessionStorage.getItem(USER_KEY)

  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as User
  } catch {
    sessionStorage.removeItem(USER_KEY)
    return null
  }
}

export function saveAuth(data: AuthResponse): void {
  sessionStorage.setItem(TOKEN_KEY, data.token)
  sessionStorage.setItem(USER_KEY, JSON.stringify(data.user))
}

export function clearAuth(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getToken()

  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error ?? 'Sikertelen bejelentkezés.')
  }

  saveAuth(result)
  return result as AuthResponse
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error ?? 'Sikertelen regisztráció.')
  }

  saveAuth(result)
  return result as AuthResponse
}

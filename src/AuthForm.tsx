import { useState, type FormEvent } from 'react'
import { login, register, type User } from './api'

type AuthFormProps = {
  onAuthenticated: (user: User) => void
}

export default function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result =
        mode === 'login'
          ? await login(email, password)
          : await register(name, email, password)

      onAuthenticated(result.user)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Hiba történt a hitelesítés során.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="booking-form">
      <h2 className="section-title">
        {mode === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
      </h2>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <label>
            Név
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
        )}

        <label>
          E-mail cím
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Jelszó
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? 'Kérlek, várj...'
            : mode === 'login'
              ? 'Bejelentkezés'
              : 'Regisztráció'}
        </button>
      </form>

      <p>
        {mode === 'login'
          ? 'Még nincs fiókod?'
          : 'Már van fiókod?'}
      </p>

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login')
          setError('')
        }}
      >
        {mode === 'login' ? 'Regisztráció' : 'Bejelentkezés'}
      </button>
    </section>
  )
}
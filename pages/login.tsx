// pages/login.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import styles from '@/styles/Login.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export default function Login() {
  const router = useRouter()
  const { registered } = router.query

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (registered === '1') {
      setInfo('Регистрация успешна! Проверьте почту для подтверждения.')
      router.replace('/login', undefined, { shallow: true })
    }
  }, [registered, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')

    try {
      const res = await fetch(`${API_URL}/api/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || JSON.stringify(data))
      }

      // Поддерживаем оба варианта ключей: dj-rest-auth может вернуть access_token или access
      const accessToken  = (data as any).access_token  ?? (data as any).access
      const refreshToken = (data as any).refresh_token ?? (data as any).refresh

      if (!accessToken || !refreshToken) {
        throw new Error('Не удалось получить токены авторизации')
      }

      localStorage.setItem('access', accessToken)
      localStorage.setItem('refresh', refreshToken)

      router.push('/profile')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        {info && (
          <p style={{
            backgroundColor: '#2da44e',
            color: '#fff',
            padding: '0.75rem',
            borderRadius: 4,
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {info}
          </p>
        )}

        <h1 className={styles.title}>Вход</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submit}
            disabled={!username || !password}
          >
            Войти
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Нет аккаунта?{' '}
          <Link
            href="/register"
            style={{ color: 'var(--primary)' }}
          >
            Зарегистрироваться
          </Link>
        </p>
      </main>
    </>
  )
}

// pages/login.tsx
import { useState } from 'react'
import Navbar from '../components/Navbar'
import styles from '@/styles/Login.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) throw new Error('Неверные учетные данные')
      const { access, refresh } = await res.json()
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)
      window.location.href = '/profile'
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
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
          <button type="submit" className={styles.submit}>
            Войти
          </button>
        </form>
      </main>
    </>
  )
}

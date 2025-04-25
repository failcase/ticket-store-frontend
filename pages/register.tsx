// pages/register.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import styles from '@/styles/Login.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password1: '',
    password2: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/registration/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || JSON.stringify(data))
      }
      // Перенаправляем на логин с флагом
      router.push({ pathname: '/login', query: { registered: '1' } })
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Регистрация</h1>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input
              name="username"
              className={styles.input}
              type="text"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              name="email"
              className={styles.input}
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Имя */}
          <div className={styles.field}>
            <label className={styles.label}>Имя</label>
            <input
              name="first_name"
              className={styles.input}
              type="text"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Фамилия */}
          <div className={styles.field}>
            <label className={styles.label}>Фамилия</label>
            <input
              name="last_name"
              className={styles.input}
              type="text"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>

          {/* Пароль */}
          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <input
              name="password1"
              className={styles.input}
              type="password"
              value={form.password1}
              onChange={handleChange}
              required
            />
          </div>

          {/* Повтор пароля */}
          <div className={styles.field}>
            <label className={styles.label}>Повторите пароль</label>
            <input
              name="password2"
              className={styles.input}
              type="password"
              value={form.password2}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
          >
            {loading ? 'Загрузка…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Есть аккаунт?{' '}
          <Link href="/login" style={{ color: 'var(--primary)' }}>
            Войти
          </Link>
        </p>
      </main>
    </>
  )
}

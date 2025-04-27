// pages/login.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Navbar from '@/components/Navbar'
import styles from '@/styles/Login.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export default function Login() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { registered } = router.query

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (registered === '1') {
      setInfo(t('loginRegisterSuccess'))
      router.replace('/login', undefined, { shallow: true })
    }
  }, [registered, router, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setInfo('')

    try {
      const res = await fetch(`${API_URL}/api/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || JSON.stringify(data))

      const access = (data as any).access || (data as any).access_token
      const refresh = (data as any).refresh || (data as any).refresh_token
      if (!access || !refresh) throw new Error(t('loginNoTokens'))

      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)
      router.push('/profile')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        {info && <p className={styles.successMessage}>{info}</p>}

        <h1 className={styles.title}>{t('loginTitle')}</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>{t('loginUsername')}</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('loginPassword')}</label>
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
            {t('loginSubmit')}
          </button>
        </form>

        <p className={styles.footerText}>
          {t('loginNoAccount')}{' '}
          <Link href="/register" className={styles.link}>
            {t('loginRegister')}
          </Link>
        </p>
      </main>
    </>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

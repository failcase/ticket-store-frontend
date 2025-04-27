// pages/confirm-email.tsx

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Navbar from '@/components/Navbar'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export default function ConfirmEmail() {
  const { t } = useTranslation('common')
  const { query, isReady } = useRouter()
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isReady) return
    const key = Array.isArray(query.key) ? query.key[0] : query.key
    if (!key) {
      setStatus('error')
      setMessage(t('confirmEmailKeyNotFound'))
      return
    }
    fetch(`${API_URL}/api/auth/registration/verify-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
      .then(async res => {
        if (res.ok) {
          setStatus('success')
          setMessage(t('confirmEmailSuccess'))
        } else {
          const data = await res.json().catch(() => ({}))
          setStatus('error')
          setMessage(data.detail || t('confirmEmailError'))
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage(t('confirmEmailNetworkError'))
      })
  }, [isReady, query.key, t])

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
        {status === 'loading' && <p>{t('confirmEmailLoading')}</p>}

        {status === 'success' && (
          <>
            <div className="successMessage">{message}</div>
            <Link href="/login" className="editButton">
              {t('confirmEmailLogin')}
            </Link>
          </>
        )}

        {status === 'error' && (
          <div className="error">{message}</div>
        )}
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

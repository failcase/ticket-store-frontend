// components/Navbar.tsx

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'next-i18next'
import styles from './Navbar.module.css'
import { LanguageSwitcher } from './LanguageSwitcher'
import { authFetch } from '@/utils/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export default function Navbar() {
  const { t } = useTranslation('common')
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [me, setMe] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string>('/default-avatar.svg')
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access')
    if (!token) return
    try {
      const { username } = JSON.parse(atob(token.split('.')[1]))
      setMe(username)
      authFetch(`${API_URL}/api/users/${username}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(u => u.avatar && setAvatar(u.avatar))
        .catch(() => {})
    } catch {}
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const logout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  const ThemeButton = () => {
    if (!mounted) return <button className={styles.themeToggle} aria-label={t('switchTheme')} />
    return (
      <button
        className={styles.themeToggle}
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label={t('switchTheme')}
      >
        {resolvedTheme === 'light' ? '🌙' : '☀️'}
      </button>
    )
  }

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        {t('brand')}
      </Link>

      <div className={styles.links}>
        <LanguageSwitcher />

        {!me ? (
          <>
            <Link href="/login" className={styles.link}>
              {t('loginTitle')}
            </Link>
            <Link href="/register" className={styles.link}>
              {t('registerTitle')}
            </Link>
          </>
        ) : (
          <div className={styles.profileMenu} ref={menuRef}>
            <img
              src={avatar}
              alt={t('avatarAlt')}
              className={styles.avatar}
              onClick={() => setOpen(o => !o)}
            />
            {open && (
              <div className={styles.dropdown}>
                <Link href={`/profile/${me}`} className={styles.dropdownItem}>
                  {t('profile')}
                </Link>
                <button onClick={logout} className={styles.dropdownItem}>
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        )}

        <ThemeButton />
      </div>
    </nav>
  )
}

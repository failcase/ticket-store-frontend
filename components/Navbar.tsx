import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { authFetch } from '@/utils/auth'
import styles from './Navbar.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL!
const DEFAULT_AVATAR = '/default-avatar.svg'

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [me, setMe] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR)
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('access')
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setMe(payload.username)
      if (payload.avatar) setAvatar(payload.avatar)
    }
  }, [])

  // подтягиваем first & last name из API
  useEffect(() => {
    if (!me) return
    authFetch(`${API_URL}/api/users/${me}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => {
        setFirstName(u.first_name)
        setLastName(u.last_name)
      })
      .catch(() => {})
  }, [me])

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
    if (!mounted) return <button className={styles.themeToggle} aria-label="Переключить тему" />
    return (
      <button
        className={styles.themeToggle}
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label="Переключить тему"
      >
        {resolvedTheme === 'dark' ? '☀️' : '🌙'}
      </button>
    )
  }

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        FailCase Tickets
      </Link>

      <div className={styles.links}>
        {!me ? (
          <Link href="/login" className={styles.link}>Вход</Link>
        ) : (
          <div className={styles.profileMenu} ref={menuRef}>
            <div className={styles.trigger} onClick={() => setOpen(o => !o)}>
              <img
                src={avatar}
                alt="Аватар"
                className={styles.avatar}
                onError={e => (e.currentTarget.src = DEFAULT_AVATAR)}
              />
              <span className={styles.name}>{firstName || me}</span>
            </div>
            {open && (
              <div className={styles.dropdown}>
                {/* header */}
                <div className={styles.dropdownHeader}>
                  <strong className={styles.fullName}>{firstName} {lastName}</strong>
                  <span className={styles.userTag}>@{me}</span>
                </div>
                <div className={styles.divider} />
                <Link href={`/profile/${me}`} className={styles.item}>
                  Профиль
                </Link>
                <div className={styles.divider} />
                <button onClick={logout} className={styles.item}>
                  Выйти
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

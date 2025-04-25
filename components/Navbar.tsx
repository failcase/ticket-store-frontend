import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [me, setMe] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string>('/default-avatar.svg')
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Для корректного переключения темы:
  useEffect(() => setMounted(true), [])

  // Подтягиваем имя пользователя и его аватар из access-токена
  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access')
    if (token) {
      const { username, avatar: av } = JSON.parse(atob(token.split('.')[1]))
      setMe(username)
      if (av) setAvatar(av)
    }
  }, [])

  // Закрываем дропдаун кликом вне
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
    if (!mounted) {
      return <button className={styles.themeToggle} aria-label="Переключить тему" />
    }
    return (
      <button
        className={styles.themeToggle}
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label="Переключить тему"
      >
        {resolvedTheme === 'light' ? '🌙' : '☀️'}
      </button>
    )
  }

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>FailCase Tickets</Link>
      <div className={styles.links}>
        {!me && <Link href="/login" className={styles.link}>Вход</Link>}
        {!me && <Link href="/register" className={styles.link}>Регистрация</Link>}
        {me && (
          <div className={styles.profileMenu} ref={menuRef}>
            <img
              src={avatar}
              alt="Аватар"
              className={styles.avatar}
              onClick={() => setOpen(o => !o)}
            />
            {open && (
              <div className={styles.dropdown}>
                <Link href={`/profile/${me}`}>Профиль</Link>
                <button onClick={logout}>Выйти</button>
              </div>
            )}
          </div>
        )}
        <ThemeButton />
      </div>
    </nav>
  )
}

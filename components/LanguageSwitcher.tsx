// components/LanguageSwitcher.tsx

import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import navStyles from './Navbar.module.css'
import styles from './LanguageSwitcher.module.css'

export function LanguageSwitcher() {
  const { locale, locales, asPath } = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // закрыть по клику вне
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const changeLang = (lng: string) => {
    setOpen(false)
    const prefix = lng === locales?.[0] ? '' : `/${lng}`
    window.location.href = prefix + asPath
  }

  // текущий флаг
  const flag = locale === 'ru' ? '🇷🇺' : '🇬🇧'

  return (
    <div className={navStyles.profileMenu} ref={menuRef}>
      {/* просто флаг без кругляша */}
      <button
        className={styles.flagBtn}
        onClick={() => setOpen(o => !o)}
        aria-label="Выбор языка"
      >
        {flag}
      </button>

      {open && (
        <div className={navStyles.dropdown}>
          {locales?.map(lng => (
            <button
              key={lng}
              className={navStyles.dropdownItem}
              onClick={() => changeLang(lng)}
            >
              {lng === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

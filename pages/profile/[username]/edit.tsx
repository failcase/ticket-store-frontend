import { useRouter } from 'next/router'
import { useEffect, useState, FormEvent } from 'react'
import Navbar from '@/components/Navbar'
import { authFetch } from '@/utils/auth'
import styles from '@/styles/Profile.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL!
const DEFAULT_AVATAR = '/default-avatar.svg'

interface UserProfile {
  username: string
  email: string
  first_name: string
  last_name?: string
  avatar?: string
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { username } = router.query as { username: string }

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)

  // поля основной информации
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  // смена пароля
  const [newPwd1, setNewPwd1] = useState('')
  const [newPwd2, setNewPwd2] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  // смена email
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // узнаём себя
  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access')
    if (token) {
      try {
        const { username: u } = JSON.parse(atob(token.split('.')[1]))
        setMe(u)
      } catch (err) {
        console.error('Ошибка парсинга токена', err)
      }
    }
  }, [])

  // загружаем профиль
  useEffect(() => {
    if (!username) return
    authFetch(`${API_URL}/api/users/${username}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: UserProfile) => {
        setUser(data)
        setFirstName(data.first_name)
        setLastName(data.last_name)
        setNewEmail(data.email)
      })
      .catch(err => {
        console.error(err)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [username])

  if (loading || me !== username) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          {loading ? 'Загрузка...' : 'Доступ запрещён'}
        </main>
      </>
    )
  }

  const handleAvatarChange = async (file: File) => {
    if (!file) return
    setAvatarError('')
    setAvatarLoading(true)

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await authFetch(`${API_URL}/api/users/${username}`, {
        method: 'PUT',
        body: formData,
      })
      if (!res.ok) {
        throw new Error('Не удалось обновить аватар')
      }
      const updated = await res.json()
      setUser(updated)
    } catch (err) {
      console.error(err)
      setAvatarError('Ошибка загрузки аватара')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      handleAvatarChange(file)
    }
  }

  // Сохранить основную информацию
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const res = await authFetch(`${API_URL}/api/users/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName })
      })
      if (!res.ok) throw new Error('Не удалось сохранить')
      const updated = await res.json()
      setUser(updated)
    } catch (err) {
      console.error(err)
    }
  }

  // Сменить пароль
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')
    setPwdLoading(true)
    try {
      const res = await authFetch(`${API_URL}/api/auth/password/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password1: newPwd1, new_password2: newPwd2 })
      })
      if (res.ok) {
        setPwdSuccess('Пароль изменён')
        setNewPwd1('')
        setNewPwd2('')
      } else {
        const data = await res.json().catch(() => ({}))
        setPwdError(data.detail || 'Ошибка')
      }
    } catch (err) {
      console.error(err)
      setPwdError('Сетевая ошибка')
    } finally {
      setPwdLoading(false)
    }
  }

  // Сменить email
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailSuccess('')
    setEmailLoading(true)
    try {
      const res = await authFetch(`${API_URL}/api/auth/email/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_email: newEmail })
      })
      if (res.ok) {
        setEmailSuccess('Письмо с подтверждением отправлено')
      } else {
        const data = await res.json().catch(() => ({}))
        setEmailError(data.detail || 'Ошибка')
      }
    } catch (err) {
      console.error(err)
      setEmailError('Сетевая ошибка')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.leftColumn}>
          <div className={styles.avatarBox}>
            <label htmlFor="avatar-upload" className={styles.avatarUploadLabel}>
              <img
                src={user?.avatar || DEFAULT_AVATAR}
                alt="Аватар"
                onError={e => {
                  const img = e.currentTarget
                  if (img.src !== DEFAULT_AVATAR) {
                    img.src = DEFAULT_AVATAR
                  }
                }}
              />
              <div className={styles.avatarOverlay}>
                <img
                  src="/pencil.svg"
                  alt="Изменить аватар"
                  className={styles.avatarOverlayIcon}
                />
              </div>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarSelect}
            />
          </div>
          <div className={styles.infoBox}>
            <div className={styles.fullName}>
              {user && `${user.first_name} ${user.last_name || ''}`}
            </div>
            <div className={styles.usernameText}>
              {user && `@${user.username}`}
            </div>
            <div className={styles.emailRow}>
              {user && (
                <>
                  <span className={styles.emailIcon}>📧</span>
                  {user.email}
                </>
              )}
            </div>
            <button
              className={styles.backButton}
              onClick={() => router.back()}
            >
              Назад
            </button>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Основная информация */}
          <form className={styles.profileForm} onSubmit={handleProfileSubmit}>
            <h2>Основная информация</h2>
            <div className={styles.field}>
              <label>Имя<span className={styles.required}>*</span></label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Фамилия</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
            <button type="submit">Сохранить</button>
          </form>

          {/* Смена пароля */}
          <form className={styles.passwordBox} onSubmit={handlePasswordSubmit}>
            <h2>Сменить пароль</h2>
            <div className={styles.passwordRow}>
              <div className={styles.field}>
                <label>Новый пароль<span className={styles.required}>*</span></label>
                <input
                  type="password"
                  value={newPwd1}
                  onChange={e => setNewPwd1(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Повтор пароля<span className={styles.required}>*</span></label>
                <input
                  type="password"
                  value={newPwd2}
                  onChange={e => setNewPwd2(e.target.value)}
                  required
                />
              </div>
            </div>
            {pwdError && <p className={styles.error}>{pwdError}</p>}
            {pwdSuccess && <p className={styles.successMessage}>{pwdSuccess}</p>}
            <button type="submit" disabled={pwdLoading}>
              {pwdLoading ? 'Загрузка…' : 'Изменить пароль'}
            </button>
          </form>

          {/* Смена почты */}
          <form className={styles.emailBox} onSubmit={handleEmailSubmit}>
            <h2>Сменить почту</h2>
            <div className={styles.field}>
              <label>Новый Email<span className={styles.required}>*</span></label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
              />
            </div>
            {emailError && <p className={styles.error}>{emailError}</p>}
            {emailSuccess && <p className={styles.successMessage}>{emailSuccess}</p>}
            <button type="submit" disabled={emailLoading}>
              {emailLoading ? 'Загрузка…' : 'Сохранить'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}

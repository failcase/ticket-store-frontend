// pages/profile/[username].tsx
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
  last_name: string
  bio: string
  avatar?: string
  location?: string
  joined?: string
}

export default function ProfilePage() {
  const { username } = useRouter().query as { username: string }
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)

  // формы редактирования
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')

  // смена пароля (без запроса старого)
  const [newPwd1, setNewPwd1] = useState('')
  const [newPwd2, setNewPwd2] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    // узнаём себя из токена
    const token = typeof window !== 'undefined' && localStorage.getItem('access')
    if (token) {
      const { username: me } = JSON.parse(atob(token.split('.')[1]))
      setMe(me)
    }
  }, [])

  useEffect(() => {
    if (!username) return
    authFetch(`${API_URL}/api/users/${username}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: UserProfile) => {
        setUser(data)
        setFirstName(data.first_name)
        setLastName(data.last_name)
        setEmail(data.email)
        setBio(data.bio)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [username])

  const isOwner = me === username

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      const res = await authFetch(`${API_URL}/api/users/${username}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, bio })
      })
      if (!res.ok) throw new Error('Не удалось сохранить профиль')
      setUser(await res.json())
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')
    setPwdLoading(true)
    try {
      const res = await authFetch(`${API_URL}/api/auth/password/change`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ new_password1: newPwd1, new_password2: newPwd2 })
      })
      if (res.ok) {
        setPwdSuccess('Пароль успешно изменён')
        setNewPwd1(''); setNewPwd2('')
      } else {
        const data = await res.json().catch(() => ({}))
        setPwdError(
          data.new_password2?.join(' ') ||
          data.new_password1?.join(' ') ||
          data.detail ||
          'Ошибка при смене пароля'
        )
      }
    } catch {
      setPwdError('Сетевая ошибка, попробуйте позже')
    } finally {
      setPwdLoading(false)
    }
  }

  if (loading) {
    return <>
      <Navbar />
      <main style={{ padding:'2rem', textAlign:'center' }}>Загрузка...</main>
    </>
  }
  if (!user) {
    return <>
      <Navbar />
      <main style={{ padding:'2rem', textAlign:'center' }}>Профиль не найден</main>
    </>
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        {/* левая колонка */}
        <div className={styles.leftColumn}>
          <div className={styles.avatarBox}>
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt="Аватар"
              onError={e => e.currentTarget.src = DEFAULT_AVATAR}
            />
            {isOwner && <button>Загрузить фото</button>}
          </div>

          {isOwner ? (
            <form className={styles.passwordBox} onSubmit={handlePasswordSubmit}>
              <h2>Сменить пароль</h2>
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
                <label>Повтор нового пароля<span className={styles.required}>*</span></label>
                <input
                  type="password"
                  value={newPwd2}
                  onChange={e => setNewPwd2(e.target.value)}
                  required
                />
              </div>
              {pwdError && <p className={styles.error}>{pwdError}</p>}
              {pwdSuccess && <p className={styles.successMessage}>{pwdSuccess}</p>}
              <button type="submit" disabled={pwdLoading}>
                {pwdLoading ? 'Загрузка…' : 'Изменить пароль'}
              </button>
            </form>
          ) : (
            <div className={styles.infoBox}>
              <h2>Информация о пользователе</h2>
              <div className={styles.field}>
                <label>Username</label>
                <input type="text" value={user.username} disabled />
              </div>
              <div className={styles.field}>
                <label>Имя</label>
                <input type="text" value={user.first_name || 'не указано'} disabled />
              </div>
              <div className={styles.field}>
                <label>Фамилия</label>
                <input type="text" value={user.last_name || 'не указано'} disabled />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input type="text" value={user.email || 'не указано'} disabled />
              </div>
              <div className={styles.field}>
                <label>О себе</label>
                <input type="text" value={user.bio || 'не указано'} disabled />
              </div>
              <div className={styles.field}>
                <label>Город</label>
                <input type="text" value={user.location || 'не указано'} disabled />
              </div>
              <div className={styles.field}>
                <label>На платформе с</label>
                <input type="text" value={user.joined || 'не указано'} disabled />
              </div>
            </div>
          )}
        </div>

        {/* правая колонка */}
        {isOwner && (
          <div className={styles.rightColumn}>
            <form className={styles.profileForm} onSubmit={handleProfileSubmit}>
              <h2>Редактировать профиль</h2>
              <div className={styles.field}>
                <label>Username</label>
                <input type="text" value={user.username} disabled title="Смена username пока не реализована" />
              </div>
              <div className={styles.field}>
                <label>Имя</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Фамилия</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>О себе</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} />
              </div>
              <button type="submit">Сохранить</button>
            </form>
          </div>
        )}
      </main>
    </>
  )
}

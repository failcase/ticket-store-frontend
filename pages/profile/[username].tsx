import { useRouter } from 'next/router'
import { useEffect, useState, FormEvent } from 'react'
import Navbar from '../../components/Navbar'
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
}

export default function ProfilePage() {
  const { username } = useRouter().query as { username: string }
  const [user, setUser]       = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [me, setMe]           = useState<string | null>(null)

  // Поля формы
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')

  // Успех сохранения
  const [success, setSuccess]     = useState(false)

  // Определяем, это мой профиль?
  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      const { username } = JSON.parse(atob(token.split('.')[1]))
      setMe(username)
    }
  }, [])

  // Загружаем профиль
  useEffect(() => {
    if (!username) return
    authFetch(`${API_URL}/api/users/${username}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: UserProfile) => {
        setUser({ ...data, avatar: data.avatar || DEFAULT_AVATAR })
        setFirstName(data.first_name)
        setLastName(data.last_name)
        setEmail(data.email)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [username])

  const isOwner = me === username

  // Сохраняем данные
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSuccess(false)

    try {
      const res = await authFetch(
        `${API_URL}/api/users/${username}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: firstName,
            last_name:  lastName,
            email:      email
          }),
        }
      )
      if (!res.ok) throw new Error('Ошибка при сохранении')
      const updated = await res.json()
      // Сохраняем avatar из старого состояния, если сервер его не прислал
      setUser(prev => prev
        ? { ...updated, avatar: prev.avatar }
        : { ...updated, avatar: DEFAULT_AVATAR }
      )
      setSuccess(true)
    } catch (err: any) {
      alert(err.message || 'Не удалось сохранить')
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <main style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</main>
    </>
  )
  if (!user)  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem', textAlign: 'center' }}>Профиль не найден</main>
    </>
  )

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        {/* Левая колонка */}
        <div className={styles.leftColumn}>
          <div className={styles.avatarBox}>
            <img
              src={user.avatar!}
              alt="Аватар"
              onError={e => (e.currentTarget.src = DEFAULT_AVATAR)}
            />
            {isOwner && <button>Загрузить фото</button>}
          </div>

          {isOwner ? (
            <div className={styles.passwordBox}>
              <h2>Сброс пароля</h2>
              <div className={styles.field}>
                <label>Старый пароль</label>
                <input type="password" />
              </div>
              <div className={styles.field}>
                <label>Новый пароль</label>
                <input type="password" />
              </div>
              <button>Изменить пароль</button>
            </div>
          ) : (
            <div className={styles.aboutBox}>
              <h2>О себе</h2>
              <p>{user.bio || 'Пользователь пока не рассказал о себе.'}</p>
            </div>
          )}
        </div>

        {/* Правая колонка — форма редактирования */}
        {isOwner && (
          <div className={styles.rightColumn}>
            <form className={styles.profileForm} onSubmit={handleSubmit}>
              <h2>Редактировать профиль</h2>
              {success && (
                <div className={styles.successMessage}>
                  Изменения успешно сохранены!
                </div>
              )}

              <div className={styles.field}>
                <label>Username</label>
                <input
                  type="text"
                  value={user.username}
                  readOnly
                  title="Смена username пока не реализована"
                />
              </div>

              <div className={styles.field}>
                <label>Имя</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
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

              <div className={styles.field}>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <button type="submit">Сохранить</button>
            </form>
          </div>
        )}
      </main>
    </>
  )
}

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { authFetch } from '@/utils/auth'
import styles from '@/styles/Profile.module.css'

const DEFAULT_AVATAR = '/default-avatar.svg'  // Положите в public эту SVG-иконку

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
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)

  // Узнаём себя
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
    authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`)
      .then(res => res.ok ? res.json() : Promise.reject('not found'))
      .then(data => {
        setUser({
          ...data,
          avatar: data.avatar || DEFAULT_AVATAR,
        })
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</main>
      </>
    )
  }
  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>Профиль не найден</main>
      </>
    )
  }

  const isOwner = me === username

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        {/* левая колонка */}
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
              <input type="password" placeholder="Старый пароль" />
              <input type="password" placeholder="Новый пароль" />
              <button>Изменить пароль</button>
            </div>
          ) : (
            <div className={styles.aboutBox}>
              <h2>О себе</h2>
              <p>{user.bio || 'Пользователь пока не рассказал о себе.'}</p>
            </div>
          )}
        </div>

        {/* правая колонка */}
        <div className={styles.rightColumn}>
          {isOwner && (
            <div className={styles.profileForm}>
              <h2>Редактировать профиль</h2>
              <div className={styles.field}>
                <label>Username</label>
                <input type="text" defaultValue={user.username} readOnly />
              </div>
              <div className={styles.field}>
                <label>Имя</label>
                <input type="text" defaultValue={user.first_name} />
              </div>
              <div className={styles.field}>
                <label>Фамилия</label>
                <input type="text" defaultValue={user.last_name} />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" defaultValue={user.email} />
              </div>
              <div className={styles.field}>
                <label>О себе</label>
                <input type="text" defaultValue={user.bio} />
              </div>
              <button>Сохранить</button>
            </div>
          )}
          {/* Для чужого профиля можно оставить это место под любую информацию */}
        </div>
      </main>
    </>
  )
}

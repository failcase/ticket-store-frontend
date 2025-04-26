import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { authFetch } from '@/utils/auth'
import styles from '@/styles/Profile.module.css'

const DEFAULT_AVATAR = '/default-avatar.svg'

interface UserProfile {
  username: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
}

export default function ProfileViewPage() {
  const router = useRouter()
  const { username } = router.query as { username: string }
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)

  // узнаём себя
  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access')
    if (token) {
      const { username: u } = JSON.parse(atob(token.split('.')[1]))
      setMe(u)
    }
  }, [])

  // загружаем профиль
  useEffect(() => {
    if (!username) return
    authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: UserProfile) => {
        setUser(data)
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
        <div className={styles.leftColumn}>
          <div className={styles.avatarBox} onClick={() => isOwner && router.push(`/profile/${username}/edit`)}>
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt="Аватар"
              onError={e => { e.currentTarget.src = DEFAULT_AVATAR }}
            />
          </div>
          <div className={styles.infoBox}>
            <div className={styles.fullName}>
              {user.first_name} {user.last_name}
            </div>
            <div className={styles.usernameText}>@{user.username}</div>
            <div className={styles.emailRow}>
              <span className={styles.emailIcon}>📧</span>
              {user.email}
            </div>
            {isOwner && (
              <button
                className={styles.editButton}
                onClick={() => router.push(`/profile/${username}/edit`)}
              >
                Редактировать профиль
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

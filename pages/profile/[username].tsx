import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { authFetch } from '@/utils/auth'
import styles from '@/styles/Profile.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL!
const DEFAULT_AVATAR = '/default-avatar.svg'
const DEFAULT_ORG_LOGO = '/default-logo.svg'  // <-- теперь именно он

interface UserProfile {
  username: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
}

interface Organization {
  id: number
  slug: string
  name: string
  logo?: string
  owner: string
}

export default function ProfileViewPage() {
  const router = useRouter()
  const { username } = router.query as { username: string }

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])

  // узнаём себя
  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access')
    if (token) {
      try {
        const { username: u } = JSON.parse(atob(token.split('.')[1]))
        setMe(u)
      } catch {}
    }
  }, [])

  // загружаем профиль
  useEffect(() => {
    if (!username) return
    setLoading(true)
    authFetch(`${API_URL}/api/users/${username}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: UserProfile) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [username])

  // подгружаем организации
  useEffect(() => {
    if (!username) return
    fetch(`${API_URL}/api/org?owner=${username}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: Organization[]) => setOrganizations(data))
      .catch(() => setOrganizations([]))
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
        {/* Левая колонка: аватар и инфо */}
        <div className={styles.leftColumn}>
          <div
            className={styles.avatarBox}
            onClick={() => isOwner && router.push(`/profile/${username}/edit`)}
          >
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

        {/* Правая колонка: кликабельные организации */}
        <div className={styles.rightColumn}>
          <div className={styles.organizationsBlock}>
            <h2>Организации</h2>

            {organizations.length === 0 ? (
              <p style={{ color: 'var(--fg-secondary)', fontStyle: 'italic' }}>
                Нет организаций
              </p>
            ) : (
              <div className={styles.organizationsList}>
                {organizations.map(org => (
                  <Link
                    key={org.id}
                    href={`/org/${org.slug}`}
                    className={styles.organizationItem}
                  >
                    <img
                      src={org.logo || DEFAULT_ORG_LOGO}
                      alt={org.name}
                      className={styles.orgLogo}
                      onError={e => { e.currentTarget.src = DEFAULT_ORG_LOGO }}
                    />
                    <span className={styles.organizationName}>
                      {org.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {isOwner && (
              <button
                className={styles.createButton}
                onClick={() => router.push('/org/create')}
              >
                Создать организацию
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

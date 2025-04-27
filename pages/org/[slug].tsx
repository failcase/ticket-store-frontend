import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import orgStyles from '@/styles/Organization.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL!
const DEFAULT_LOGO = '/default-logo.svg'  // <-- заменили здесь тоже

interface OrgData {
  name: string
  slug: string
  description: string
  logo?: string
  owner: string
}

export default function OrgViewPage() {
  const router = useRouter()
  const { slug } = router.query as { slug: string }

  const [org, setOrg] = useState<OrgData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`${API_URL}/api/org/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Организация не найдена')
        return res.json()
      })
      .then((data: OrgData) => setOrg(data))
      .catch(() => setOrg(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          Загрузка организации...
        </main>
      </>
    )
  }

  if (!org) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          Организация не найдена
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className={orgStyles.container}>
        {/* Левая колонка */}
        <div className={orgStyles.leftColumn}>
          <div className={orgStyles.avatarBox}>
            <img
              src={org.logo || DEFAULT_LOGO}
              alt="Логотип организации"
              onError={e => { e.currentTarget.src = DEFAULT_LOGO }}
            />
          </div>
          <div className={orgStyles.infoBox}>
            <div className={orgStyles.fullName}>{org.name}</div>
            <div className={orgStyles.slugText}>@{org.slug}</div>
            <p className={orgStyles.description}>{org.description}</p>
            <div className={orgStyles.ownerRow}>
              Владелец:
              <Link
                href={`/profile/${org.owner}`}
                className={orgStyles.ownerLink}
              >
                @{org.owner}
              </Link>
            </div>
          </div>
        </div>

        {/* Правая колонка */}
        <div className={orgStyles.rightColumn}>
          {/* TODO: здесь будут участники, события и т.д. */}
        </div>
      </main>
    </>
  )
}

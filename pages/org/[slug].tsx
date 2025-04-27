// pages/org/[slug].tsx

import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Navbar from '@/components/Navbar'
import profileStyles from '@/styles/Profile.module.css'
import orgStyles from '@/styles/Organization.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL!
const DEFAULT_LOGO = '/default-logo.svg'

interface OrgData {
  name: string
  slug: string
  description: string
  logo?: string
  owner: string
}

export default function OrgViewPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { slug } = router.query as { slug: string }

  const [org, setOrg] = useState<OrgData | null>(null)
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('access')
    if (!token) return
    try {
      const { username } = JSON.parse(atob(token.split('.')[1]))
      setMe(username as string)
    } catch {}
  }, [])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`${API_URL}/api/org/${slug}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: OrgData) => setOrg(data))
      .catch(() => setOrg(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          {t('loading')}
        </main>
      </>
    )
  }

  if (!org) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          {t('orgNotFound')}
        </main>
      </>
    )
  }

  const isOwner = me === org.owner

  return (
    <>
      <Navbar />
      <main className={orgStyles.container}>
        <div className={orgStyles.leftColumn}>
          <div className={orgStyles.avatarBox}>
            <img
              src={org.logo || DEFAULT_LOGO}
              alt={t('orgLogoAlt')}
              onError={e => { e.currentTarget.src = DEFAULT_LOGO }}
            />
          </div>
          <div className={orgStyles.infoBox}>
            <div className={orgStyles.fullName}>{org.name}</div>
            <div className={orgStyles.slugText}>@{org.slug}</div>
            <div className={orgStyles.ownerRow}>
              {t('owner')}:&nbsp;
              <Link href={`/profile/${org.owner}`} className={orgStyles.ownerLink}>
                @{org.owner}
              </Link>
            </div>
            <p className={orgStyles.description}>{org.description}</p>
            {isOwner && (
              <button
                className={profileStyles.editButton}
                onClick={() => router.push(`/org/${org.slug}/edit`)}
              >
                {t('editOrganization')}
              </button>
            )}
          </div>
        </div>
        <div className={orgStyles.rightColumn}>
          {/* TODO: участники, события и т.д. */}
        </div>
      </main>
    </>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

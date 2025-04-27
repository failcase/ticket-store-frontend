// pages/org/[slug].tsx

import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Navbar from '@/components/Navbar'
import profileStyles from '@/styles/Profile.module.css'
import orgStyles from '@/styles/Organization.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL!
const DEFAULT_LOGO = '/default-logo.svg'
const CONFIRM_SECONDS = 5

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

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [confirmSeconds, setConfirmSeconds] = useState<number>(CONFIRM_SECONDS)
  const [deleteDisabled, setDeleteDisabled] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // достаём имя текущего пользователя из токена
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

  // Запускаем таймер обратного отсчёта при подтверждении удаления
  useEffect(() => {
    if (confirmingDelete && deleteDisabled) {
      timerRef.current = setInterval(() => {
        setConfirmSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setDeleteDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current!)
  }, [confirmingDelete, deleteDisabled])

  const handleDeleteClick = () => {
    if (!confirmingDelete) {
      // первый клик – переходим в режим подтверждения
      setConfirmingDelete(true)
      setConfirmSeconds(CONFIRM_SECONDS)
      setDeleteDisabled(true)
    } else {
      // второй клик после отсчёта – отправляем DELETE
      fetch(`${API_URL}/api/org/${slug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      })
        .then(res => {
          if (res.ok) router.push('/profile')
          else {
            // TODO: показывать ошибку удаления
          }
        })
        .catch(() => {
          // TODO: показывать сетевую ошибку
        })
    }
  }

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
              <>
                <button
                  className={profileStyles.editButton}
                  onClick={() => router.push(`/org/${org.slug}/edit`)}
                >
                  {t('editOrganization')}
                </button>

                <button
                  className={orgStyles.deleteButton}
                  onClick={handleDeleteClick}
                  disabled={deleteDisabled}
                >
                  {confirmingDelete
                    ? confirmSeconds > 0
                      ? `${t('confirmDeleteOrganization')} ${confirmSeconds}...`
                      : t('confirmDeleteOrganization')
                    : t('deleteOrganization')}
                </button>
              </>
            )}
          </div>
        </div>
        <div className={orgStyles.rightColumn}>
          {/* Здесь может быть список событий, участников и т.д. */}
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

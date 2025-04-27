// pages/org/[slug]/edit.tsx

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Navbar from '@/components/Navbar'
import profileStyles from '@/styles/Profile.module.css'
import orgStyles from '@/styles/Organization.module.css'
import { authFetch } from '@/utils/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL!
const DEFAULT_LOGO = '/default-logo.svg'

interface OrgData {
  name: string
  slug: string
  description?: string
  logo?: string
}

export default function OrgEditPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { slug } = router.query as { slug: string }

  const [org, setOrg] = useState<OrgData | null>(null)
  const [name, setName] = useState('')
  const [slugInput, setSlugInput] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`${API_URL}/api/org/${slug}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: OrgData) => {
        setOrg(data)
        setName(data.name)
        setSlugInput(data.slug)
        setDescription(data.description || '')
        setLogoPreview(data.logo || null)
      })
      .catch(() => {})
  }, [slug])

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^[A-Za-z0-9.\-]+$/.test(slugInput)) {
      setError(t('orgEditSlugHelp'))
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('slug', slugInput)
      formData.append('description', description)
      if (logoFile) formData.append('logo', logoFile)

      const res = await authFetch(`${API_URL}/api/org/${slug}`, {
        method: 'PUT',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || t('orgEditError'))
      }
      const updated = await res.json()
      router.push(`/org/${updated.slug}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!org) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          {t('loading')}
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className={orgStyles.container}>
        <div className={orgStyles.leftColumn}>
          <div className={orgStyles.avatarBox}>
            <img
              src={logoPreview! || DEFAULT_LOGO}
              alt={t('orgLogoAlt')}
              onError={e => { e.currentTarget.src = DEFAULT_LOGO }}
            />
          </div>
          <div className={orgStyles.infoBox}>
            <div className={orgStyles.fullName}>{org.name}</div>
            <div className={orgStyles.slugText}>@{org.slug}</div>
            <button
              className={profileStyles.backButton}
              onClick={() => router.back()}
            >
              {t('back')}
            </button>
          </div>
        </div>
        <div className={orgStyles.rightColumn}>
          <form onSubmit={handleSubmit} className={profileStyles.profileForm}>
            <h2>{t('orgEditTitle')}</h2>
            {error && <p className={profileStyles.error}>{error}</p>}
            <div className={profileStyles.field}>
              <label>
                {t('orgEditName')}<span className={profileStyles.required}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className={profileStyles.field}>
              <label>
                {t('orgEditSlug')}<span className={profileStyles.required}>*</span><br/>
                <small>{t('orgEditSlugHelp')}</small>
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={e => setSlugInput(e.target.value)}
                required
                pattern="[A-Za-z0-9.\-]+"
                title={t('orgEditSlugHelp')}
              />
            </div>
            <div className={profileStyles.field}>
              <label>{t('orgEditDescription')}</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={6}
              />
            </div>
            <div className={profileStyles.field}>
              <label>{t('orgEditLogo')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </div>
            <button
              type="submit"
              className={profileStyles.editButton}
              disabled={loading}
            >
              {loading ? t('orgEditLoading') : t('orgEditSubmit')}
            </button>
          </form>
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

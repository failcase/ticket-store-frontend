// pages/org/create.tsx

import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Navbar from '@/components/Navbar'
import profileStyles from '@/styles/Profile.module.css'
import orgStyles from '@/styles/Organization.module.css'
import { authFetch } from '@/utils/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL!
const DEFAULT_LOGO = '/default-logo.svg'

export default function OrgCreatePage() {
  const { t } = useTranslation('common')
  const router = useRouter()

  const [name, setName] = useState('')
  const [slugInput, setSlugInput] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^[A-Za-z0-9.\-]+$/.test(slugInput)) {
      setError(t('orgCreateSlugHelp'))
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('slug', slugInput)
      formData.append('description', description)
      if (logoFile) formData.append('logo', logoFile)
      const res = await authFetch(`${API_URL}/api/org`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || t('orgCreateError'))
      }
      const created = await res.json()
      router.push(`/org/${created.slug}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className={orgStyles.container}>
        <div className={orgStyles.leftColumn}>
          {/* Clickable logo upload */}
          <label
            htmlFor="logo-upload"
            className={`${orgStyles.avatarBox} ${profileStyles.avatarBox}`}
          >
            <img
              src={logoPreview || DEFAULT_LOGO}
              alt={t('logoPreview')}
              onError={e => { e.currentTarget.src = DEFAULT_LOGO }}
            />
            <div className={profileStyles.avatarOverlay}>
              <img
                src="/pencil.svg"
                alt={t('orgCreateLogo')}
                className={profileStyles.avatarOverlayIcon}
              />
            </div>
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleLogoChange}
          />

          <div className={orgStyles.infoBox}>
            <div className={orgStyles.fullName}>
              {t('orgCreateNameTitle')}
            </div>
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
            <h2>{t('orgCreateTitle')}</h2>
            {error && <p className={profileStyles.error}>{error}</p>}

            <div className={profileStyles.field}>
              <label>
                {t('orgCreateName')}<span className={profileStyles.required}>*</span>
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
                {t('orgCreateSlug')}<span className={profileStyles.required}>*</span><br/>
                <small>{t('orgCreateSlugHelp')}</small>
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={e => setSlugInput(e.target.value)}
                required
                pattern="[A-Za-z0-9.\-]+"
                title={t('orgCreateSlugHelp')}
              />
            </div>

            <div className={profileStyles.field}>
              <label>{t('orgCreateDescription')}</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={6}
              />
            </div>

            <button
              type="submit"
              className={profileStyles.editButton}
              disabled={loading}
            >
              {loading ? t('orgCreateLoading') : t('orgCreateSubmit')}
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

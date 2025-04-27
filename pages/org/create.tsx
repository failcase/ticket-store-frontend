// pages/org/create.tsx

import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import profileStyles from '@/styles/Profile.module.css'
import orgStyles from '@/styles/Organization.module.css'
import { authFetch } from '@/utils/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL!
// здесь — правильный путь к дефолтному лого
const DEFAULT_LOGO = '/default-logo.svg'

export default function OrgCreatePage() {
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

    // Простая валидация slug
    if (!/^[A-Za-z0-9.\-]+$/.test(slugInput)) {
      setError('Slug может содержать только латинские буквы, цифры, точки и дефис')
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
        const data = await res.json()
        throw new Error(data.detail || 'Ошибка создания организации')
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
        {/* Превью логотипа */}
        <div className={orgStyles.leftColumn}>
          <div className={orgStyles.avatarBox}>
            <img
              src={logoPreview || DEFAULT_LOGO}
              alt="Превью логотипа"
              onError={e => { e.currentTarget.src = DEFAULT_LOGO }}
            />
          </div>
        </div>

        {/* Форма */}
        <div className={orgStyles.rightColumn}>
          <form onSubmit={handleSubmit} className={profileStyles.profileForm}>
            <h2>Создание организации</h2>

            {error && <p className={profileStyles.error}>{error}</p>}

            <div className={profileStyles.field}>
              <label>
                Название<span className={profileStyles.required}>*</span>
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
                Slug<span className={profileStyles.required}>*</span><br/>
                <small>Только латинские буквы, цифры, точки и дефис</small>
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={e => setSlugInput(e.target.value)}
                required
                pattern="[A-Za-z0-9.\-]+"
                title="Только латинские буквы, цифры, точки и дефис"
              />
            </div>

            <div className={profileStyles.field}>
              <label>Описание</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={6}
              />
            </div>

            <div className={profileStyles.field}>
              <label>Логотип</label>
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
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}

// pages/org/[slug]/edit.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Navbar from '@/components/Navbar';
import profileStyles from '@/styles/Profile.module.css';
import orgStyles from '@/styles/Organization.module.css';
import { authFetch } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const DEFAULT_LOGO = '/default-logo.svg';

interface OrgData {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export default function OrgEditPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const [org, setOrg] = useState<OrgData | null>(null);
  const [name, setName] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [description, setDescription] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setLogoLoading] = useState(false);
  const [, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_URL}/api/org/${slug}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: OrgData) => {
        setOrg(data);
        setName(data.name);
        setSlugInput(data.slug);
        setDescription(data.description || '');
        setLogoPreview(data.logo || null);
      })
      .catch(() => {});
  }, [slug]);

  const uploadLogo = async (file: File) => {
    setLogoError(null);
    setLogoLoading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await authFetch(`${API_URL}/api/org/${slug}`, {
        method: 'PATCH',
        body: formData,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(data.detail || t('orgEditLogoError'));
      }
      const updated: OrgData = await res.json();
      setLogoPreview(updated.logo || null);
    } catch (err: unknown) {
      if (err instanceof Error) setLogoError(err.message);
      else setLogoError(String(err));
    } finally {
      setLogoLoading(false);
    }
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
    uploadLogo(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!/^[A-Za-z0-9.\-]+$/.test(slugInput)) {
      setError(t('orgEditSlugHelp'));
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slugInput);
      formData.append('description', description);
      const res = await authFetch(`${API_URL}/api/org/${slug}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(data.detail || t('orgEditError'));
      }
      const updated = await res.json();
      router.push(`/org/${updated.slug}`);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!org) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>{t('loading')}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={orgStyles.container}>
        <div className={orgStyles.leftColumn}>
          <label htmlFor="logo-upload" className={`${orgStyles.avatarBox} ${profileStyles.avatarBox}`}>
            <Image
              src={logoPreview || DEFAULT_LOGO}
              alt={t('orgLogoAlt')}
              width={280}
              height={280}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_LOGO;
              }}
            />
            <div className={profileStyles.avatarOverlay}>
              <Image
                src="/pencil.svg"
                alt={t('orgEditLogo')}
                width={40}
                height={40}
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
            <div className={orgStyles.fullName}>{org.name}</div>
            <div className={orgStyles.slugText}>@{org.slug}</div>
            <button className={profileStyles.backButton} onClick={() => router.back()}>
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
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className={profileStyles.field}>
              <label>
                {t('orgEditSlug')}<span className={profileStyles.required}>*</span><br />
                <small>{t('orgEditSlugHelp')}</small>
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                required
                pattern="[A-Za-z0-9.\-]+"
                title={t('orgEditSlugHelp')}
              />
            </div>
            <div className={profileStyles.field}>
              <label>{t('orgEditDescription')}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
            </div>
            <button type="submit" className={profileStyles.editButton} disabled={loading}>
              {loading ? t('orgEditLoading') : t('orgEditSubmit')}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

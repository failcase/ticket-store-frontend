// pages/profile/[username]/edit.tsx
import { useRouter } from 'next/router';
import { useEffect, useState, FormEvent } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Navbar from '@/components/Navbar';
import { authFetch } from '@/utils/auth';
import styles from '@/styles/Profile.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const DEFAULT_AVATAR = '/default-avatar.svg';

interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name?: string;
  avatar?: string;
}

export default function ProfileEditPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { username } = router.query as { username: string };

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);

  // Main info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Avatar state setters only
  const [, setAvatarLoading] = useState(false);
  const [, setAvatarError] = useState('');

  // Password
  const [newPwd1, setNewPwd1] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Email
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access');
    if (token) {
      try {
        const { username: u } = JSON.parse(atob(token.split('.')[1]));
        setMe(u);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!username) return;
    authFetch(`${API_URL}/api/users/${username}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: UserProfile) => {
        setUser(data);
        setFirstName(data.first_name);
        setLastName(data.last_name || '');
        setNewEmail(data.email);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading || me !== username || !user) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          {loading ? t('loading') : t('accessDenied')}
        </main>
      </>
    );
  }

  const handleAvatarChange = async (file: File) => {
    if (!file) return;
    setAvatarError('');
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await authFetch(`${API_URL}/api/users/${username}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error(t('avatarUploadError'));
      const updated = await res.json();
      setUser(updated);
    } catch {
      // ignore
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarChange(file);
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await authFetch(`${API_URL}/api/users/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName }),
      });
      if (!res.ok) throw new Error(t('saveError'));
      const updated = await res.json();
      setUser(updated);
    } catch {
      // ignore
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    setPwdLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/auth/password/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password1: newPwd1, new_password2: newPwd2 }),
      });
      if (res.ok) {
        setPwdSuccess(t('changePasswordSuccess'));
        setNewPwd1('');
        setNewPwd2('');
      } else {
        const data = (await res.json().catch(() => ({}))) as { detail?: string };
        setPwdError(data.detail || t('saveError'));
      }
    } catch {
      setPwdError(t('networkError'));
    } finally {
      setPwdLoading(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    setEmailLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/auth/email/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_email: newEmail }),
      });
      if (res.ok) {
        setEmailSuccess(t('emailChangeSent'));
      } else {
        const data = (await res.json().catch(() => ({}))) as { detail?: string };
        setEmailError(data.detail || t('saveError'));
      }
    } catch {
      setEmailError(t('networkError'));
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.leftColumn}>
          <div className={styles.avatarBox}>
            <label htmlFor="avatar-upload" className={styles.avatarUploadLabel}>
              <img
                src={user.avatar || DEFAULT_AVATAR}
                alt={t('avatarAlt')}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
              <div className={styles.avatarOverlay}>
                <img src="/pencil.svg" alt={t('changeAvatar')} className={styles.avatarOverlayIcon} />
              </div>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarSelect}
            />
          </div>
          <div className={styles.infoBox}>
            <div className={styles.fullName}>
              {user.first_name} {user.last_name || ''}
            </div>
            <div className={styles.usernameText}>@{user.username}</div>
            <div className={styles.emailRow}>
              <span className={styles.emailIcon} />
              {user.email}
            </div>
            <button className={styles.backButton} onClick={() => router.back()}>
              {t('back')}
            </button>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <form className={styles.profileForm} onSubmit={handleProfileSubmit}>
            <h2>{t('profileMainInfo')}</h2>
            <div className={styles.field}>
              <label>
                {t('firstName')}<span className={styles.required}>*</span>
              </label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label>{t('lastName')}</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <button type="submit">{t('save')}</button>
          </form>
          <form className={styles.passwordBox} onSubmit={handlePasswordSubmit}>
            <h2>{t('changePasswordTitle')}</h2>
            <div className={styles.passwordRow}>
              <div className={styles.field}>
                <label>
                  {t('newPassword')}<span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  value={newPwd1}
                  onChange={(e) => setNewPwd1(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>
                  {t('repeatPassword')}<span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  value={newPwd2}
                  onChange={(e) => setNewPwd2(e.target.value)}
                  required
                />
              </div>
            </div>
            {pwdError && <p className={styles.error}>{pwdError}</p>}
            {pwdSuccess && <p className={styles.successMessage}>{pwdSuccess}</p>}
            <button type="submit" disabled={pwdLoading}>
              {pwdLoading ? t('loading') : t('changePasswordSubmit')}
            </button>
          </form>
          <form className={styles.emailBox} onSubmit={handleEmailSubmit}>
            <h2>{t('changeEmailTitle')}</h2>
            <div className={styles.field}>
              <label>
                {t('newEmail')}<span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            {emailError && <p className={styles.error}>{emailError}</p>}
            {emailSuccess && <p className={styles.successMessage}>{emailSuccess}</p>}
            <button type="submit" disabled={emailLoading}>
              {emailLoading ? t('loading') : t('save')}
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

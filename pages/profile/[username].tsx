// pages/profile/[username].tsx
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { authFetch } from '@/utils/auth';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '@/styles/Profile.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const DEFAULT_AVATAR = '/default-avatar.svg';
const DEFAULT_ORG_LOGO = '/default-logo.svg';

interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name?: string;
  avatar?: string;
}

interface Organization {
  id: number;
  slug: string;
  name: string;
  logo?: string;
}

export default function ProfileViewPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { username } = router.query as { username: string };
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // determine current user from token
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access');
    if (token) {
      try {
        const { username: u } = JSON.parse(atob(token.split('.')[1]));
        setMe(u);
      } catch {
        setMe(null);
      }
    }
  }, []);

  // fetch user profile
  useEffect(() => {
    if (!username) return;
    setLoading(true);
    authFetch(`${API_URL}/api/users/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json() as Promise<UserProfile>;
      })
      .then((data: UserProfile) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [username]);

  // fetch organizations owned by user
  useEffect(() => {
    if (!username) return;
    fetch(`${API_URL}/api/org?owner=${username}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch organizations');
        return res.json() as Promise<Organization[]>;
      })
      .then((data: Organization[]) => setOrganizations(data))
      .catch(() => setOrganizations([]));
  }, [username]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          {t('profileLoading')}
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          {t('profileNotFound')}
        </main>
      </>
    );
  }

  const isOwner = me === username;

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.leftColumn}>
          <div
            className={styles.avatarBox}
            onClick={() => isOwner && router.push(`/profile/${username}/edit`)}
          >
            <Image
              src={user.avatar || DEFAULT_AVATAR}
              alt={t('avatarAlt')}
              width={278}
              height={278}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
          </div>
          <div className={styles.infoBox}>
            <div className={styles.fullName}>
              {user.first_name} {user.last_name}
            </div>
            <div className={styles.usernameText}>@{user.username}</div>
            <div className={styles.emailRow}>
              <span className={styles.emailIcon} />
              {user.email}
            </div>
            {isOwner && (
              <button
                className={styles.editButton}
                onClick={() => router.push(`/profile/${username}/edit`)}
              >
                {t('editProfile')}
              </button>
            )}
          </div>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.organizationsBlock}>
            <h2>{t('organizations')}</h2>
            {organizations.length === 0 ? (
              <p style={{ color: 'var(--fg-secondary)', fontStyle: 'italic' }}>
                {t('noOrganizations')}
              </p>
            ) : (
              <div className={styles.organizationsList}>
                {organizations.map((org) => (
                  <Link
                    key={org.id}
                    href={`/org/${org.slug}`}
                    className={styles.organizationItem}
                  >
                    <Image
                      src={org.logo || DEFAULT_ORG_LOGO}
                      alt={org.name}
                      width={96}
                      height={96}
                      className={styles.orgLogo}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_ORG_LOGO;
                      }}
                    />
                    <span className={styles.organizationName}>{org.name}</span>
                  </Link>
                ))}
              </div>
            )}
            {isOwner && (
              <button
                className={styles.createButton}
                onClick={() => router.push('/org/create')}
              >
                {t('createOrganization')}
              </button>
            )}
          </div>
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

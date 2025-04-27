// pages/register.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Navbar from '@/components/Navbar';
import styles from '@/styles/Login.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface RegisterForm {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password1: string;
  password2: string;
}

export default function Register() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password1: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/registration/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
      router.push({ pathname: '/login', query: { registered: '1' } });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>{t('registerTitle')}</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('registerUsername')}<span className={styles.required}>*</span>
            </label>
            <input
              name="username"
              className={styles.input}
              type="text"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('registerEmail')}<span className={styles.required}>*</span>
            </label>
            <input
              name="email"
              className={styles.input}
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('registerFirstName')}<span className={styles.required}>*</span>
            </label>
            <input
              name="first_name"
              className={styles.input}
              type="text"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>{t('registerLastName')}</label>
            <input
              name="last_name"
              className={styles.input}
              type="text"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('registerPassword')}<span className={styles.required}>*</span>
            </label>
            <input
              name="password1"
              className={styles.input}
              type="password"
              value={form.password1}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('registerPassword2')}<span className={styles.required}>*</span>
            </label>
            <input
              name="password2"
              className={styles.input}
              type="password"
              value={form.password2}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? t('registerLoading') : t('registerSubmit')}
          </button>
        </form>
        <p className={styles.footerText}>
          {t('registerHaveAccount')}{' '}
          <Link href="/login" className={styles.link}>
            {t('registerLogin')}
          </Link>
        </p>
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

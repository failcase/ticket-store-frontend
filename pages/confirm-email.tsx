// pages/confirm-email.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ConfirmEmail() {
  const { query, isReady } = useRouter();
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isReady) return;
    const key = Array.isArray(query.key) ? query.key[0] : query.key;
    if (!key) {
      setStatus('error');
      setMessage('Ключ подтверждения не найден в URL.');
      return;
    }

    fetch(`${API_URL}/api/auth/registration/verify-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
      .then(async res => {
        if (res.ok) {
          setStatus('success');
          setMessage('Почта успешно подтверждена! Теперь вы можете войти.');
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setMessage(data.detail || 'Ошибка при подтверждении почты.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Сетевая ошибка, попробуйте позже.');
      });
  }, [isReady, query.key]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
        {status === 'loading' && <p>Подтверждаем почту…</p>}
        {status === 'success' && (
          <>
            <div style={{
              padding: '1rem',
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: 4,
              marginBottom: '1.5rem'
            }}>
              {message}
            </div>
            <a
              href="/login"
              style={{
                display: 'inline-block',
                padding: '0.6rem 1.2rem',
                backgroundColor: '#2da44e',
                color: '#fff',
                borderRadius: 4,
                textDecoration: 'none'
              }}
            >
              Войти
            </a>
          </>
        )}
        {status === 'error' && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#d73a49',
            color: 'white',
            borderRadius: 4
          }}>
            {message}
          </div>
        )}
      </main>
    </>
  );
}

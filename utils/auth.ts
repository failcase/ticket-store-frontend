// utils/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL!;
function getAccess() { return localStorage.getItem('access'); }
function getRefresh() { return localStorage.getItem('refresh'); }

async function doRefresh() {
  const refresh = getRefresh();
  if (!refresh) throw new Error('Нет refresh-токена');
  const res = await fetch(`${API_URL}/api/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh })
  });
  if (!res.ok) throw new Error('Не удалось обновить токен');
  const { access } = await res.json();
  localStorage.setItem('access', access);
  return access;
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  let token = getAccess();
  if (token) {
    // Если до exp меньше минуты — обновляем
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    if (exp * 1000 < Date.now() + 60_000) {
      token = await doRefresh();
    }
  }

  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    // пробуем обновить и повторно вызвать
    try {
      token = await doRefresh();
      headers.set('Authorization', `Bearer ${token}`);
      res = await fetch(input, { ...init, headers });
    } catch {
      // редирект на логин
      localStorage.clear();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
  }
  return res;
}

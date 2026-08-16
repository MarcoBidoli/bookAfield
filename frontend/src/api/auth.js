export async function fetchCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const response = await fetch('/api/whoami', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    localStorage.removeItem('token');
    return null;
  }

  const data = await response.json();
  return data.user || data;
}

export async function login(credentials) {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export const refreshToken = async () => {
  const response = await fetch('http://127.0.0.1:8000/api/auth/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh: localStorage.getItem('refresh_token'),
    }),
  });

  if (!response.ok) {
    throw new Error("فشل تحديث التوكن");
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  return data.access;
};


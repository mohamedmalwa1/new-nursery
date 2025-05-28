// frontend-ui/src/api/auth.js
export async function loginAndGetToken(username, password) {
  const response = await fetch("http://127.0.0.1:8000/api/auth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data = await response.json();
  localStorage.setItem("access_token", data.access); // تخزين التوكن محلياً
  return data.access;
}

export function getToken() {
  return localStorage.getItem("access_token");
}


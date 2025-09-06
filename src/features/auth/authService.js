// src/features/auth/authService.js
import { apiFetch } from "../../services/api";

const LOGIN_PATH = "/api/users/login";
const ME_PATH    = "/api/users/findUserByToken";

// helpers de storage
function setUserLocal(user) {
  try { localStorage.setItem("user", JSON.stringify(user)); } catch {}
}
export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function login(email, password) {
  const data = await apiFetch(LOGIN_PATH, {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  // guarda token
  const token = data?.token ?? data?.accessToken;
  if (token) localStorage.setItem("token", token);

  // tenta pegar o usuário retornado no /login
  let user = data?.user ?? null;

  // fallback: se não veio "user" mas já temos token, busca via /me
  if (!user && token) {
    try {
      user = await me(); // esta rota já retorna o objeto do usuário
    } catch {
      // ignore; o caller pode tratar erro
    }
  }

  if (user) setUserLocal(user);
  return user ?? data; // mantém compat (caso seu back retorne outro formato)
}

export async function me() {
  // rota protegida que retorna o usuário a partir do token (Authorization: Bearer ...)
  return apiFetch(ME_PATH, { method: "POST", auth: true });
}

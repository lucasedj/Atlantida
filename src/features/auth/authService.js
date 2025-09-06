import { apiFetch } from "../../services/api"; 

const LOGIN_PATH = "/api/users/login";
const ME_PATH    = "/api/users/findUserByToken";

export async function login(email, password) {
  const data = await apiFetch(LOGIN_PATH, {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  const token = data?.token ?? data?.accessToken;
  if (token) localStorage.setItem("token", token);
  return data?.user ?? data;
}

export async function me() {
  return apiFetch(ME_PATH, { method: "POST", auth: true });
}

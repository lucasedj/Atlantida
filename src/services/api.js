export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function apiFetch(
  path,
  { method = "GET", body, headers, auth = true } = {}
) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) opts.headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, opts);
  const ct = res.headers.get("content-type") || "";
  const isJSON = ct.includes("application/json");
  const payload = isJSON ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const msg = isJSON
      ? payload?.message || payload?.error || `Erro ${res.status}`
      : `Erro ${res.status} — resposta não-JSON: ${String(payload).slice(0,120)}...`;
    throw new Error(msg);
  }
  if (!isJSON) {
    throw new Error("A API devolveu HTML (provável rota/URL errada ou proxy).");
  }
  return payload;
}

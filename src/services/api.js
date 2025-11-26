// src/services/api.js
export const API_URL = import.meta.env.VITE_API_URL ?? "https://atlantidaapi-production.up.railway.app";

export function toPublicUrl(raw) {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  const p = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_URL}${p}`;
}

const buildURL = (path) => {
  if (!path) return API_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${p}`;
};

export async function apiFetch(
  path,
  {
    method = "GET",
    body,
    headers,
    auth = true,
    timeoutMs = 30000,
    retryUnauth = true,   // tenta novamente sem Authorization em caso de 401/403
    parse = "auto",       // 'auto' | 'json' | 'text' | 'blob' | false
    credentials,          // opcional: 'include' | 'same-origin' | 'omit'
  } = {}
) {
  const url = buildURL(path);

  // Tipos de body p/ não setar Content-Type manualmente
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const isURLParams = typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;

  // Cabeçalhos base
  const computedHeaders = { ...(headers || {}) };
  if (!isFormData && !isBlob && !isURLParams) {
    computedHeaders["Content-Type"] =
      computedHeaders["Content-Type"] || "application/json";
  }
  computedHeaders["Accept"] = computedHeaders["Accept"] || "application/json";

  // Token (tenta vários locais comuns)
  let token = localStorage.getItem("token");
  if (!token) {
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        token = u?.token || u?.accessToken || u?.jwt || u?.data?.token || undefined;
      }
    } catch {}
  }

  // Body final
  const upper = String(method).toUpperCase();
  const hasBody = body != null && upper !== "GET" && upper !== "HEAD";
  const finalBody =
    !hasBody
      ? undefined
      : isFormData || isBlob || isURLParams
      ? body
      : JSON.stringify(body);

  // Timeout via AbortController
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);

  const doFetch = async (withAuth) => {
    const h = { ...computedHeaders };
    if (withAuth && token) h.Authorization = `Bearer ${token}`;

    const opts = {
      method: upper,
      headers: h,
      body: finalBody,
      signal: ctrl.signal,
      // NÃO forçar mode/credentials aqui para evitar CORS indesejado
    };
    if (credentials) opts.credentials = credentials;

    return fetch(url, opts);
  };

  let res;
  try {
    res = await doFetch(auth);
    // Fallback: se rota permitir público, tenta sem Authorization
    if ((res.status === 401 || res.status === 403) && auth && retryUnauth) {
      res = await doFetch(false);
    }
  } catch (err) {
    clearTimeout(id);
    if (err?.name === "AbortError") {
      throw new Error("Tempo de requisição excedido. Tente novamente.");
    }
    throw new Error("Falha na conexão com a API.");
  } finally {
    clearTimeout(id);
  }

  // 204/205 sem conteúdo
  if (res.status === 204 || res.status === 205) return {};

  // Conteúdo / parsing
  const contentType = res.headers.get("content-type") || "";
  const isJSON = contentType.includes("application/json");

  const readBody = async () => {
    if (parse === false) return undefined;
    if (parse === "text") return await res.text();
    if (parse === "blob") return await res.blob();
    if (parse === "json") {
      try { return await res.json(); } catch { return {}; }
    }
    // auto
    if (isJSON) {
      try { return await res.json(); } catch { return {}; }
    }
    try { return await res.text(); } catch { return ""; }
  };

  const payload = await readBody();

  if (!res.ok) {
    const message =
      (isJSON && payload && (payload.message || payload.error)) ||
      res.statusText ||
      `Erro ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload ?? {};
}

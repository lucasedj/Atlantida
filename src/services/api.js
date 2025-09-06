// src/services/api.js
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/**
 * Constrói uma URL absoluta a partir de um caminho relativo do backend.
 * Ex.: toPublicUrl("/uploads/123.jpg") -> "http://localhost:3000/uploads/123.jpg"
 */
export function toPublicUrl(raw) {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  const p = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_URL}${p}`;
}

/**
 * apiFetch(path, { method, body, headers, auth, timeoutMs })
 * - Não força Content-Type quando body é FormData/Blob/URLSearchParams
 * - Adiciona Authorization automaticamente quando auth=true
 * - Lê JSON por padrão e trata 204/205
 * - Timeout com AbortController
 */
export async function apiFetch(
  path,
  { method = "GET", body, headers, auth = true, timeoutMs = 30000 } = {}
) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const isURLParams =
    typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;

  // Cabeçalhos
  const computedHeaders = { ...(headers || {}) };
  if (!isFormData && !isBlob && !isURLParams) {
    computedHeaders["Content-Type"] =
      computedHeaders["Content-Type"] || "application/json";
  }
  computedHeaders["Accept"] = computedHeaders["Accept"] || "application/json";

  // Auth
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) computedHeaders.Authorization = `Bearer ${token}`;
  }

  // Body
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

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: upper,
      headers: computedHeaders,
      body: finalBody,
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(id);
    // erros de rede/timeout
    if (err?.name === "AbortError") {
      throw new Error("Tempo de requisição excedido. Tente novamente.");
    }
    throw new Error("Falha na conexão com a API.");
  }
  clearTimeout(id);

  // Sem conteúdo
  if (res.status === 204 || res.status === 205) return {};

  const ct = res.headers.get("content-type") || "";
  const isJSON = ct.includes("application/json");

  let payload;
  if (isJSON) {
    try {
      payload = await res.json();
    } catch {
      payload = {};
    }
  } else {
    const contentLength = res.headers.get("content-length");
    if (!contentLength || contentLength === "0") {
      payload = {};
    } else {
      payload = await res.text();
    }
  }

  if (!res.ok) {
    const msg = isJSON
      ? payload?.message || payload?.error || `Erro ${res.status}`
      : `Erro ${res.status} — resposta não-JSON: ${String(payload).slice(0, 120)}...`;
    throw new Error(msg);
  }

  // API deveria devolver JSON; se vier texto com conteúdo, sinaliza possível rota errada
  if (!isJSON && Object.keys(payload || {}).length) {
    throw new Error("A API devolveu conteúdo não-JSON (rota/URL possivelmente incorreta).");
  }

  return payload ?? {};
}

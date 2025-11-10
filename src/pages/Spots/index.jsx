import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../Logged/logged.css";
import "./spots.css";
import { getCurrentUser, me, logout } from "../../features/auth/authService";
import { apiFetch } from "../../services/api";

/* ---------- Menu ---------- */
const MenuItem = memo(function MenuItem({ to, icon, children, end = false }) {
  return (
    <NavLink
      end={end}
      to={to}
      className={({ isActive }) => `logged__item${isActive ? " active" : ""}`}
      aria-label={typeof children === "string" ? children : undefined}
    >
      <img src={icon} alt="" className="logged__icon" aria-hidden />
      <span>{children}</span>
    </NavLink>
  );
});

/* =========================================================
 * CONFIG de COMENTÁRIOS (alinhado ao seu backend)
 * ========================================================= */
const COMMENTS_WRITE_ENABLED = true; // ✅ temos endpoint no backend

// Leitura: 1) GET /api/:spotId/comments  2) fallbacks embutidos
const COMMENTS_READ_PATHS = (spotId) => [
  `/api/${spotId}/comments`,
  { type: "embedded", path: `/api/divingSpots/${spotId}` },
  { type: "embeddedList", path: `/api/divingSpots` },
];

// Escrita: POST direto em /api/comments
const COMMENTS_WRITE_PATHS = () => [`/api/comments`];

/* ---------- Img fallback ---------- */
function PublicImg({ candidates, alt = "", className = "", style }) {
  const [idx, setIdx] = useState(0);
  const onError = useCallback(() => {
    setIdx((i) => (i < candidates.length - 1 ? i + 1 : i));
  }, [candidates.length]);
  const src = candidates[Math.min(idx, candidates.length - 1)] || "";
  return (
    <img src={src} alt={alt} className={className} style={style} onError={onError} />
  );
}

/* ---------- Stars ---------- */
function StarRating({ value = 0, size = 14 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const rounded = Math.round(v);
  return (
    <span
      className="stars"
      style={{ fontSize: size }}
      role="img"
      aria-label={v ? `Nota ${v.toFixed(1)} de 5` : "Sem nota"}
      title={v ? `${v.toFixed(1)}/5` : "Sem nota"}
    >
      {"★★★★★".split("").map((_, i) => (
        <span key={i} className={i < rounded ? "on" : ""} aria-hidden>
          ★
        </span>
      ))}
      <span className="stars__val" aria-hidden>
        {v ? v.toFixed(1) : "—"}
      </span>
    </span>
  );
}

/* =========================================
 * Leaflet loader (CDN) — singleton e seguro p/ SSR
 * ========================================= */
let _leafletPromise = null;
const ensureLeaflet = () => {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.L) return Promise.resolve(window.L);
  if (_leafletPromise) return _leafletPromise;

  _leafletPromise = new Promise((resolve, reject) => {
    try {
      const cssId = "leaflet-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      const jsId = "leaflet-js";
      const existing = document.getElementById(jsId);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.L));
        existing.addEventListener("error", reject);
        return;
      }
      const script = document.createElement("script");
      script.id = jsId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.body.appendChild(script);
    } catch (e) {
      reject(e);
    }
  });

  return _leafletPromise;
};

/* =========================================
 * Mapa de Spots (com ícone customizado)
 * ========================================= */
const SpotsMap = memo(function SpotsMap({
  spots = [],
  selectedId,
  onSelectSpot,
  onPickLatLon,
}) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const pickMarkerRef = useRef(null);
  const spotIconRef = useRef(null); // 👈 ícone customizado

  // init
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await ensureLeaflet().catch(() => null);
      if (!L || cancelled || mapRef.current) return;

      const map = L.map(mapEl.current, {
        center: [-14.235, -51.925],
        zoom: 4,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // cria o ícone customizado (coloque public/images/spots.png)
      const BASE = import.meta.env.BASE_URL || "/";
      spotIconRef.current = L.icon({
        iconUrl: `${BASE}images/spots.png`,
        iconSize: [34, 34],     // ajuste conforme o PNG
        iconAnchor: [17, 30],   // "ponta" do pino
        popupAnchor: [0, -26],
        className: "spot-marker",
      });

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        onPickLatLon?.(lat, lng);
        if (pickMarkerRef.current) pickMarkerRef.current.setLatLng([lat, lng]);
        else pickMarkerRef.current = L.marker([lat, lng], { icon: spotIconRef.current }).addTo(map);
      });

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onPickLatLon]);

  // draw markers
  useEffect(() => {
    (async () => {
      const L = await ensureLeaflet().catch(() => null);
      const map = mapRef.current;
      const layer = markersLayerRef.current;
      if (!L || !map || !layer) return;

      layer.clearLayers();
      if (!spots.length) return;

      const bounds = L.latLngBounds();
      spots.forEach((s) => {
        const [lon, lat] = s?.location?.coordinates || [];
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          const m = L.marker([lat, lon], {
            icon: spotIconRef.current || undefined,
            title: s.name || "Ponto de mergulho",
            keyboard: true,
          }).addTo(layer);

          m.on("click", () => onSelectSpot?.(s));
          bounds.extend([lat, lon]);
          const title = s.name || "Ponto de mergulho";
          const ratingTxt =
            typeof s.avgRating === "number" ? `⭐ ${s.avgRating.toFixed(1)}` : "";
          m.bindPopup(`<strong>${title}</strong><br/>${ratingTxt}`);
          if (String(s._id) === String(selectedId)) setTimeout(() => m.openPopup(), 0);
        }
      });

      if (bounds.isValid()) map.fitBounds(bounds.pad(0.2));
    })();
  }, [spots, selectedId, onSelectSpot]);

  // focus selected
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const s = spots.find((x) => String(x._id) === String(selectedId));
    const [lon, lat] = s?.location?.coordinates || [];
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      mapRef.current.setView([lat, lon], Math.max(mapRef.current.getZoom(), 7), {
        animate: true,
      });
    }
  }, [selectedId, spots]);

  return (
    <div
      className="spots__mapPanel"
      ref={mapEl}
      role="img"
      aria-label="Mapa com pontos de mergulho"
    />
  );
});

/* --------- Hook utilitário p/ arquivos --------- */
function useFileList(initial = []) {
  const [items, setItems] = useState(initial);

  const pushFiles = useCallback((fileList) => {
    const arr = Array.from(fileList || []);
    const next = arr.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  const removeAt = useCallback((idx) => {
    setItems((prev) => {
      URL.revokeObjectURL(prev[idx]?.url);
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  }, []);

  useEffect(() => {
    return () => {
      items.forEach((f) => f?.url && URL.revokeObjectURL(f.url));
    };
  }, [items]);

  return { items, pushFiles, removeAt, setItems };
}

/* =============== Modal de avaliação =============== */
function ReviewModal({ open, onClose, onSubmit, spotName = "" }) {
  const { items: files, pushFiles, removeAt, setItems } = useFileList();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [visibility, setVisibility] = useState("");
  const [level, setLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reviewPhotosId = useId();

  useEffect(() => {
    if (!open) {
      setItems([]); setRating(0); setHover(0);
      setVisibility(""); setLevel(""); setNotes("");
      return;
    }
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, setItems]);

  const onInputChange = useCallback((e) => pushFiles(e.target.files), [pushFiles]);
  const onDrop = useCallback((e) => { e.preventDefault(); pushFiles(e.dataTransfer.files); }, [pushFiles]);
  const onDragOver = useCallback((e) => e.preventDefault(), []);

  const filesToBase64 = useCallback(async (fileObjs) => {
    const read = (file) =>
      new Promise((resolve, reject) => {
        // Rejeita arquivos extremamente grandes (>100MB) por segurança
        if (file.size > 100 * 1024 * 1024) {
          reject(new Error(`Arquivo muito grande: ${file.name}`));
          return;
        }
        const fr = new FileReader();
        fr.onload = () => {
          const result = String(fr.result || "");
          const match = result.match(/^data:(.+?);base64,(.*)$/);
          if (match) resolve({ contentType: match[1], data: match[2] });
          else resolve({ contentType: file.type || "application/octet-stream", data: result });
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
    return Promise.all(fileObjs.map(read));
  }, []);

  const submit = useCallback(async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      const photos = await filesToBase64(files.map((f) => f.file));
      const text = (notes || "").trim();
      await onSubmit?.({
        rating,
        visibility: visibility || undefined,
        difficultyLevel: level || undefined,
        comment: text,
        comments: text,
        photos,
      });
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  }, [files, filesToBase64, level, notes, onClose, onSubmit, rating, visibility]);

  if (!open) return null;
  return (
    <div
      className="modal__overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label="Avaliar ponto de mergulho">
        <header className="modal__head">
          <h3 className="modal__title">Avaliar ponto de mergulho</h3>
          <button className="modal__close" onClick={onClose} aria-label="Fechar" type="button">×</button>
        </header>

        <div className="modal__body">
          <div className="modal__grid">
            {/* Fotos */}
            <section className="modal__col">
              <h4 className="modal__sectionTitle">Fotos</h4>
              <p className="modal__hint">O que você viu durante seu mergulho?</p>

              <input id={reviewPhotosId} type="file" accept="image/*" multiple hidden onChange={onInputChange} />
              <label htmlFor={reviewPhotosId} className="dropzone modal__dropzone" onDrop={onDrop} onDragOver={onDragOver}>
                <div className="dropzone__inner">
                  <div className="modal__dropIcon" aria-hidden>🗂️</div>
                  <div className="dropzone__text">
                    <strong>Selecione do seu dispositivo</strong>
                    <small>Formatos aceitos PNG, JPG • Tamanho máximo 100MB</small>
                  </div>
                </div>
              </label>

              {files.length > 0 && (
                <div className="thumbs-grid" style={{ marginTop: 12 }}>
                  {files.map((f, idx) => (
                    <div className="thumb" key={f.url}>
                      <img src={f.url} alt={`Foto ${idx + 1}`} />
                      <button type="button" className="thumb__remove" onClick={() => removeAt(idx)} aria-label="Remover foto">×</button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Opinião */}
            <section className="modal__col">
              <h4 className="modal__sectionTitle">Opinião</h4>
              <p className="modal__hint">Dê uma nota para {spotName || "esse local"}</p>

              <div className="modal__starsInput" aria-label="Nota">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`modal__star${(hover || rating) >= n ? " is-on" : ""}`}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setRating(n);
                      }
                    }}
                    aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="modal__fieldBlock">
                <div className="modal__label">Visibilidade</div>
                <div className="modal__sublabel">Como estava a visibilidade?</div>
                <div className="segmented" role="radiogroup" aria-label="Visibilidade">
                  {["ALTO", "MODERADO", "BAIXO"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`segmented__btn${visibility === v ? " is-on" : ""}`}
                      onClick={() => setVisibility(visibility === v ? "" : v)}
                      aria-pressed={visibility === v}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal__fieldBlock">
                <div className="modal__label">Nível de mergulho</div>
                <div className="modal__sublabel">Como você entrou na água?</div>
                <div className="segmented" role="radiogroup" aria-label="Nível de mergulho">
                  {["ALTO", "MODERADO", "BAIXO"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`segmented__btn${level === v ? " is-on" : ""}`}
                      onClick={() => setLevel(level === v ? "" : v)}
                      aria-pressed={level === v}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal__fieldBlock">
                <div className="modal__label">Comentário</div>
                <div className="modal__sublabel">Anote as memórias do seu mergulho</div>
                <textarea
                  className="input modal__textarea"
                  placeholder="Insira sua avaliação aqui"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </section>
          </div>
        </div>

        <footer className="modal__actions">
          <button className="btn-ghost modal__btnCancel" onClick={onClose} type="button">CANCELAR</button>
          <button className="btn-primary modal__btnPrimary" onClick={submit} disabled={submitting} type="button">
            {submitting ? "ENVIANDO..." : "AVALIAR"}
          </button>
        </footer>
      </div>
    </div>
  );
}

/* =============== helpers & mapeamentos UI =============== */
const fmtDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
};

const deepFindFirstArray = (obj, maxDepth = 4) => {
  if (!obj || typeof obj !== "object" || maxDepth < 0) return [];
  if (Array.isArray(obj)) return obj;
  for (const v of Object.values(obj)) {
    if (Array.isArray(v)) return v;
  }
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") {
      const found = deepFindFirstArray(v, maxDepth - 1);
      if (Array.isArray(found) && found.length >= 0) return found;
    }
  }
  return [];
};

const toArray = (resp) => {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.data)) return resp.data;
  if (Array.isArray(resp?.comments)) return resp.comments;
  if (Array.isArray(resp?.results)) return resp.results;
  if (Array.isArray(resp?.docs)) return resp.docs;
  if (Array.isArray(resp?.items)) return resp.items;
  if (Array.isArray(resp?.data?.docs)) return resp.data.docs;
  const deep = deepFindFirstArray(resp);
  return Array.isArray(deep) ? deep : [];
};

const getSpotId = (c) => {
  const candidates = [
    c?.divingSpotId?._id, c?.divingSpot?._id, c?.spotId?._id, c?.spot?._id, c?.placeId?._id,
    c?.divingSpotId,      c?.divingSpot,      c?.spotId,      c?.spot,      c?.placeId,      c?.place,
  ];
  for (const v of candidates) {
    if (typeof v === "string" || typeof v === "number") return String(v);
  }
  return null;
};

/* ---------- User helpers e normalização ---------- */
const getUserIdFrom = (c = {}) => {
  const candidates = [
    c.userId, c.authorId, c.createdById, c.created_by, c.ownerId,
    typeof c.user === "string" ? c.user : null,
    typeof c.author === "string" ? c.author : null,
    typeof c.createdBy === "string" ? c.createdBy : null,
    typeof c.owner === "string" ? c.owner : null,
    c.user?._id,       c.user?.id,
    c.author?._id,     c.author?.id,
    c.createdBy?._id,  c.createdBy?.id,
    c.owner?._id,      c.owner?.id,
  ].filter(Boolean);

  for (const v of candidates) {
    if (typeof v === "string" || typeof v === "number") return String(v);
  }
  return null;
};

const pickBestUserName = (c = {}) => {
  const tries = [
    c.userName, c.name, c.displayName, c.fullName, c.username,
    c.user?.name,
    [c.user?.firstName, c.user?.lastName].filter(Boolean).join(" "),
    c.author?.name, c.createdBy?.name, c.owner?.name,
    c.account?.name, c.profile?.name,
    c.user?.username, c.author?.username, c.createdBy?.username,
  ].filter(Boolean);
  for (const t of tries) {
    const v = String(t).trim();
    if (v) return v;
  }
  return null;
};

const normalizeComment = (c = {}) => {
  const spotId = getSpotId(c);
  const userId = getUserIdFrom(c);
  const userName = pickBestUserName(c) ?? null;

  const text =
    c.comment ?? c.comments ?? c.text ?? c.description ?? c.note ?? c.notes ?? "";

  const createdAt =
    c.createdAt ?? c.date ?? c.created_at ?? c.updatedAt ?? c.updated_at ?? new Date().toISOString();

  const stableId =
    c._id ??
    c.id ??
    `c:${spotId || "spot"}|${String(userId || userName || "anon").toLowerCase()}|${new Date(createdAt)
      .toISOString()
      .slice(0, 19)}|${String(text).toLowerCase().slice(0, 40)}`;

  return {
    ...c,
    _id: stableId,
    rating: Number(c.rating) || 0,
    userName,
    userId,
    comment: text,
    photos: c.photos ?? c.images ?? [],
    createdAt,
    __spotId: spotId,
  };
};

const diveLogPhotos = (log) => {
  const list = Array.isArray(log?.photos)
    ? log.photos
    : Array.isArray(log?.images)
    ? log.images
    : [];
  return list
    .slice(0, 4)
    .map((p) =>
      p?.data && p?.contentType
        ? `data:${p.contentType};base64,${p.data}`
        : p?.url || (typeof p === "string" ? p : null)
    )
    .filter(Boolean);
};

const thumbFromSpot = (s) => {
  const img = s?.image;
  if (img?.data && img?.contentType) return `data:${img.contentType};base64,${img.data}`;
  return "/images/map-thumb-placeholder.jpg";
};
const avgFrom = (spot, reviews) => {
  if (reviews?.length) {
    const sum = reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0);
    return sum / reviews.length;
  }
  return spot?.avgRating ?? spot?.rating ?? 0;
};
const shortDesc = (txt, n = 120) => {
  const t = (txt || "").trim();
  if (!t) return "—";
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};
const uniqueById = (arr) => {
  const seen = new Set();
  return arr.filter((r) => {
    const k = String(r._id || r.id);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/* ====== Persistência LOCAL (fallback) ====== */
const LS_REVIEWS_KEY = "atl_reviews_local";

function loadLocalReviews(spotId) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_REVIEWS_KEY) || "{}");
    const list = Array.isArray(all[spotId]) ? all[spotId] : [];
    return list;
  } catch {
    return [];
  }
}
function saveLocalReview(spotId, review) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_REVIEWS_KEY) || "{}");
    const list = Array.isArray(all[spotId]) ? all[spotId] : [];
    all[spotId] = [review, ...list].slice(0, 200);
    localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(all));
  } catch {}
}

/* ====== Extração robusta de comentários embutidos ====== */
function extractEmbeddedComments(obj) {
  if (!obj || typeof obj !== "object") return [];
  const direct =
    obj.comments ||
    obj.reviews ||
    obj.ratings ||
    obj.feedbacks ||
    obj.evaluations ||
    obj.avaliacoes ||
    null;
  if (Array.isArray(direct)) return direct;

  const arrays = [];
  const visit = (x, depth = 0) => {
    if (!x || depth > 5) return;
    if (Array.isArray(x)) arrays.push(x);
    else if (typeof x === "object") {
      for (const v of Object.values(x)) visit(v, depth + 1);
    }
  };
  visit(obj);
  const candidates = arrays.filter((arr) =>
    arr.some(
      (it) =>
        it && typeof it === "object" && ("rating" in it || "comment" in it || "comments" in it)
    )
  );
  let best = [];
  for (const a of candidates) if (a.length > best.length) best = a;
  return best;
}

/* ====== GET/POST de comentários ====== */
async function fetchCommentsForSpot(spotId, fetcher, signal) {
  for (const p of COMMENTS_READ_PATHS(spotId)) {
    try {
      if (signal?.aborted) break;
      if (typeof p === "string") {
        const resp = await fetcher(p, { signal });
        const arr = toArray(resp);
        if (Array.isArray(arr)) {
          console.info("[reviews] usando rota:", p);
          return arr;
        }
      } else if (p?.type === "embedded") {
        const spot = await fetcher(p.path, { signal });
        const embedded = extractEmbeddedComments(spot) || [];
        if (embedded.length) {
          console.info("[reviews] usando embutido:", p.path);
          return embedded;
        }
      } else if (p?.type === "embeddedList") {
        const list = await fetcher(p.path, { signal });
        const arr = Array.isArray(list) ? list : toArray(list);
        const spot =
          arr.find((s) => String(s?._id) === String(spotId)) ||
          arr.find((s) => String(s?.id) === String(spotId));
        const embedded = extractEmbeddedComments(spot) || [];
        if (embedded.length) {
          console.info("[reviews] usando embutido da lista:", p.path);
          return embedded;
        }
      }
    } catch (e) {
      if (e?.name === "AbortError") break; // cancelado
      // tenta próxima
    }
  }
  return [];
}

async function postCommentOnAnyRoute(spotId, body, fetcher) {
  if (!COMMENTS_WRITE_ENABLED) return false;
  const extended = {
    ...body,
    divingSpotId: spotId,
    divingSpot: spotId,
    spotId: spotId,
    spot: spotId,
    placeId: spotId,
    place: spotId,
  };
  let lastErr;
  for (const p of COMMENTS_WRITE_PATHS(spotId)) {
    try {
      await fetcher(p, { method: "POST", body: extended, auth: true });
      console.info("[reviews] POST ok em:", p);
      return true;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Não encontrei rota para criar avaliação.");
}

/* =====================================================
 * Página: Locais de mergulho (explorar + cadastrar)
 * ===================================================*/
export default function Spots() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [authReady, setAuthReady] = useState(!!user);

  const [spots, setSpots] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(true);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("info"); // info | reviews

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsErr, setReviewsErr] = useState("");

  const [reviewOpen, setReviewOpen] = useState(false);

  // form (cadastrar novo spot)
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [desc, setDesc] = useState("");
  const { items: files, pushFiles, removeAt, setItems: setFiles } = useFileList();
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const spotPhotosId = useId();

  /* ==== Auth ==== */
  useEffect(() => {
    let alive = true;
    if (user) {
      setAuthReady(true);
      return () => { alive = false; };
    }
    (async () => {
      try {
        const u = await me();
        if (!alive) return;
        setUser(u);
        try { localStorage.setItem("user", JSON.stringify(u)); } catch {}
      } catch {
        // sessão inválida ou anônima
      } finally {
        if (alive) setAuthReady(true);
      }
    })();
    return () => { alive = false; };
  }, [user]);

  /* ==== Helper: tenta com auth; se falhar, sem auth ==== */
  const fetchWithAuthFallback = useCallback(async (url, options = {}) => {
    try {
      return await apiFetch(url, { auth: true, ...options });
    } catch (e1) {
      try {
        return await apiFetch(url, { ...options, auth: false });
      } catch (e2) {
        throw e1 || e2;
      }
    }
  }, []);

  /* ==== Spots ==== */
  useEffect(() => {
    const ac = new AbortController();
    let active = true;
    (async () => {
      try {
        setLoadingSpots(true);
        const data = await apiFetch("/api/divingSpots", { auth: true, signal: ac.signal });
        if (!active) return;
        const arr = Array.isArray(data) ? data : [];
        setSpots(arr);
        if (arr.length && !selected) setSelected(arr[0]);
      } catch (e) {
        if (active) setSpots([]);
      } finally {
        if (active) setLoadingSpots(false);
      }
    })();
    return () => {
      active = false;
      ac.abort();
    };
  }, []); // 1x

  /* ==== Cache p/ nomes de usuários e hidratação ==== */
  const userNameCacheRef = useRef(new Map()); // id -> name|null

  const fetchUserNameById = useCallback(
    async (id, signal) => {
      if (!id) return null;
      if (userNameCacheRef.current.has(id)) return userNameCacheRef.current.get(id);

      const candidatePaths = [
        `/api/users/${id}`,
        `/api/user/${id}`,
        `/api/users/find/${id}`,
        `/api/users/by-id/${id}`,
        `/api/users/get/${id}`,
        `/api/users?id=${encodeURIComponent(id)}`,
      ];

      for (const p of candidatePaths) {
        try {
          const u = await fetchWithAuthFallback(p, { auth: true, signal });
          const name =
            u?.name ||
            [u?.firstName, u?.lastName].filter(Boolean).join(" ") ||
            u?.username ||
            u?.displayName ||
            u?.fullName ||
            null;
          if (name) {
            userNameCacheRef.current.set(id, name);
            return name;
          }
        } catch (e) {
          if (e?.name === "AbortError") return null;
        }
      }
      userNameCacheRef.current.set(id, null);
      return null;
    },
    [fetchWithAuthFallback]
  );

  const hydrateReviewUserNames = useCallback(
    async (list, signal) => {
      const toResolve = list.filter((r) => !r.userName && r.userId);
      if (!toResolve.length) return;

      const pairs = await Promise.all(
        toResolve.map(async (r) => [r._id, await fetchUserNameById(r.userId, signal)])
      );

      setReviews((prev) =>
        prev.map((r) => {
          const pair = pairs.find(([rid]) => String(rid) === String(r._id));
          if (pair && pair[1]) return { ...r, userName: pair[1] };
          return r;
        })
      );
    },
    [fetchUserNameById]
  );

  /* ==== Reviews ==== */
  const loadSpotReviews = useCallback(
    async (spotId, signal) => {
      const fromApi = await fetchCommentsForSpot(spotId, fetchWithAuthFallback, signal);
      const local = loadLocalReviews(spotId);
      const raw = [...(fromApi || []), ...(local || [])];
      const norm = raw
        .map(normalizeComment)
        .filter((c) => getSpotId(c) === String(spotId) || !getSpotId(c));
      return uniqueById(norm);
    },
    [fetchWithAuthFallback]
  );

  useEffect(() => {
    const ac = new AbortController();
    let active = true;
    if (!authReady) return () => { ac.abort(); active = false; };
    if (!selected?._id) {
      setReviews([]);
      return () => { ac.abort(); active = false; };
    }
    (async () => {
      try {
        setLoadingReviews(true);
        setReviewsErr("");
        const arr = await loadSpotReviews(selected._id, ac.signal);
        if (!active) return;
        const sorted = (arr || []).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        const uniq = uniqueById(sorted);
        setReviews(uniq);
        // hidrata nomes que estiverem faltando
        hydrateReviewUserNames(uniq, ac.signal);
      } catch (e) {
        if (active && e?.name !== "AbortError")
          setReviewsErr(e?.message || "Falha ao carregar avaliações.");
      } finally {
        if (active) setLoadingReviews(false);
      }
    })();
    return () => { active = false; ac.abort(); };
  }, [selected?._id, loadSpotReviews, authReady, hydrateReviewUserNames]);

  const BASE = import.meta.env.BASE_URL || "/";
  const withBase = useCallback((p) => `${BASE}${p}`, [BASE]);

  /* ==== Upload ==== */
  const onInputChange = useCallback((e) => pushFiles(e.target.files), [pushFiles]);
  const onDrop = useCallback((e) => { e.preventDefault(); pushFiles(e.dataTransfer.files); }, [pushFiles]);
  const onDragOver = useCallback((e) => e.preventDefault(), []);
  const removeFile = useCallback((idx) => removeAt(idx), [removeAt]);

  const toNum = (v) => {
    if (v === "" || v == null) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const filesToBase64 = useCallback(async (fileObjs) => {
    const read = (file) =>
      new Promise((resolve, reject) => {
        if (file.size > 100 * 1024 * 1024) {
          reject(new Error(`Arquivo muito grande: ${file.name}`));
          return;
        }
        const fr = new FileReader();
        fr.onload = () => {
          const result = String(fr.result || "");
          const match = result.match(/^data:(.+?);base64,(.*)$/);
          if (match) resolve({ contentType: match[1], data: match[2] });
          else resolve({ contentType: file.type || "application/octet-stream", data: result });
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
    return Promise.all(fileObjs.map(read));
  }, []);
  const fillWithGeolocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(6)));
        setLon(String(pos.coords.longitude.toFixed(6)));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  /* ==== Novo spot ==== */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setMsg("");
    setSubmitting(true);
    try {
      const latNum = toNum(lat);
      const lonNum = toNum(lon);
      const missing = [];
      if (!name.trim()) missing.push("Nome do local");
      if (!Number.isFinite(latNum)) missing.push("Latitude");
      if (!Number.isFinite(lonNum)) missing.push("Longitude");
      if (missing.length) {
        setMsg(`Preencha: ${missing.join(", ")}.`);
        setSubmitting(false);
        return;
      }
      const images = await filesToBase64(files.map((f) => f.file));
      const image = images[0] || undefined;
      const payload = {
        name: name.trim(),
        description: desc?.trim() || undefined,
        waterBody: "Salgada",
        location: { type: "Point", coordinates: [lonNum, latNum] },
        ...(image ? { image } : {}),
        ...(images.length ? { images } : {}),
      };
      await apiFetch("/api/divingSpots", { method: "POST", auth: true, body: payload });
      setMsg("Local cadastrado com sucesso!");
      setName(""); setLat(""); setLon(""); setDesc(""); setFiles([]);
      try {
        const data = await apiFetch("/api/divingSpots", { auth: true });
        const arr = Array.isArray(data) ? data : [];
        setSpots(arr);
        if (arr.length) setSelected(arr[0]);
      } catch {}
    } catch (err) {
      setMsg(err?.message || "Não foi possível cadastrar o local.");
    } finally {
      setSubmitting(false);
    }
  }, [desc, files, filesToBase64, lat, lon, name, setFiles]);

  /* ==== Avaliação ==== */
  const submitReview = useCallback(
    async ({ rating, visibility, difficultyLevel, comment, comments, photos }) => {
      if (!selected?._id) return;
      const text = (comment ?? comments ?? "").trim();

      // inserção otimista
      const optimistic = {
        _id: `temp-${Date.now()}`,
        divingSpotId: selected._id,
        rating,
        visibility,
        difficultyLevel,
        comment: text,
        comments: text,
        notes: text,
        photos,
        userName:
          user?.name ||
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          user?.username ||
          "Você",
        userId: user?._id || user?.id || user?.userId || null,
        createdAt: new Date().toISOString(),
      };

      setReviews((prev) => [optimistic, ...prev]);
      setTab("reviews");

      if (rating) {
        setSpots((prev) =>
          prev.map((s) => {
            if (String(s._id) !== String(selected._id)) return s;
            const currentAvg = s.avgRating ?? s.rating ?? 0;
            const currentCount = s.reviewsCount ?? reviews.length;
            const newCount = currentCount + 1;
            const newAvg = (currentAvg * currentCount + Number(rating || 0)) / newCount;
            return { ...s, avgRating: newAvg, reviewsCount: newCount };
          })
        );
      }

      // persistência no servidor
      try {
        await postCommentOnAnyRoute(
          selected._id,
          {
            rating,
            visibility,
            difficultyLevel,
            comment: text,
            comments: text,
            photos,
            userId: user?._id || user?.id || user?.userId || undefined,
            userName:
              user?.name ||
              [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
              user?.username ||
              undefined,
          },
          apiFetch
        );
        setMsg("Avaliação salva no servidor!");
        // recarrega do servidor
        try {
          const ac = new AbortController();
          const arr = await loadSpotReviews(selected._id, ac.signal);
          const normalized = (arr || []).sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
          const uniq = normalized.length ? uniqueById(normalized) : null;
          if (uniq) {
            setReviews(uniq);
            hydrateReviewUserNames(uniq, ac.signal);
          }
        } catch {}
      } catch (e2) {
        // fallback local (mantém otimista)
        saveLocalReview(selected._id, optimistic);
        setMsg(e2?.message || "Não foi possível salvar no servidor. A avaliação ficará salva localmente.");
      }
    },
    [
      reviews.length,
      selected?._id,
      setSpots,
      setReviews,
      setTab,
      user?.name,
      loadSpotReviews,
      hydrateReviewUserNames,
      user?._id,
      user?.id,
      user?.userId,
    ]
  );

  /* ==== UI ==== */
  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return spots;
    return spots.filter((s) => (s.name || "").toLowerCase().includes(q));
  }, [query, spots]);

  const onSearchGo = useCallback(() => {
    if (filtered.length) {
      setSelected(filtered[0]);
      setTab("info");
    }
  }, [filtered]);

  return (
    <div className="logged">
      {/* Sidebar */}
      <aside className="logged__sidebar">
        <div className="logged__brand">
          <img src="/images/logo-atlantida-branca.png" alt="Atlântida" className="logged__logoImg" />
        </div>

        <nav className="logged__nav" aria-label="Navegação principal">
          <MenuItem end to="/logged" icon="/images/mini-icon/início.png">Início</MenuItem>
          <MenuItem to="/logged/estatisticas" icon="/images/mini-icon/estatística.png">Estatísticas</MenuItem>
          <MenuItem to="/logged/locais" icon="/images/mini-icon/locais-de-mergulho.png">Locais de mergulho</MenuItem>
          <MenuItem to="/logged/certificados" icon="/images/mini-icon/certificados.png">Certificados</MenuItem>
          <MenuItem to="/logged/perfil" icon="/images/mini-icon/perfil.png">Perfil do usuário</MenuItem>
        </nav>

        <div className="logged__card" aria-label="Atalho para registrar mergulho">
          <div className="logged__cardMedia">
            <img src="/images/logo-mergulho.png" alt="" aria-hidden />
          </div>
          <Link to="/logged/registrar-mergulho" className="logged__primaryBtn" role="button">
            <span className="logged__plus" aria-hidden>＋</span>
            Registrar mergulho
          </Link>
        </div>

        <button
          type="button"
          className="logged__logout"
          onClick={() => { logout(); navigate("/login"); }}
        >
          <img src="/images/mini-icon/Sair.png" alt="" className="logged__icon" aria-hidden />
          <span>Sair do sistema</span>
        </button>
      </aside>

      {/* Conteúdo */}
      <main className="logged__content">
        <div className="page dash">
          <header className="dash__head">
            <h1 className="dash__title">Locais de mergulho</h1>
            <p className="dash__sub">
              Explore as profundezas, descubra novas aventuras, classifique, avalie e compartilhe
              suas experiências e locais de mergulho favoritos.
            </p>
          </header>

          {/* ======== LISTA | DETALHES | MAPA ======== */}
          <section className="spots__explore">
            {/* Lista + busca */}
            <aside className="spots__listCard card">
              <div className="spots__search">
                <label className="spots__searchInput">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="11" cy="11" r="7" stroke="#9aa3af" />
                    <path d="M20 20l-3.5-3.5" stroke="#9aa3af" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Buscar locais…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); onSearchGo(); }
                    }}
                    aria-label="Buscar local de mergulho"
                  />
                </label>
                <button className="spots__searchBtn" type="button" onClick={onSearchGo} aria-label="Buscar">🔍</button>
              </div>

              <div className="spots__list" role="list">
                {filtered.map((s) => {
                  const rating = s.avgRating ?? s.rating ?? 0;
                  return (
                    <button
                      key={s._id}
                      type="button"
                      className={`spots__item${selected?._id === s._id ? " is-active" : ""}`}
                      onClick={() => { setSelected(s); setTab("info"); }}
                      aria-pressed={selected?._id === s._id}
                    >
                      <img className="spots__itemImg" src={thumbFromSpot(s)} alt="" />
                      <div className="spots__itemMeta">
                        <div className="spots__itemTitle">{s.name || "Ponto de mergulho"}</div>
                        <div className="spots__itemSub" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <StarRating value={rating} />
                          {typeof s.reviewsCount === "number" && <small>({s.reviewsCount})</small>}
                        </div>
                        <div className="spots__itemDesc" style={{ color: "var(--c-ink-600)" }}>
                          {shortDesc(s.description, 110)}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {!filtered.length && <div className="spots__empty">Nenhum local encontrado.</div>}
              </div>
            </aside>

            {/* Detalhes */}
            <section className="spots__details card">
              {selected ? (
                <>
                  <img className="spots__hero" src={thumbFromSpot(selected)} alt={selected.name || "Local de mergulho"} />
                  <div className="spots__detailsHead">
                    <div>
                      <h3 className="spots__title">{selected.name || "Local de mergulho"}</h3>
                      <StarRating value={avgFrom(selected, reviews)} size={16} />
                    </div>
                    <div className="spots__tabs" role="tablist" aria-label="Abas">
                      <button className={`spots__tab${tab === "info" ? " is-active" : ""}`} onClick={() => setTab("info")} role="tab" aria-selected={tab === "info"} type="button">Informações</button>
                      <button className={`spots__tab${tab === "reviews" ? " is-active" : ""}`} onClick={() => setTab("reviews")} role="tab" aria-selected={tab === "reviews"} type="button">Avaliações</button>
                    </div>
                  </div>

                  {tab === "info" && (
                    <div className="spots__info">
                      <p className="spots__desc">{selected.description || "Sem descrição."}</p>
                      <div className="spots__metaGrid">
                        <div><strong>Nível de mergulho:</strong><span /><span>{selected.difficultyLevel ?? "—"}</span></div>
                        <div><strong>Visibilidade</strong><span /><span>{selected.visibility ?? "—"}</span></div>
                        <div><strong>Coordenadas</strong><span /><span>
                          {Array.isArray(selected?.location?.coordinates)
                            ? `${selected.location.coordinates[1]?.toFixed?.(5)}, ${selected.location.coordinates[0]?.toFixed?.(5)}`
                            : "—"}
                        </span></div>
                      </div>
                    </div>
                  )}

                  {tab === "reviews" && (
                    <div className="spots__reviews">
                      {loadingReviews && <div className="spots__loading">Carregando avaliações…</div>}
                      {reviewsErr && <div className="spots__error">{reviewsErr}</div>}
                      {!loadingReviews && !reviewsErr && reviews.length === 0 && (
                        <div className="spots__empty">Ainda não há avaliações para este ponto.</div>
                      )}
                      {!loadingReviews && !reviewsErr && reviews.map((r) => (
                        <article key={r._id || r.id} className="spots__review">
                          <header className="spots__reviewHead">
                            <div className="spots__reviewWho">
                              <div className="spots__avatar" aria-hidden>🧭</div>
                              <div>
                                <div className="spots__reviewName">
                                  {r.userName ||
                                   r.name ||
                                   r.displayName ||
                                   r.fullName ||
                                   r?.user?.name ||
                                   [r?.user?.firstName, r?.user?.lastName].filter(Boolean).join(" ") ||
                                   r?.author?.name ||
                                   r?.createdBy?.name ||
                                   r?.owner?.name ||
                                   r?.username ||
                                   "Mergulhador(a)"}
                                </div>
                                <div className="spots__reviewDate">{fmtDate(r.createdAt || r.date)}</div>
                              </div>
                            </div>
                            <StarRating value={r.rating || 0} />
                          </header>

                          {r.comment && <p className="spots__reviewText">{r.comment}</p>}

                          {diveLogPhotos(r).length > 0 && (
                            <div className="spots__reviewPics">
                              {diveLogPhotos(r).map((src, i) => (<img key={i} src={src} alt={`Foto ${i + 1}`} />))}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}

                  <div className="spots__cta">
                    <button type="button" className="btn-primary" onClick={() => setReviewOpen(true)}>
                      AVALIAR PONTO
                    </button>
                  </div>
                </>
              ) : (
                <div className="spots__empty" style={{ padding: 18 }}>Selecione um local na lista.</div>
              )}
            </section>

            {/* Mapa */}
            <SpotsMap
              spots={filtered}
              selectedId={selected?._id}
              onSelectSpot={(s) => { setSelected(s); setTab("info"); }}
              onPickLatLon={(la, lo) => { setLat(String(la.toFixed(6))); setLon(String(lo.toFixed(6))); }}
            />
          </section>

          {/* ======== CADASTRAR NOVO SPOT ======== */}
          {msg && (
            <p aria-live="polite" className={`spots__msg ${msg.includes("sucesso") || msg.includes("servidor") ? "is-ok" : "is-err"}`}>
              {msg}
            </p>
          )}

          <form className="card spots__form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="label">Nome do local</label>
              <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="field">
              <label className="label">Coordenadas geográficas</label>
              <div className="spots__coords">
                <input type="text" inputMode="decimal" className="input" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
                <input type="text" inputMode="decimal" className="input" placeholder="Longitude" value={lon} onChange={(e) => setLon(e.target.value)} />
                <button type="button" className="btn-ghost" onClick={fillWithGeolocation} title="Usar minha localização">Usar minha localização</button>
              </div>
            </div>

            <div className="field">
              <label className="label">Descrição</label>
              <span className="hint">Dica: descreva com detalhes como é o local, localização entre outras informações</span>
              <textarea
                className="input"
                placeholder="Biodiversidade marinha, águas profundas, boa localização..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{ minHeight: 140, resize: "vertical", paddingTop: 10, paddingBottom: 10 }}
              />
            </div>

            {/* Mantido: ocupa a linha inteira */}
            <div className="field field--full">
              <label className="label">Imagens do local</label>
              <input id={spotPhotosId} type="file" accept="image/*" multiple hidden onChange={onInputChange} />
              <label htmlFor={spotPhotosId} className="dropzone dropzone--clickable" onDrop={onDrop} onDragOver={onDragOver} aria-label="Enviar imagens do local">
                <div className="dropzone__inner">
                  <PublicImg
                    candidates={[
                      withBase("images/mini-icon/Upload.png"),
                      withBase("images/mini-icon/upload.png"),
                      withBase("images/Upload.png"),
                      withBase("images/upload.png"),
                    ]}
                    alt="Upload"
                    className="dropzone__icon"
                  />
                  <div className="dropzone__text">
                    <strong>Selecione do seu dispositivo</strong>
                    <small>Formatos aceitos: PNG, JPG ou JPEG • Tamanho máximo 100MB</small>
                  </div>
                </div>
              </label>

              {files.length > 0 && (
                <div className="thumbs-grid">
                  {files.map((f, idx) => (
                    <div className="thumb" key={f.url}>
                      <img src={f.url} alt={`Foto ${idx + 1}`} />
                      <button type="button" className="thumb__remove" onClick={() => removeFile(idx)} aria-label="Remover foto">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions" style={{ marginTop: 8 }}>
          <button
            type="submit"
            className="btn-primary btn-static"   // <- adicionada
            disabled={submitting}>
            {submitting ? "CADASTRANDO..." : "CADASTRAR LOCAL DE MERGULHO"}
          </button>
        </div>

          </form>
        </div>
      </main>

      {/* Modal de avaliação */}
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmit={submitReview}
        spotName={selected?.name}
      />
    </div>
  );
}


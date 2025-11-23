import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import "./Home.css";

/* Leaflet (mapa) */
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* Recalcula o layout do mapa ao montar e no resize */
function AutoResizeMap() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const t = setTimeout(invalidate, 120); // pequeno atraso pós-montagem
    window.addEventListener("resize", invalidate);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);
  return null;
}

/* ---------- Estilos do MODAL (inline, sem mexer no seu CSS) ---------- */
const modalCss = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,.55)",
    backdropFilter: "blur(2px)",
    zIndex: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "min(980px, 96vw)",
    maxHeight: "90vh",
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 20px 50px rgba(0,0,0,.25)",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "minmax(280px, 1fr) minmax(340px, 1fr)",
  },
  dialogSingleCol: {
    width: "min(720px, 96vw)",
    maxHeight: "90vh",
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 20px 50px rgba(0,0,0,.25)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  media: {
    position: "relative",
    background: "#0b1220",
    aspectRatio: "16/12",
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
  },
  right: { padding: 16, overflowY: "auto" },
  close: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "rgba(255,255,255,.9)",
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    padding: "6px 10px",
    cursor: "pointer",
  },
  navBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,.9)",
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    padding: "6px 10px",
    cursor: "pointer",
    userSelect: "none",
  },
  navPrev: { left: 10 },
  navNext: { right: 10 },
  thumbsWrap: {
    display: "flex",
    gap: 8,
    padding: 10,
    overflowX: "auto",
    background: "#0b1220",
    borderTop: "1px solid rgba(255,255,255,.08)",
  },
  thumb: (active) => ({
    width: 72,
    height: 58,
    borderRadius: 8,
    border: active ? "2px solid #60a5fa" : "2px solid transparent",
    overflow: "hidden",
    cursor: "pointer",
    flex: "0 0 auto",
  }),
  img: { width: "100%", height: "100%", objectFit: "cover" },
  title: { fontSize: "1.05rem", fontWeight: 700 },
  muted: { color: "#6b7280" },
  rating: { marginTop: 6, fontSize: ".95rem", color: "#111827" },
  metaRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 },
  metaItem: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: ".92rem",
    color: "#111827",
    background: "#fafafa",
  },
  pill: {
    display: "inline-block",
    fontSize: ".78rem",
    background: "#eef2ff",
    color: "#1d4ed8",
    padding: "4px 8px",
    borderRadius: 999,
    marginRight: 6,
    marginTop: 6,
  },
  h3: { margin: "14px 0 6px", fontSize: "1.05rem" },
  review: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    background: "#fff",
  },
};

/* ======= Utils ======= */
const toSafeStr = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(toSafeStr).join(" ");
  if (typeof v === "object") {
    try {
      return Object.values(v).map((x) => (typeof x === "object" ? "" : toSafeStr(x))).join(" ");
    } catch {
      return "";
    }
  }
  return "";
};

const parseNum = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(",", "."));
    return Number.isNaN(n) ? null : n;
  }
  return null;
};

const getCoords = (s = {}) => {
  let lat =
    parseNum(s.lat) ??
    parseNum(s.latitude) ??
    parseNum(s?.coords?.lat) ??
    parseNum(s?.coordenadas?.lat) ??
    parseNum(s?.location?.lat) ??
    parseNum(s?.localizacao?.lat);

  let lng =
    parseNum(s.lng) ??
    parseNum(s.long) ??
    parseNum(s.lon) ??
    parseNum(s.longitude) ??
    parseNum(s?.coords?.lng) ??
    parseNum(s?.coordenadas?.lng) ??
    parseNum(s?.location?.lng) ??
    parseNum(s?.localizacao?.lng);

  if ((lat == null || lng == null) && typeof s.coords === "string") {
    const [a, b] = s.coords.split(/[,; ]+/).map((x) => parseNum(x));
    if (a != null && b != null) { lat = a; lng = b; }
  }

  const arr =
    Array.isArray(s.coords) ? s.coords :
    Array.isArray(s.coordenadas) ? s.coordenadas :
    Array.isArray(s.location?.coordinates) ? s.location.coordinates :
    null;

  if ((lat == null || lng == null) && Array.isArray(arr) && arr.length >= 2) {
    const a = parseNum(arr[0]);
    const b = parseNum(arr[1]);
    if (a != null && b != null) {
      const maybeLngFirst = Math.abs(a) > Math.abs(b);
      if (maybeLngFirst) { lng = a; lat = b; } else { lat = a; lng = b; }
    }
  }

  if ((lat == null || lng == null) && s.location?.type === "Point" && Array.isArray(s.location?.coordinates)) {
    const [lngG, latG] = s.location.coordinates.map(parseNum);
    if (latG != null && lngG != null) { lat = latG; lng = lngG; }
  }

  if (typeof lat === "number" && !Number.isNaN(lat) &&
      typeof lng === "number" && !Number.isNaN(lng)) {
    return { lat, lng };
  }
  return null;
};

/* ======= Estrelas ======= */
const renderStars = (avg = 0) => {
  const num = Number.isFinite(Number(avg)) ? Math.max(0, Math.min(5, Number(avg))) : 0;
  const n = Math.round(num * 2) / 2; // permite .5
  const full = Math.floor(n);
  const half = n - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
  <span className="stars" aria-label={`Nota ${num} de 5`} title={`Nota ${num} de 5`}>
    {"★".repeat(full)}
    {half ? "⯨" : ""}
    {"☆".repeat(empty)}
  </span>
);

};

// Monta URL absoluta para arquivos (ex.: "/uploads/..")
function toPublicUrlMaybe(src) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  const base = api?.defaults?.baseURL?.replace(/\/+$/, "") || "";
  const path = String(src).replace(/^\/+/, "");
  return base ? `${base}/${path}` : `/${path}`;
}

// Busca profunda por caminhos "a.b.c" e também tenta variações "nivel_mergulho" etc.
function deepGet(obj, path) {
  if (!obj || !path) return undefined;
  const parts = Array.isArray(path) ? path : String(path).split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

// normaliza número + sufixo " m" quando apropriado (evita "10 m m")
function asNumberWithSuffix(val, suffix = "") {
  if (val == null || val === "") return null;
  // se já é número
  if (typeof val === "number" && Number.isFinite(val)) {
    return `${val}${suffix}`;
  }
  const s = String(val).trim();
  // se já contém unidade, devolve como veio
  if (suffix.trim() && new RegExp(`\\b${suffix.trim()}\\b`, "i").test(s)) return s;
  // extrai número (ex.: "10m", "10 m", "10.5")
  const m = s.match(/-?\d+(?:[.,]\d+)?/);
  if (m) {
    const n = m[0].replace(",", ".");
    return `${n}${suffix}`;
  }
  // se não der pra converter, retorna string original
  return s;
}

// Busca inteligente por múltiplos caminhos e chaves equivalentes
function getMetricSmart(detail, options = []) {
  // options: array de caminhos (string "a.b") OU arrays de chaves equivalentes no mesmo nível
  for (const opt of options) {
    if (Array.isArray(opt)) {
      // várias chaves equivalentes no mesmo nível do detail
      for (const k of opt) {
        const v = detail?.[k];
        if (v !== undefined && v !== null && `${v}` !== "") return v;
      }
    } else if (typeof opt === "string") {
      const v = deepGet(detail, opt);
      if (v !== undefined && v !== null && `${v}` !== "") return v;
    }
  }
  return null;
}
/* ---------- Galeria de Imagens ---------- */
function extractImages(detail) {
  if (!detail) return [];
  const candidates =
    detail.images ??
    detail.fotos ??
    detail.photos ??
    detail.galeria ??
    detail.gallery ??
    detail.pictures ??
    detail.imagens ??
    detail.midias ??
    detail.media ??
    [];

  const singleCandidates = [
    detail.coverImage, detail.cover, detail.capa, detail.image, detail.imagem,
    detail.photo, detail.photoUrl, detail.picture, detail.banner, detail.thumb, detail.thumbnail,
  ].filter(Boolean);

  let arr = [];
  if (Array.isArray(candidates)) arr = candidates;
  else if (typeof candidates === "string" || typeof candidates === "object") arr = [candidates];

  arr = [...singleCandidates, ...arr];

  const norm = arr.map((it) => {
    if (!it) return null;
    if (typeof it === "string") {
      const src = toPublicUrlMaybe(it);
      return src ? { src, alt: "Foto do local de mergulho" } : null;
    }
    if (typeof it === "object") {
      const srcRaw = it.url ?? it.src ?? it.path ?? it.link ?? it.photoUrl ?? it.image ?? it.imagem ?? null;
      const src = toPublicUrlMaybe(srcRaw);
      const alt = toSafeStr(it.alt ?? it.caption ?? it.title ?? detail?.name ?? "Foto do local de mergulho");
      return src ? { src, alt } : null;
    }
    return null;
  }).filter(Boolean);

  const seen = new Set();
  return norm.filter((x) => (seen.has(x.src) ? false : (seen.add(x.src), true)));
}

function ImageGallery({ detail }) {
  const imgs = extractImages(detail);
  const [idx, setIdx] = useState(0);

  useEffect(() => { setIdx(0); }, [detail]);

  const next = () => setIdx((p) => (imgs.length ? (p + 1) % imgs.length : 0));
  const prev = () => setIdx((p) => (imgs.length ? (p - 1 + imgs.length) % imgs.length : 0));

  const current = imgs[idx];

  return (
    <>
      <div style={modalCss.media}>
        {current ? (
          <img src={current.src} alt={current.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ color: "#94a3b8", fontSize: ".95rem", textAlign: "center", padding: 20 }}>
            Sem imagens cadastradas para este local.
          </div>
        )}

        {imgs.length > 1 && (
          <>
            <button type="button" aria-label="Imagem anterior" onClick={prev} style={{ ...modalCss.navBtn, ...modalCss.navPrev }}>←</button>
            <button type="button" aria-label="Próxima imagem" onClick={next} style={{ ...modalCss.navBtn, ...modalCss.navNext }}>→</button>
          </>
        )}
      </div>

      {imgs.length > 1 && (
        <div style={modalCss.thumbsWrap}>
          {imgs.map((im, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={`Ir para imagem ${i + 1}`} style={modalCss.thumb(i === idx)}>
              <img src={im.src} alt="" style={modalCss.img} />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
/* ---------- Modal de Detalhes ---------- */
function SpotModal({
  open, onClose, detail, selectedId,
  getMetric, getDetailTitle, getDetailLoc, getDetailDesc, getDetailTags, getDetailReviews, getDetailRating
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev || "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const hasImages = extractImages(detail).length > 0;

  return (
    <div
      ref={overlayRef}
      style={modalCss.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes do ponto de mergulho"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div style={hasImages ? modalCss.dialog : modalCss.dialogSingleCol}>
        {hasImages && (
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <ImageGallery detail={detail} />
          </div>
        )}

        <div style={modalCss.right}>
          <button type="button" aria-label="Fechar" onClick={onClose} style={modalCss.close}>✕</button>

          <div style={modalCss.title}>{getDetailTitle(detail) || "Detalhes do local"}</div>
          <div style={{ ...modalCss.muted, marginTop: 2 }}>{getDetailLoc(detail)}</div>

          {(getDetailRating(detail) || getDetailRating(detail) === 0) && (
            <div className="modal-rating" style={modalCss.rating}>
  {renderStars(getDetailRating(detail))}
  <b>{Number(getDetailRating(detail)).toFixed(1)}</b>
</div>

          )}

          {/* ==== MÉTRICAS ==== */}
          <div style={modalCss.metaRow}>
            {/* Nível de mergulho */}
            <div style={modalCss.metaItem}>
              <div style={modalCss.muted}>Nível de mergulho</div>
              <div>
                {(() => {
                  const raw =
                    detail?.averageDifficulty ??
                    detail?.diveLevel ??
                    detail?.nivelMergulho ??
                    detail?.nivel_mergulho ??
                    detail?.nivel ??
                    detail?.level ??
                    detail?.nivelHabilitacao ??
                    detail?.nivelDificuldade ??
                    detail?.difficulty ??
                    detail?.dificuldade ??
                    detail?.requirements?.level ??
                    detail?.requisitos?.nivel ??
                    detail?.meta?.level ??
                    detail?.meta?.nivel ??
                    detail?.info?.level ??
                    detail?.info?.nivel ??
                    null;

                  if (typeof raw === "string" && raw.trim()) return raw;

                  const n = Number(raw);
                  if (Number.isFinite(n)) {
                    const map = ["Alto", "Moderado", "Baixa"];
                    return map[Math.max(0, Math.min(4, Math.round(n)))] || String(n);
                  }

                  return "—";
                })()}
              </div>
            </div>

            {/* Visibilidade */}
            <div style={modalCss.metaItem}>
              <div style={modalCss.muted}>Visibilidade</div>
              <div>
                {(() => {
                  const v =
                    detail?.visibility ??
                    detail?.visibilidade ??
                    detail?.viz ??
                    detail?.waterVisibility ??
                    detail?.vizAgua ??
                    detail?.conditions?.visibility ??
                    detail?.condicoes?.visibilidade ??
                    detail?.meta?.visibility ??
                    detail?.info?.visibility ??
                    null;

                  if (v == null || v === "") return "—";
                  if (typeof v === "string") {
                    const hasNumber = /-?\d+(?:[.,]\d+)?/.test(v);
                    if (!hasNumber) return v;          // "Alto"
                    if (/\bm\b/i.test(v)) return v;     // já tem "m"
                    const num = v.match(/-?\d+(?:[.,]\d+)?/)[0].replace(",", ".");
                    return `${num} m`;
                  }
                  if (typeof v === "number" && Number.isFinite(v)) return `${v} m`;
                  return String(v);
                })()}
              </div>
            </div>
          </div>

          {/* Características */}
          {getDetailTags(detail).length > 0 && (
            <>
              <h3 style={modalCss.h3}>Características</h3>
              <div>
                {getDetailTags(detail).map((t, i) => (
                  <span key={i} style={modalCss.pill}>{t}</span>
                ))}
              </div>
            </>
          )}

          {/* Sobre */}
          {getDetailDesc(detail) && (
            <>
              <h3 style={modalCss.h3}>Sobre o local</h3>
              <p style={{ marginTop: 6, color: "#111827", lineHeight: 1.5 }}>
                {getDetailDesc(detail)}
              </p>
            </>
          )}

          {/* CTA → Login */}
          {selectedId && (
            <div style={{ marginTop: 14 }}>
              <Link to="/login" className="popup-link">
                Ver todas as informações e avaliações →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* =========================
 *          HOME
 * ========================= */
export default function Home() {
  /* ======= ESTADO DA PÁGINA ======= */
  const [spots, setSpots] = useState([]);            // lista de pontos de mergulho
  const [query, setQuery] = useState("");            // termo de busca
  const [loading, setLoading] = useState(true);      // carregando API
  const [error, setError] = useState(null);          // erro da API (se houver)
  const [selected, setSelected] = useState(null);    // id do spot selecionado (para destaque)

  /* ======= DETALHES (modal) ======= */
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  /* ======= ESTADO DO MAPA ======= */
  const [mapCenter, setMapCenter] = useState({ lat: -14.235, lng: -51.9253 }); // Brasil
  const [zoom, setZoom] = useState(4);

  /* ======= EFEITO: HEADER STICKY COM SOMBRA AO ROLAR ======= */
  useEffect(() => {
    const headerEl = document.querySelector(".header");
    const onScroll = () => {
      if (!headerEl) return;
      headerEl.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ======= EFEITO: CARREGAR SPOTS ======= */
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    api
      .get("/api/divingSpots")
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        if (mounted) setSpots(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (mounted) setError(err?.message || "Erro ao carregar spots");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  /* ======= MEMO: FILTRAR SPOTS (robusto) ======= */
  const filtered = useMemo(() => {
    const q = toSafeStr(query).trim().toLowerCase();
    if (!q) return spots;

    return spots.filter((s) => {
      if (!s || typeof s !== "object") return false;

      const nameRaw = s.name ?? s.nome ?? s.title ?? "";
      const locRaw  = s.location ?? s.local ?? s.city ?? s.cidade ?? "";
      const tagsRaw = s.tags ?? s.etiquetas ?? s.categorias ?? "";
      const descRaw = s.description ?? s.descricao ?? "";

      const name = toSafeStr(nameRaw).toLowerCase();
      const loc  = toSafeStr(locRaw).toLowerCase();
      const tags = toSafeStr(tagsRaw).toLowerCase();
      const desc = toSafeStr(descRaw).toLowerCase();

      return name.includes(q) || loc.includes(q) || tags.includes(q) || desc.includes(q);
    });
  }, [spots, query]);

  /* ======= BUSCA: CENTRALIZA NO 1º RESULTADO ======= */
  const handleSearch = () => {
    const first = filtered.find((s) => getCoords(s));
    if (first) {
      const c = getCoords(first);
      setMapCenter(c);
      setZoom(10);
      setSelected(first.id || first._id || first.uuid || first.name);
    }
  };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  /* ======= DETALHES: buscar quando selected muda ======= */
  useEffect(() => {
    if (!selected) return;
    const base = "/api/divingSpots";
    const alt  = "/api/spots";

    const fetchDetails = async () => {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(true);
      try {
        // tenta endpoint principal
        let { data } = await api.get(`${base}/${selected}`);
        let payload = data?.data || data;
        // fallback se vier vazio
        if (!payload || (typeof payload === "object" && Object.keys(payload).length === 0)) {
          const altRes = await api.get(`${alt}/${selected}`);
          payload = altRes?.data?.data || altRes?.data;
        }
        // se mesmo assim não veio, tenta achar na lista já carregada
        if (!payload) {
          const fromList = spots.find(
            (s) => (s.id || s._id || s.uuid || s.name) === selected
          );
          payload = fromList || null;
        }
        setDetail(payload || null);
        setModalOpen(true); // <<< abre o modal
      } catch (e) {
        setDetailError(e?.message || "Falha ao carregar detalhes.");
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetails();
  }, [selected, spots]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ======= SCROLL SUAVE PARA SEÇÕES ======= */
  const scrollTo = (id) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ======= DERIVADOS DO DETAIL ======= */
  const getDetailTitle = (d) => toSafeStr(d?.name ?? d?.nome ?? d?.title ?? "");
  const getDetailLoc   = (d) => toSafeStr(d?.location ?? d?.local ?? d?.city ?? d?.cidade ?? "");
  const getDetailDesc  = (d) => toSafeStr(d?.description ?? d?.descricao ?? d?.sobre ?? "");

  const getDetailRating = (d) =>
    d?.avgRating ?? d?.ratingAvg ?? d?.reviews?.avg ?? d?.mediaAval ?? d?.averageRating ?? null;

  const getDetailTags = (d) =>
    (Array.isArray(d?.tags) ? d.tags : (Array.isArray(d?.categorias) ? d.categorias : [])).map(toSafeStr);

  const getDetailReviews = (d) => {
    const arr =
      (Array.isArray(d?.reviews) ? d.reviews : null) ??
      (Array.isArray(d?.avaliacoes) ? d.avaliacoes : null) ??
      (Array.isArray(d?.comments) ? d.comments : null) ??
      null;
    return Array.isArray(arr) ? arr : [];
  };

  const getMetric = (d, keys, suffix = "") => {
    for (const k of keys) {
      const v = d?.[k];
      if (v !== undefined && v !== null && `${v}` !== "") {
        return `${v}${suffix}`;
      }
    }
    return "—";
  };

  return (
    <>
      {/* ================== HEADER ================== */}
      <header className="header">
        <div className="header-left">
          <img
            src="/images/logo-atlantida.png"
            alt="Atlântida"
            style={{ height: 40, width: "auto", objectFit: "contain" }}
          />
        </div>

        <div className="header-nav-group">
          <nav className="header-center">
            <a
              href="#artigos"
              className="link link-ghost"
              onClick={(e) => { e.preventDefault(); scrollTo("artigos"); }}
            >
              Artigos
            </a>
            <a
              href="#terms-preview"
              className="link link-ghost"
              onClick={(e) => { e.preventDefault(); scrollTo("terms-preview"); }}
            >
              Termos
            </a>
            <Link to="/sobre" className="link link-ghost">Sobre nós</Link>
          </nav>
          <a
            href="#app-download"
            className="link-cta"
            onClick={(e) => { e.preventDefault(); scrollTo("app-download"); }}
          >
            DOWNLOAD DO APP
          </a>
        </div>
      </header>

      {/* ================== HERO ================== */}
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">
            Gerencie seus mergulhos
            <br />
            com facilidade e eficiência
            <span className="hero-dot">.</span>
          </h1>

        <p className="hero-sub">
            Planeje, organize e registre seus mergulhos. Encontre pontos de
            mergulho e compartilhe suas experiências.
          </p>

          <Link to="/login" className="hero-button">
            COMECE SUA AVENTURA AGORA!
          </Link>

          <div className="hero-footer">
            <span style={{ fontSize: 22, transform: "translateY(-2px)" }}>↓</span>
            <span>Continue explorando</span>
          </div>
        </div>
      </section>

      {/* ================== LOCAIS DE MERGULHO ================== */}
      <section className="spots-section">
        <div className="spots-head">
          <h3 className="spots-kicker">LOCAIS DE MERGULHO</h3>
          <h2 className="spots-title">
            Explore novos locais de mergulho e veja
            <br />
            o que outros usuários estão dizendo.
          </h2>

          {/* Barra de busca */}
          <div className="search-bar">
            <span className="search-ico" aria-hidden="true"></span>
            <input
              type="text"
              placeholder="Explore por novos locais aqui!"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Buscar locais de mergulho"
            />
            <button className="search-btn" onClick={handleSearch} aria-label="Buscar">
              Buscar
            </button>
          </div>

          {/* Estados */}
          {loading && (
            <div style={{ maxWidth: 600, margin: "16px auto" }}>
              <div className="skel" />
              <div className="skel" style={{ marginTop: 8 }} />
            </div>
          )}
          {error && (
            <div
              role="alert"
              style={{
                maxWidth: 600,
                margin: "16px auto",
                padding: 12,
                border: "1px solid #fee2e2",
                borderRadius: 8,
                background: "#fef2f2",
                color: "#991b1b",
              }}
            >
              Falha ao carregar os locais.{" "}
              <button onClick={() => window.location.reload()}>Tentar novamente</button>
            </div>
          )}

          {/* Aviso quando nenhum ponto tem coordenadas válidas */}
          {!loading && !error && filtered.every((s) => !getCoords(s)) && (
            <div style={{ maxWidth: 600, margin: "12px auto", color: "#6b7280" }}>
              Nenhum ponto com coordenadas válidas para exibir no mapa.
            </div>
          )}
        </div>

        {/* === Mapa === */}
        <div className="spots-hero">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={zoom}
            className="spots-map"
            style={{ height: 420, width: "100%" }}
            whenCreated={(m) => setTimeout(() => m.invalidateSize(), 150)}
            scrollWheelZoom
          >
            <AutoResizeMap />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {filtered
              .map((s) => ({ s, c: getCoords(s) }))
              .filter((x) => x.c)
              .map(({ s, c }) => {
                const id =
                  s.id || s._id || s.uuid || s.name || `${c.lat.toFixed(6)},${c.lng.toFixed(6)}`;
                const isActive = selected === id;

                // campos comuns para avaliações
                const avg =
                  s.avgRating ??
                  s.ratingAvg ??
                  s.mediaAval ??
                  s.reviews?.avg ??
                  s.averageRating ??
                  null;
                const count =
                  s.reviewsCount ??
                  s.numReviews ??
                  s.reviews?.count ??
                  (Array.isArray(s.comments) ? s.comments.length : null) ??
                  (Array.isArray(s.avaliacoes) ? s.avaliacoes.length : null);

                return (
                  <CircleMarker
                    key={id}
                    center={[c.lat, c.lng]}
                    radius={isActive ? 9 : 6}
                    pathOptions={{
                      color: isActive ? "#2563eb" : "#0ea5e9",
                      fillColor: isActive ? "#2563eb" : "#0ea5e9",
                      fillOpacity: 0.7,
                    }}
                    eventHandlers={{
                      click: () => setSelected(id),
                    }}
                  >
                  </CircleMarker>
                );
              })}
          </MapContainer>
        </div>
      </section>

      {/* ================== APP (iOS & ANDROID), ARTIGOS, TERMOS, FOOTER — mantidos iguais ================== */}
      <section className="app-section" id="app-download">
        <p className="app-kicker">APLICATIVO iOS E ANDROID</p>
        <h2 className="app-title">
          Todos os seus mergulhos
          <br />a um toque de distância.
        </h2>

        <div className="app-visual">
          <img className="app-reef" src="/images/landing/reef.svg" alt="" aria-hidden="true" />
          <img
            className="app-phone"
            src="/images/app/imagem-celular.png"
            alt="Tela do app Atlântida mostrando um mergulho"
            loading="lazy"
          />
        </div>

        <div className="app-stores">
          <a className="store-btn" href="#" aria-label="Download via Apple Store">
            <img src="/images/app/btn-apple-store.svg" alt="Baixar na App Store" />
          </a>
          <a className="store-btn" href="#" aria-label="Download via Google Play">
            <img src="/images/app/btn-apple-store.svg" alt="Disponível no Google Play" />
          </a>
        </div>

        <ul className="app-steps">
          <li className="step">
            <span className="ico" aria-hidden="true"></span>
            <span className="step-bullet">01</span>
            <h3 className="step-title">Baixe o aplicativo</h3>
            <p className="step-text">É gratuito. Baixe pela Apple Store ou Google Play.</p>
          </li>

          <li className="step">
            <span className="ico" aria-hidden="true"></span>
            <span className="step-bullet">02</span>
            <h3 className="step-title">Faça seu cadastro</h3>
            <p className="step-text">É rápido e simples. Crie sua conta em menos de 2 minutos.</p>
          </li>

          <li className="step">
            <span className="ico" aria-hidden="true"></span>
            <span className="step-bullet">03</span>
            <h3 className="step-title">Pronto!</h3>
            <p className="step-text">O app está preparado para seus novos mergulhos. E você?</p>
          </li>
        </ul>
      </section>

      <section id="artigos" className="articles-section">
        <div className="articles-head">
          <span className="articles-kicker">MERGULHO RESPONSÁVEL</span>
          <h2 className="articles-title">
            Descubra Como Proteger os Oceanos
            <br />
            Enquanto Aproveita a Beleza Subaquática.
          </h2>
        </div>

        <ul className="articles-grid">
          <li className="article-card">
            <Link to="/artigos/mergulho-responsavel" className="article-link">
              <div
                className="article-cover"
                style={{ backgroundImage: 'url("/images/articles/mergulho-responsavel.jpg")' }}
              />
              <div className="article-body">
                <h3 className="article-title">7 Práticas essenciais para um Mergulho Responsável</h3>
                <div className="article-meta">
                  <time>17 de Julho de 2024</time>
                  <span className="spacer" />
                  <span className="badge">Ler artigo</span>
                </div>
              </div>
            </Link>
          </li>

          <li className="article-card">
            <Link to="/artigos/negligencia-dos-oceanos" className="article-link">
              <div
                className="article-cover"
                style={{ backgroundImage: 'url("/images/articles/negligencia-no-oceano.jpg")' }}
              />
              <div className="article-body">
                <h3 className="article-title">O Impacto Devastador da Negligência dos Oceanos</h3>
                <div className="article-meta">
                  <time>22 de Agosto de 2024</time>
                  <span className="spacer" />
                  <span className="badge badge--green">Artigo popular</span>
                </div>
              </div>
            </Link>
          </li>

          <li className="article-card">
            <Link to="/artigos/missao-dos-mergulhadores" className="article-link">
              <div
                className="article-cover"
                style={{ backgroundImage: 'url("/images/articles/proteger-o-oceano.jpg")' }}
              />
              <div className="article-body">
                <h3 className="article-title">Proteger os Oceanos: A Missão dos Mergulhadores</h3>
                <div className="article-meta">
                  <time>11 de Setembro de 2020</time>
                  <span className="spacer" />
                  <span className="badge badge--green">Artigo popular</span>
                </div>
              </div>
            </Link>
          </li>
        </ul>
      </section>

      <section id="terms-preview" className="terms-preview">
        <div className="terms-preview-head">
          <span className="terms-preview-kicker">LEITURA RECOMENDADA</span>
          <h2 className="terms-preview-title">Termos de Uso e Política de Privacidade</h2>
          <p className="terms-preview-sub">
            Entenda como cuidamos dos seus dados e o que esperamos no uso da plataforma.
          </p>
        </div>

        <div className="terms-preview-card">
          <div className="terms-preview-media" />
          <div className="terms-preview-body">
            <h3>Transparência e segurança em primeiro lugar</h3>
            <ul className="terms-preview-list">
              <li>Como coletamos e utilizamos seus dados</li>
              <li>Seus direitos de acesso e exclusão</li>
              <li>Boas práticas e uso responsável da plataforma</li>
            </ul>
            <Link to="/termos" className="terms-preview-cta">
              Ler Termos de Uso e Privacidade
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <img src="/images/logo-atlantida.png" alt="Atlântida" className="footer-logo" />
          <button
            className="footer-back"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" }) }
          >
            ↑ <span>Voltar ao topo</span>
          </button>
        </div>

        <hr className="footer-sep" />

        <div className="footer-bottom">
          <p className="footer-copy">
            Copyright © {new Date().getFullYear()} - Atlântida App Mergulhos - Todos os
            direitos reservados
          </p>
          <Link to="/termos" className="footer-link">Termos de uso</Link>
        </div>
      </footer>

      {/* ===== MODAL DE DETALHES ===== */}
      <SpotModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        detail={detail}
        selectedId={selected}
        getMetric={getMetric}
        getDetailTitle={getDetailTitle}
        getDetailLoc={getDetailLoc}
        getDetailDesc={getDetailDesc}
        getDetailTags={getDetailTags}
        getDetailReviews={getDetailReviews}
        getDetailRating={getDetailRating}
      />

      {/* Feedback durante o carregamento/erro de detalhes */}
      {detailLoading && modalOpen && (
        <div style={{
          position:"fixed", inset:0, zIndex:80, display:"grid", placeItems:"center",
          pointerEvents:"none"
        }}>
          <div style={{ background:"rgba(255,255,255,.9)", padding:12, borderRadius:8, border:"1px solid #e5e7eb" }}>
            Carregando detalhes...
          </div>
        </div>
      )}
      {detailError && modalOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:80, display:"grid", placeItems:"center" }}>
          <div role="alert" style={{ background:"#fef2f2", color:"#991b1b", padding:12, borderRadius:8, border:"1px solid #fee2e2" }}>
            {detailError}
          </div>
        </div>
      )}
    </>
  );
}
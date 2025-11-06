import React, { useEffect, useMemo, useState } from "react";
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

/* ---------- Estilos inline simples para o painel (sem mexer no seu CSS) ---------- */
const panelStyles = {
  wrap: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "min(420px, 96vw)",
    height: "100vh",
    background: "#fff",
    borderLeft: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,.15)",
    zIndex: 60,
    display: "flex",
    flexDirection: "column",
    transform: "translateX(0)",
  },
  header: {
    padding: "14px 16px",
    borderBottom: "1px solid #eef2f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  body: {
    padding: 16,
    overflowY: "auto",
  },
  closeBtn: {
    background: "transparent",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
  },
  metaRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginTop: 8,
  },
  metaItem: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: ".92rem",
    color: "#111827",
    background: "#fafafa",
  },
  rating: { marginTop: 8, fontSize: ".95rem", color: "#111827" },
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
  muted: { color: "#6b7280" },
};

export default function Home() {
  /* ======= ESTADO DA PÁGINA ======= */
  const [spots, setSpots] = useState([]);            // lista de pontos de mergulho
  const [query, setQuery] = useState("");            // termo de busca
  const [loading, setLoading] = useState(true);      // carregando API
  const [error, setError] = useState(null);          // erro da API (se houver)
  const [selected, setSelected] = useState(null);    // id do spot selecionado (para destaque)

  /* ======= DETALHES DO SPOT (painel) ======= */
  const [panelOpen, setPanelOpen] = useState(false);
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

  /* ======= UTIL: string segura ======= */
  const toSafeStr = (v) => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    if (Array.isArray(v)) return v.map(toSafeStr).join(" ");
    if (typeof v === "object") {
      try {
        return Object.values(v)
          .map((x) => (typeof x === "object" ? "" : toSafeStr(x)))
          .join(" ");
      } catch {
        return "";
      }
    }
    return "";
  };

  /* ======= UTIL: normalização de coordenadas ======= */
  const parseNum = (v) => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = parseFloat(v.replace(",", "."));
      return Number.isNaN(n) ? null : n;
    }
    return null;
  };

  const getCoords = (s = {}) => {
    // 1) lat/lng diretos (number ou string)
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

    // 2) string "lat,lng"
    if ((lat == null || lng == null) && typeof s.coords === "string") {
      const [a, b] = s.coords.split(/[,; ]+/).map((x) => parseNum(x));
      if (a != null && b != null) { lat = a; lng = b; }
    }

    // 3) arrays comuns: [lat, lng] OU [lng, lat]
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

    // 4) GeoJSON completo { type:'Point', coordinates:[lng, lat] }
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

  /* ======= MEMO: FILTRAR SPOTS (robusto) ======= */
  const filtered = useMemo(() => {
    const q = toSafeStr(query).trim().toLowerCase();
    if (!q) return spots;

    return spots.filter((s) => {
      if (!s || typeof s !== "object") return false;

      const nameRaw = s.name ?? s.nome ?? s.title ?? "";
      theconst = 0;
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

  /* ======= RENDER: ESTRELAS (resiliente) ======= */
  const renderStars = (avg = 0) => {
    const num = Number.isFinite(Number(avg)) ? Math.max(0, Math.min(5, Number(avg))) : 0;
    const n = Math.round(num * 2) / 2; // permite .5
    const full = Math.floor(n);
    const half = n - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <span aria-label={`Nota ${num} de 5`} title={`Nota ${num} de 5`}>
        {"★".repeat(full)}
        {half ? "⯨" : ""}
        {"☆".repeat(empty)}
      </span>
    );
  };

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
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  /* ======= DETALHES: buscar quando selected muda ======= */
  useEffect(() => {
    if (!selected) return;
    const base = "/api/divingSpots";
    const alt  = "/api/spots";

    const fetchDetails = async () => {
      setPanelOpen(true);
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
      } catch (e) {
        setDetailError(e?.message || "Falha ao carregar detalhes.");
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetails();
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

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
                    <Popup>
                      <div className="popup-spot">
                        <strong className="popup-title">{toSafeStr(s.name ?? s.nome)}</strong>
                        <div className="popup-loc">{toSafeStr(s.location ?? s.local ?? "")}</div>

                        {(avg || avg === 0) && (
                          <div className="popup-rating">
                            {renderStars(avg)} <b>{Number(avg).toFixed(1)}</b>
                            {typeof count === "number" ? (
                              <span className="popup-reviews"> • {count} avaliações</span>
                            ) : null}
                          </div>
                        )}

                        <div style={{ display:"flex", gap:10, marginTop:6 }}>
                          <button
                            className="popup-link"
                            onClick={() => setSelected(id)}
                            style={{ cursor:"pointer" }}
                          >
                            Ver no painel →
                          </button>
                          <Link
                            to={`/spots/${id}`}
                            className="popup-link"
                            aria-label="Ver detalhes e avaliações"
                          >
                            Página completa →
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
          </MapContainer>
        </div>
      </section>

      {/* ================== APP (iOS & ANDROID) ================== */}
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
            <p className="step-text">
              É gratuito. Baixe pela Apple Store ou Google Play.
            </p>
          </li>

          <li className="step">
            <span className="ico" aria-hidden="true"></span>
            <span className="step-bullet">02</span>
            <h3 className="step-title">Faça seu cadastro</h3>
            <p className="step-text">
              É rápido e simples. Crie sua conta em menos de 2 minutos.
            </p>
          </li>

          <li className="step">
            <span className="ico" aria-hidden="true"></span>
            <span className="step-bullet">03</span>
            <h3 className="step-title">Pronto!</h3>
            <p className="step-text">
              O app está preparado para seus novos mergulhos. E você?
            </p>
          </li>
        </ul>
      </section>

      {/* ================== ARTIGOS (Prévia) ================== */}
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
                <h3 className="article-title">
                  7 Práticas essenciais para um Mergulho Responsável
                </h3>
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
                <h3 className="article-title">
                  O Impacto Devastador da Negligência dos Oceanos
                </h3>
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
                <h3 className="article-title">
                  Proteger os Oceanos: A Missão dos Mergulhadores
                </h3>
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

      {/* ================== TERMOS (Prévia) ================== */}
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

      {/* ================== FOOTER ================== */}
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
          <Link to="/termos" className="footer-link">
            Termos de uso
          </Link>
        </div>
      </footer>

      {/* ================== PAINEL LATERAL DE DETALHES ================== */}
      {panelOpen && (
        <aside style={panelStyles.wrap} role="dialog" aria-label="Detalhes do ponto de mergulho">
          <div style={panelStyles.header}>
            <strong style={{ fontSize: "1rem" }}>
              {getDetailTitle(detail) || "Detalhes do local"}
            </strong>
            <div style={{ display: "flex", gap: 8 }}>
              {selected && (
                <Link to={`/spots/${selected}`} className="link" style={{ padding: "6px 10px" }}>
                  Página completa
                </Link>
              )}
              <button
                onClick={() => { setPanelOpen(false); setSelected(null); }}
                style={panelStyles.closeBtn}
                aria-label="Fechar painel"
              >
                ✕
              </button>
            </div>
          </div>

          <div style={panelStyles.body}>
            {detailLoading && (
              <>
                <div className="skel" />
                <div className="skel" style={{ marginTop: 8 }} />
                <div className="skel" style={{ marginTop: 8 }} />
              </>
            )}

            {detailError && (
              <div
                role="alert"
                style={{
                  padding: 12,
                  border: "1px solid #fee2e2",
                  borderRadius: 8,
                  background: "#fef2f2",
                  color: "#991b1b",
                }}
              >
                {detailError}
              </div>
            )}

            {!detailLoading && !detailError && detail && (
              <>
                <div style={{ color: "#64748b", marginTop: 2 }}>{getDetailLoc(detail)}</div>

                {/* Rating */}
                {(getDetailRating(detail) || getDetailRating(detail) === 0) && (
                  <div style={panelStyles.rating}>
                    {renderStars(getDetailRating(detail))}{" "}
                    <b>{Number(getDetailRating(detail)).toFixed(1)}</b>
                  </div>
                )}

                {/* Métricas (profundidade, visibilidade, temperatura, correnteza, dificuldade) */}
                <div style={panelStyles.metaRow}>
                  <div style={panelStyles.metaItem}>
                    <div style={panelStyles.muted}>Profundidade</div>
                    <div>{getMetric(detail, ["depth", "profundidade", "maxDepth"], " m")}</div>
                  </div>
                  <div style={panelStyles.metaItem}>
                    <div style={panelStyles.muted}>Visibilidade</div>
                    <div>{getMetric(detail, ["visibility", "visibilidade"], " m")}</div>
                  </div>
                  <div style={panelStyles.metaItem}>
                    <div style={panelStyles.muted}>Temperatura</div>
                    <div>{getMetric(detail, ["temperature", "tempAgua", "temperatura"], "°C")}</div>
                  </div>
                  <div style={panelStyles.metaItem}>
                    <div style={panelStyles.muted}>Correntes</div>
                    <div>{getMetric(detail, ["currents", "correntes"], "")}</div>
                  </div>
                </div>

                {/* Dificuldade */}
                <div style={{ marginTop: 10 }}>
                  <span style={panelStyles.muted}>Dificuldade: </span>
                  <b>{getMetric(detail, ["difficulty", "dificuldade"], "")}</b>
                </div>

                {/* Tags */}
                {getDetailTags(detail).length > 0 && (
                  <>
                    <h3 style={panelStyles.h3}>Características</h3>
                    <div>
                      {getDetailTags(detail).map((t, i) => (
                        <span key={i} style={panelStyles.pill}>{t}</span>
                      ))}
                    </div>
                  </>
                )}

                {/* Descrição */}
                {getDetailDesc(detail) && (
                  <>
                    <h3 style={panelStyles.h3}>Sobre o local</h3>
                    <p style={{ marginTop: 6, color: "#111827", lineHeight: 1.5 }}>
                      {getDetailDesc(detail)}
                    </p>
                  </>
                )}

                {/* Avaliações */}
                <h3 style={panelStyles.h3}>Avaliações</h3>
                {getDetailReviews(detail).length === 0 && (
                  <div style={panelStyles.muted}>Ainda não há avaliações.</div>
                )}
                {getDetailReviews(detail).slice(0, 8).map((r, idx) => {
                  const user = toSafeStr(r?.user?.name ?? r?.autor ?? r?.userName ?? "Anônimo");
                  const txt  = toSafeStr(r?.text ?? r?.comentario ?? r?.comment ?? "");
                  const score = r?.rating ?? r?.nota ?? r?.stars ?? null;
                  const date = toSafeStr(r?.date ?? r?.createdAt ?? "");
                  return (
                    <div key={idx} style={panelStyles.review}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>{user}</strong>
                        {score != null && (
                          <span>{renderStars(score)} <b>{Number(score).toFixed(1)}</b></span>
                        )}
                      </div>
                      {date && <div style={{ ...panelStyles.muted, fontSize: ".85rem" }}>{date}</div>}
                      {txt && <p style={{ margin: "6px 0 0" }}>{txt}</p>}
                    </div>
                  );
                })}

                {/* Link para página completa */}
                {selected && (
                  <div style={{ marginTop: 14 }}>
                    <Link to={`/spots/${selected}`} className="popup-link">
                      Ver todas as informações e avaliações →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      )}
    </>
  );
}

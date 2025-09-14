import React, { memo, useEffect, useMemo, useRef, useState } from "react";
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
function SectionTitle({ children }) {
  return <h2 className="dash__sectionTitle">{children}</h2>;
}

/* ---------- Img fallback ---------- */
function PublicImg({ candidates, alt = "", className = "", style }) {
  const [idx, setIdx] = useState(0);
  const src = candidates[Math.min(idx, candidates.length - 1)];
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => { if (idx < candidates.length - 1) setIdx(i => i + 1); }}
    />
  );
}

/* ---------- Stars ---------- */
function StarRating({ value = 0, size = 14 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="stars" style={{ fontSize: size }}>
      {"★★★★★".split("").map((ch, i) => (
        <span key={i} className={i < Math.round(v) ? "on" : ""}>★</span>
      ))}
      <span className="stars__val">{v ? v.toFixed(1) : "—"}</span>
    </span>
  );
}

/* =========================================
 * Leaflet loader (CDN)
 * ========================================= */
const ensureLeaflet = () =>
  new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const jsId = "leaflet-js";
    if (document.getElementById(jsId)) {
      document.getElementById(jsId).addEventListener("load", () => resolve(window.L));
      return;
    }
    const script = document.createElement("script");
    script.id = jsId;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });

/* =========================================
 * Mapa de Spots (modo painel)
 * ========================================= */
function SpotsMap({ spots = [], selectedId, onSelectSpot, onPickLatLon }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const pickMarkerRef = useRef(null);

  // init
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await ensureLeaflet();
      if (cancelled || mapRef.current) return;

      const map = L.map(mapEl.current, {
        center: [-14.235, -51.925],
        zoom: 4,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // click → preenche lat/lon do formulário
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (onPickLatLon) onPickLatLon(lat, lng);
        if (pickMarkerRef.current) pickMarkerRef.current.setLatLng([lat, lng]);
        else pickMarkerRef.current = L.marker([lat, lng]).addTo(map);
      });

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    })();

    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [onPickLatLon]);

  // render markers
  useEffect(() => {
    (async () => {
      const L = await ensureLeaflet();
      const map = mapRef.current;
      const layer = markersLayerRef.current;
      if (!map || !layer) return;

      layer.clearLayers();
      const bounds = L.latLngBounds();

      spots.forEach((s) => {
        const [lon, lat] = s?.location?.coordinates || [];
        if (typeof lat === "number" && typeof lon === "number") {
          const m = L.marker([lat, lon]).addTo(layer);
          m.on("click", () => onSelectSpot && onSelectSpot(s));
          bounds.extend([lat, lon]);
          if (String(s._id) === String(selectedId)) {
            setTimeout(() => m.openPopup(), 0);
          }
          const title = s.name || "Ponto de mergulho";
          const ratingTxt = typeof s.avgRating === "number" ? `⭐ ${s.avgRating.toFixed(1)}` : "";
          m.bindPopup(`<strong>${title}</strong><br/>${ratingTxt}`);
        }
      });

      if (spots.length > 0 && bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2));
      }
    })();
  }, [spots, selectedId, onSelectSpot]);

  // focus no selecionado
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const s = spots.find((x) => String(x._id) === String(selectedId));
    const [lon, lat] = s?.location?.coordinates || [];
    if (typeof lat === "number" && typeof lon === "number") {
      mapRef.current.setView([lat, lon], Math.max(mapRef.current.getZoom(), 7), { animate: true });
    }
  }, [selectedId, spots]);

  return <div className="spots__mapPanel" ref={mapEl} role="img" aria-label="Mapa com pontos de mergulho" />;
}

/* small helpers */
const fmtDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
};
const diveLogPhotos = (log) =>
  Array.isArray(log?.photos)
    ? log.photos
        .slice(0, 4)
        .map((p, i) =>
          p?.data && p?.contentType
            ? `data:${p.contentType};base64,${p.data}`
            : null
        )
        .filter(Boolean)
    : [];

/* =====================================================
 * Página: Locais de mergulho (explorar + cadastrar)
 * ===================================================*/
export default function Spots() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());

  // lista de spots
  const [spots, setSpots] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(true);

  // seleção/UX
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("info"); // info | reviews

  // reviews (dive logs) do spot selecionado
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsErr, setReviewsErr] = useState("");

  // form state (cadastro)
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]); // [{file, url}]
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  // hidrata usuário
  useEffect(() => {
    if (!user) {
      me().then((u) => {
        setUser(u);
        try { localStorage.setItem("user", JSON.stringify(u)); } catch {}
      }).catch(() => {});
    }
  }, [user]);

  // busca spots existentes
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingSpots(true);
        const data = await apiFetch("/api/divingSpots", { auth: true });
        if (!active) return;
        const arr = Array.isArray(data) ? data : [];
        setSpots(arr);
        // seleciona primeiro por padrão
        if (arr.length && !selected) setSelected(arr[0]);
      } catch {
        if (active) setSpots([]);
      } finally {
        if (active) setLoadingSpots(false);
      }
    })();
    return () => { active = false; };
  }, []); // first render

  // quando muda o selecionado → carrega avaliações
  useEffect(() => {
    let active = true;
    if (!selected?._id) { setReviews([]); return; }
    (async () => {
      try {
        setLoadingReviews(true);
        setReviewsErr("");
        // 1ª tentativa: endpoint dedicado
        let data;
        try {
          data = await apiFetch(`/api/diveLogs/byDivingSpotId/${selected._id}`, { auth: true });
        } catch {
          // fallback: pega todos e filtra no client
          const all = await apiFetch("/api/diveLogs", { auth: true });
          data = (Array.isArray(all) ? all : []).filter((d) => {
            const id = d?.divingSpotId?._id || d?.divingSpotId;
            return String(id) === String(selected._id);
          });
        }
        if (!active) return;
        // ordena por data desc
        data.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        setReviews(data);
      } catch (e) {
        if (active) setReviewsErr(e?.message || "Falha ao carregar avaliações.");
      } finally {
        if (active) setLoadingReviews(false);
      }
    })();
    return () => { active = false; };
  }, [selected?._id]);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name || user?.email || "usuário";

  const handleLogout = () => { logout(); navigate("/login"); };

  /* ---------- Upload ---------- */
  const BASE = import.meta.env.BASE_URL || "/";
  const withBase = (p) => `${BASE}${p}`;
  const uploadCandidates = useMemo(
    () => [
      withBase("images/mini-icon/Upload.png"),
      withBase("images/mini-icon/upload.png"),
      withBase("images/Upload.png"),
      withBase("images/upload.png"),
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='42' height='42'><path d='M21 6l7 7h-5v10h-4V13h-5l7-7z' fill='%238A8A8A'/><rect x='8' y='32' width='26' height='3' rx='1.5' fill='%238A8A8A'/></svg>",
    ],
    [BASE]
  );

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList || []);
    const next = arr.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setFiles((prev) => [...prev, ...next]);
  };
  const onInputChange = (e) => handleFiles(e.target.files);
  const onDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };
  const onDragOver = (e) => e.preventDefault();
  const removeFile = (idx) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx]?.url);
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };
  useEffect(() => () => files.forEach(f => URL.revokeObjectURL(f.url)), []); // cleanup

  /* ---------- Helpers ---------- */
  const toNum = (v) => {
    if (v === "" || v == null) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const filesToBase64 = async (fileObjs) => {
    const read = (file) => new Promise((resolve, reject) => {
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
  };
  const fillWithGeolocation = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(6)));
        setLon(String(pos.coords.longitude.toFixed(6)));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  /* ---------- Submit novo spot ---------- */
  const handleSubmit = async (e) => {
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

      // recarrega spots para aparecer no painel
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
  };

  /* ---------- Derivados para a lista ---------- */
  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return spots;
    return spots.filter((s) => (s.name || "").toLowerCase().includes(q));
  }, [query, spots]);

  const thumbFromSpot = (s) => {
    const img = s?.image;
    if (img?.data && img?.contentType) {
      return `data:${img.contentType};base64,${img.data}`;
    }
    return "/images/map-thumb-placeholder.jpg";
  };

  /* ---------- UI ---------- */
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

        <button type="button" className="logged__logout" onClick={() => { logout(); navigate("/login"); }}>
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
              Explore as profundezas, descubra novas aventuras, classifique, avalie e compartilhe seus
              locais de mergulho favoritos.
            </p>
          </header>

          {/* ======== PAINEL DE EXPLORAÇÃO ======== */}
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
                    placeholder="Ilha, naufrágio…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <button className="spots__searchBtn" type="button" onClick={() => { /* no-op */ }}>🔍</button>
              </div>

              <div className="spots__list" role="list">
                {filtered.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    className={`spots__item${selected?._id === s._id ? " is-active" : ""}`}
                    onClick={() => { setSelected(s); setTab("info"); }}
                  >
                    <img className="spots__itemImg" src={thumbFromSpot(s)} alt="" />
                    <div className="spots__itemMeta">
                      <div className="spots__itemTitle">{s.name || "Ponto de mergulho"}</div>
                      <div className="spots__itemSub">
                        <StarRating value={s.avgRating ?? s.rating ?? 0} />
                      </div>
                    </div>
                  </button>
                ))}

                {!filtered.length && (
                  <div className="spots__empty">Nenhum local encontrado.</div>
                )}
              </div>
            </aside>

            {/* Detalhes do spot */}
            <section className="spots__details card">
              {selected ? (
                <>
                  <img className="spots__hero"
                       src={thumbFromSpot(selected)}
                       alt={selected.name || "Local de mergulho"} />
                  <div className="spots__detailsHead">
                    <div>
                      <h3 className="spots__title">{selected.name || "Local de mergulho"}</h3>
                      <StarRating value={
                        (reviews.length
                          ? (reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) / reviews.length)
                          : (selected.avgRating ?? 0))
                      } size={16} />
                    </div>
                    <div className="spots__tabs" role="tablist" aria-label="Abas">
                      <button
                        className={`spots__tab${tab === "info" ? " is-active" : ""}`}
                        onClick={() => setTab("info")}
                        role="tab"
                        aria-selected={tab === "info"}
                      >
                        Informações
                      </button>
                      <button
                        className={`spots__tab${tab === "reviews" ? " is-active" : ""}`}
                        onClick={() => setTab("reviews")}
                        role="tab"
                        aria-selected={tab === "reviews"}
                      >
                        Avaliações
                      </button>
                    </div>
                  </div>

                  {tab === "info" && (
                    <div className="spots__info">
                      <p className="spots__desc">{selected.description || "Sem descrição."}</p>
                      <div className="spots__metaGrid">
                        <div><strong>Corpo d’água:</strong> {selected.waterBody || "—"}</div>
                        <div>
                          <strong>Coordenadas:</strong>{" "}
                          {Array.isArray(selected?.location?.coordinates)
                            ? `${selected.location.coordinates[1]?.toFixed?.(5)}, ${selected.location.coordinates[0]?.toFixed?.(5)}`
                            : "—"}
                        </div>
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
                        <article key={r._id} className="spots__review">
                          <header className="spots__reviewHead">
                            <div className="spots__reviewWho">
                              <div className="spots__avatar" aria-hidden>🧭</div>
                              <div>
                                <div className="spots__reviewName">{r.userName || "Mergulhador(a)"}</div>
                                <div className="spots__reviewDate">{fmtDate(r.date)}</div>
                              </div>
                            </div>
                            <StarRating value={r.rating || 0} />
                          </header>
                          {r.notes && <p className="spots__reviewText">{r.notes}</p>}
                          {diveLogPhotos(r).length > 0 && (
                            <div className="spots__reviewPics">
                              {diveLogPhotos(r).map((src, i) => (
                                <img key={i} src={src} alt={`Foto ${i + 1}`} />
                              ))}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}

                  <div className="spots__cta">
                    <Link to="/logged/registrar-mergulho" className="btn-primary">AVALIAR PONTO</Link>
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
            <p aria-live="polite" className={`spots__msg ${msg.includes("sucesso") ? "is-ok" : "is-err"}`}>
              {msg}
            </p>
          )}

          <form className="card spots__form" onSubmit={handleSubmit} noValidate>
            {/* Nome */}
            <div className="field">
              <label className="label">Nome do local</label>
              <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            {/* Coordenadas */}
            <div className="field">
              <label className="label">Coordenadas geográficas</label>
              <div className="spots__coords">
                <input type="text" inputMode="decimal" className="input" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
                <input type="text" inputMode="decimal" className="input" placeholder="Longitude" value={lon} onChange={(e) => setLon(e.target.value)} />
                <button type="button" className="btn-ghost" onClick={fillWithGeolocation} title="Usar minha localização">
                  Usar minha localização
                </button>
              </div>
            </div>

            {/* Descrição */}
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

            {/* Imagens */}
            <div className="field">
              <label className="label">Imagens do local</label>
              <input id="spotPhotos" type="file" accept="image/*" multiple hidden onChange={onInputChange} />
              <label htmlFor="spotPhotos" className="dropzone dropzone--clickable" onDrop={onDrop} onDragOver={onDragOver}>
                <div className="dropzone__inner">
                  <PublicImg
                    candidates={[withBase("images/mini-icon/Upload.png"), withBase("images/mini-icon/upload.png"), withBase("images/Upload.png"), withBase("images/upload.png")]}
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
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "CADASTRANDO..." : "CADASTRAR LOCAL DE MERGULHO"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

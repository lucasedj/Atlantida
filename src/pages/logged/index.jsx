// src/pages/Logged/index.jsx
import React, { memo, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./logged.css";
import { getCurrentUser, me, logout } from "../../features/auth/authService";
import { apiFetch } from "../../services/api";

/* ---------------------------
 * Itens reutilizáveis
 * ------------------------- */
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

/* ===========================
 * PREVISÃO DO TEMPO (Open-Meteo)
 * =========================== */
function WeatherCard({ user }) {
  const [state, setState] = useState({
    loading: true,
    placeText: "—",
    currentTemp: null,
    todaySummary: "—",
    todayIconKey: "cloud",
    daily: [], // [{date, dShort, tMax, tMin, iconKey, desc}]
    err: "",
  });

  /* --------- Ícones finos em SVG (azul) --------- */
  function WxIcon({ name, size = 26 }) {
    const p = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    };
    const Sun = () => (
      <svg {...p}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
    const Cloud = () => (
      <svg {...p}>
        <path d="M7 18h9a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.7 1.7A3.5 3.5 0 0 0 7 18z" />
      </svg>
    );
    const Partly = () => (
      <svg {...p}>
        <circle cx="7.5" cy="8" r="3.2" />
        <path d="M7.5 3.5V2M7.5 14v-1.5M2.5 8H1M14 8h-1.5M3.8 3.8 2.7 2.7M12.3 13.3l-1.1-1.1" />
        <path d="M8.5 19h8a3.5 3.5 0 0 0 0-7 4.5 4.5 0 0 0-8.8 1.4A3 3 0 0 0 8.5 19z" />
      </svg>
    );
    const Rain = () => (
      <svg {...p}>
        <path d="M7 16h9a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.7 1.7A3.5 3.5 0 0 0 7 16z" />
        <path d="M9 19l-1 2M12 19l-1 2M15 19l-1 2" />
      </svg>
    );
    const Drizzle = () => (
      <svg {...p}>
        <path d="M7 16h9a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.7 1.7A3.5 3.5 0 0 0 7 16z" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="12" cy="19" r="1" />
        <circle cx="15" cy="19" r="1" />
      </svg>
    );
    const Storm = () => (
      <svg {...p}>
        <path d="M7 16h9a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.7 1.7A3.5 3.5 0 0 0 7 16z" />
        <path d="M12 17l-2 4 4-3h-3l2-3" />
      </svg>
    );
    const Snow = () => (
      <svg {...p}>
        <path d="M7 16h9a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.7 1.7A3.5 3.5 0 0 0 7 16z" />
        <path d="M12 18v3M10.5 19l-2 1M13.5 19l2 1" />
      </svg>
    );
    const Fog = () => (
      <svg {...p}>
        <path d="M7 15h9a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.7 1.7A3.5 3.5 0 0 0 7 15z" />
        <path d="M6 18h12M7.5 20.5h9" />
      </svg>
    );
    const M = { sun: Sun, cloud: Cloud, partly: Partly, rain: Rain, drizzle: Drizzle, storm: Storm, snow: Snow, fog: Fog };
    const Cmp = M[name] || Cloud;
    return <Cmp />;
  }

  /* --------- Mapeamentos --------- */
  const wmoToIconKey = (code) => {
    const c = Number(code);
    if (c === 0) return "sun";
    if ([1, 2].includes(c)) return "partly";
    if (c === 3) return "cloud";
    if ([45, 48].includes(c)) return "fog";
    if ([51, 53, 55, 56, 57].includes(c)) return "drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return "rain";
    if ([71, 73, 75, 77].includes(c)) return "snow";
    if ([95, 96, 99].includes(c)) return "storm";
    return "cloud";
  };

  const wmoToDesc = (code) => {
    const c = Number(code);
    if ([0].includes(c)) return "ensolarado";
    if ([1].includes(c)) return "sol entre nuvens";
    if ([2].includes(c)) return "parcialmente nublado";
    if ([3].includes(c)) return "nublado";
    if ([45, 48].includes(c)) return "neblina";
    if ([51, 53, 55].includes(c)) return "garoa";
    if ([56, 57].includes(c)) return "garoa congelante";
    if ([61].includes(c)) return "chuva fraca";
    if ([63].includes(c)) return "chuva";
    if ([65].includes(c)) return "chuva forte";
    if ([66, 67].includes(c)) return "chuva congelante";
    if ([71, 73, 75, 77].includes(c)) return "neve";
    if ([80].includes(c)) return "pancadas fracas";
    if ([81].includes(c)) return "pancadas";
    if ([82].includes(c)) return "pancadas fortes";
    if ([95].includes(c)) return "trovoadas";
    if ([96, 99].includes(c)) return "trovoadas fortes";
    return "instável";
  };

  // tenta montar "Cidade, Estado" a partir do objeto user
  const guessPlaceFromUser = (u) => {
    const city =
      u?.city ||
      u?.address?.city ||
      u?.profile?.city ||
      u?.location?.city ||
      u?.homeCity ||
      "";
    const state =
      u?.state ||
      u?.address?.state ||
      u?.profile?.state ||
      u?.location?.state ||
      u?.homeState ||
      "";
    const country = u?.country || u?.address?.country || "";
    const text = [city, state || country].filter(Boolean).join(", ");
    return text || "";
  };

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      try {
        setState((s) => ({ ...s, loading: true, err: "" }));

        // 1) descobre local
        let placeText = guessPlaceFromUser(user);

        // 2) geocoding → lat/lon
        let lat, lon, tz;

        const geocode = async (q) => {
          const url =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(q) +
            "&count=1&language=pt&format=json";
          const r = await fetch(url);
          if (!r.ok) throw new Error("geocoding falhou");
          const j = await r.json();
          const g = j?.results?.[0];
          if (g) {
            lat = g.latitude;
            lon = g.longitude;
            tz = g.timezone;
            if (!placeText) {
              placeText = [g.name, g.admin1 || g.admin2, g.country_code]
                .filter(Boolean)
                .join(", ");
            }
          }
        };

        if (placeText) {
          await geocode(placeText);
        }

        // fallback: usar GPS do navegador
        if (!(lat && lon) && "geolocation" in navigator) {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                lat = pos.coords.latitude;
                lon = pos.coords.longitude;
                tz =
                  Intl.DateTimeFormat().resolvedOptions().timeZone ||
                  "auto";
                if (!placeText) placeText = "Minha localização";
                resolve();
              },
              () => resolve(),
              { enableHighAccuracy: true, timeout: 8000 }
            );
          });
        }

        // se ainda não temos coords, aborta graciosamente
        if (!(lat && lon)) {
          throw new Error("Não foi possível determinar a localização.");
        }

        // 3) previsão (7 dias)
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current_weather=true` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
          `&forecast_days=7&timezone=${encodeURIComponent(tz || "auto")}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("falha ao consultar previsão");
        const wx = await res.json();

        const curTemp = Math.round(wx?.current_weather?.temperature ?? NaN);

        const days = (wx?.daily?.time || []).map((iso, i) => {
          const d = new Date(iso + "T00:00:00");
          const dShort = d
            .toLocaleDateString("pt-BR", { weekday: "short" })
            .replace(".", "")
            .toLowerCase();
          const tMax = Math.round(wx.daily.temperature_2m_max?.[i] ?? NaN);
          const tMin = Math.round(wx.daily.temperature_2m_min?.[i] ?? NaN);
          const code = wx.daily.weather_code?.[i];
          const iconKey = wmoToIconKey(code);
          const desc = wmoToDesc(code);
          return { date: d, dShort, tMax, tMin, iconKey, desc };
        });

        const today = days[0];
        const dowLong = today
          ? today.date.toLocaleDateString("pt-BR", { weekday: "long" })
          : "—";
        const todaySummary = today ? `${dowLong}, ${today.desc}` : "—";

        if (!cancelled) {
          setState({
            loading: false,
            placeText: placeText || "—",
            currentTemp: Number.isFinite(curTemp) ? curTemp : null,
            todaySummary,
            todayIconKey: today?.iconKey || "cloud",
            daily: days,
            err: "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            err: err?.message || "Falha ao carregar previsão.",
          }));
        }
      }
    };

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // UI
  return (
    <section className="card weather" aria-labelledby="weather-title">
      <SectionTitle>
        <span id="weather-title">Previsão do tempo da semana</span>
      </SectionTitle>

      <div className="weather__box">
        <div
          className="weather__top"
          /* garante 3 colunas mesmo se o CSS antigo tiver 2 */
          style={{ gridTemplateColumns: "auto 1fr auto", alignItems: "start" }}
        >
          <div className="weather__temp" aria-live="polite">
            {state.currentTemp != null ? `${state.currentTemp}°C` : "—°C"}
          </div>

          <div className="weather__place" title={state.placeText}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="#1d4ed8"/>
              <circle cx="12" cy="9.5" r="2.5" stroke="#1d4ed8"/>
            </svg>
            <span>{state.placeText}</span>
          </div>

          <div className="weather__topRight" aria-hidden>
            <div className="weather__iconBig" style={{ color: "#1d4ed8" }}>
              <WxIcon name={state.todayIconKey} size={28} />
            </div>
          </div>

          <div className="weather__cond" title={state.todaySummary} style={{ gridColumn: "1 / span 3", marginTop: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="#1d4ed8" />
              <path d="M8 3v4M16 3v4M3 9h18" stroke="#1d4ed8" />
            </svg>
            <span>{state.todaySummary}</span>
          </div>
        </div>

        <ul className="weather__week" aria-label="Próximos dias">
          {state.daily.length > 0
            ? state.daily.map((d) => (
                <li key={d.date.toISOString()} className="weather__day">
                  <span className="weather__d">{d.dShort}</span>
                  <span className="weather__i" title={d.desc} style={{ color: "#1d4ed8" }}>
                    <WxIcon name={d.iconKey} />
                  </span>
                  <span className="weather__t">
                    {Number.isFinite(d.tMax) ? `${d.tMax}°` : "—°"}{" "}
                    <small>{Number.isFinite(d.tMin) ? `${d.tMin}°` : "—°"}</small>
                  </span>
                </li>
              ))
            : Array.from({ length: 7 }).map((_, i) => (
                <li key={i} className="weather__day" aria-hidden>
                  <span className="weather__d">—</span>
                  <span className="weather__i" style={{ color: "#1d4ed8" }}>
                    <WxIcon name="cloud" />
                  </span>
                  <span className="weather__t">—° <small>—°</small></span>
                </li>
              ))}
        </ul>

        {state.err && (
          <p style={{ color: "#dc2626", marginTop: 6 }}>{state.err}</p>
        )}
      </div>
    </section>
  );
}

/* ====== Mapa com seus mergulhos (Leaflet) ====== */
function DivesMap() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");

  const mapRef = React.useRef(null);
  const LRef = React.useRef(null);
  const mapObjRef = React.useRef(null);
  const markersRef = React.useRef([]);
  const diveIconRef = React.useRef(null); // 🔵 ícone custom

  // injeta CSS do Leaflet uma única vez
  useEffect(() => {
    const id = "leaflet-css";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }
  }, []);

  // carrega os logs
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await apiFetch("/api/diveLogs", { auth: true });
        if (!active) return;
        const arr = Array.isArray(data) ? data : [];
        arr.sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));
        setLogs(arr);
      } catch (e) {
        if (active) setErr(e?.message || "Falha ao carregar mergulhos.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // --- utils de coordenadas ---
  const normalizeLatLng = (a, b) => {
    const A = Number(a), B = Number(b);
    if (!Number.isFinite(A) || !Number.isFinite(B)) return null;
    if (Math.abs(A) <= 90 && Math.abs(B) <= 180) return [A, B];      // [lat, lng]
    if (Math.abs(A) <= 180 && Math.abs(B) <= 90) return [B, A];      // [lng, lat] -> inverte
    return null;
  };
  const tryFromCoordsArray = (coords) => {
    if (!Array.isArray(coords) || coords.length < 2) return null;
    return normalizeLatLng(coords[0], coords[1]);
  };
  const tryFromObj = (o) => {
    if (!o || typeof o !== "object") return null;
    if (Number.isFinite(o.lat) && Number.isFinite(o.lng)) return normalizeLatLng(o.lat, o.lng);
    if (Number.isFinite(o.latitude) && Number.isFinite(o.longitude)) return normalizeLatLng(o.latitude, o.longitude);
    // GeoJSON → [lng, lat]
    if (o.type === "Point" && Array.isArray(o.coordinates)) {
      const [lng, lat] = o.coordinates;
      return normalizeLatLng(lat, lng); // ✔ Leaflet espera [lat, lng]
    }

    if (Array.isArray(o.coords)) return tryFromCoordsArray(o.coords);
    if (Array.isArray(o.coordinates)) return tryFromCoordsArray(o.coordinates);
    if (o.location) { const r = tryFromObj(o.location); if (r) return r; }
    if (o.geometry) { const r = tryFromObj(o.geometry); if (r) return r; }
    if (o.geo) { const r = tryFromObj(o.geo); if (r) return r; }
    if (o.point) { const r = tryFromObj(o.point); if (r) return r; }
    const s = o.latlng || o.coordsString || o.coordinatesString;
    if (typeof s === "string" && s.includes(",")) {
      const [a, b] = s.split(",").map((x) => Number(x.trim()));
      return normalizeLatLng(a, b);
    }
    return null;
  };
  const getLatLng = (log) => {
    // direto no log
    let r =
      tryFromObj(log) ||
      tryFromObj(log?.location) ||
      tryFromObj(log?.geo) ||
      tryFromObj(log?.point) ||
      tryFromObj(log?.coordinates);
    if (r) return r;

    // spots possíveis
    const spot =
      (typeof log?.divingSpotId === "object" ? log.divingSpotId : null) ||
      (typeof log?.divingSpot === "object" ? log.divingSpot : null) ||
      (typeof log?.spot === "object" ? log.spot : null);
    if (spot) {
      r =
        tryFromObj(spot) ||
        tryFromObj(spot?.location) ||
        tryFromObj(spot?.geo) ||
        tryFromObj(spot?.geometry) ||
        tryFromObj(spot?.point) ||
        tryFromObj(spot?.coordinates);
      if (r) return r;
      if (Number.isFinite(spot?.lat) && Number.isFinite(spot?.lon)) return normalizeLatLng(spot.lat, spot.lon);
      if (Number.isFinite(spot?.lat) && Number.isFinite(spot?.lng)) return normalizeLatLng(spot.lat, spot.lng);
      if (typeof spot?.latlng === "string" && spot.latlng.includes(",")) {
        const [a, b] = spot.latlng.split(",").map((x) => Number(x.trim()));
        const n = normalizeLatLng(a, b);
        if (n) return n;
      }
    }
    return null;
  };

  // filtra por busca e remove sem coordenadas
  const filtered = logs.filter((log) => {
    const latlng = getLatLng(log);
    if (!latlng) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    const title = (log?.title || "").toLowerCase();
    const spotName = ((log?.divingSpotId?.name) || (log?.divingSpotId?.title) || (log?.divingSpot?.name) || (log?.spot?.name) || "").toLowerCase();
    const dateStr = (() => {
      const d = new Date(log?.date);
      return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR").toLowerCase();
    })();
    return title.includes(q) || spotName.includes(q) || dateStr.includes(q);
  });

  const computeCenter = (items) => {
    const pts = items.map(getLatLng).filter(Boolean);
    if (!pts.length) return [-14.235, -51.925]; // Brasil
    const [sumLat, sumLng] = pts.reduce((acc, [la, ln]) => [acc[0] + la, acc[1] + ln], [0, 0]);
    return [sumLat / pts.length, sumLng / pts.length];
  };

  // cria/atualiza o mapa e os pins
  useEffect(() => {
    (async () => {
      if (!LRef.current) {
        const L = await import("leaflet");
        LRef.current = L;

        // 🔵 Ícone personalizado usando spots.png
        diveIconRef.current = L.icon({
          iconUrl: "/images/spots.png",
          iconRetinaUrl: "/images/spots.png",
          iconSize: [32, 32],        // ajusta se precisar
          iconAnchor: [16, 32],      // ponto "no chão" do pin
          popupAnchor: [0, -32],     // onde o popup abre
          className: "divesMap__marker",
        });
      }

      const L = LRef.current;

      if (!mapObjRef.current && mapRef.current) {
        mapObjRef.current = L.map(mapRef.current, {
          center: computeCenter(filtered),
          zoom: 5,
          zoomControl: true,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 18,
        }).addTo(mapObjRef.current);
        setTimeout(() => mapObjRef.current && mapObjRef.current.invalidateSize(), 0);
      }
      if (!mapObjRef.current) return;

      // limpa pins
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // adiciona pins
      const ms = [];
      const bounds = [];
      filtered.forEach((log) => {
        const latlng = getLatLng(log);
        if (!latlng) return;
        const [lat, lng] = latlng;

        const Lm = L.marker([lat, lng], {
          icon: diveIconRef.current || undefined, // 👈 força usar spots.png
        });

        const title = log?.title || "Mergulho";
        const dateStr = (() => {
          const d = new Date(log?.date);
          return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
        })();
        const spotName =
          (log?.divingSpotId?.name) || (log?.divingSpotId?.title) ||
          (log?.divingSpot?.name) || (log?.spot?.name) || "—";
        const depth = log?.depth != null ? `${log.depth} m` : "—";

        Lm.bindPopup(
          `<div style="font-weight:700;margin-bottom:4px">${title}</div>
           <div><strong>Data:</strong> ${dateStr}</div>
           <div><strong>Local:</strong> ${spotName}</div>
           <div><strong>Profundidade:</strong> ${depth}</div>`
        );
        Lm.addTo(mapObjRef.current);
        ms.push(Lm);
        bounds.push([lat, lng]);
      });
      markersRef.current = ms;

      // viewport
      if (bounds.length === 1) {
        mapObjRef.current.setView(bounds[0], 10);
      } else if (bounds.length > 1) {
        mapObjRef.current.fitBounds(bounds, { padding: [30, 30] });
      } else {
        mapObjRef.current.setView(computeCenter(filtered), 5);
      }
    })();
  }, [filtered]);
  // ⬆ se quiser, pode adicionar [] em vez de [filtered] se os logs não mudam tanto

  return (
    <section className="places" aria-labelledby="places-title">
      <SectionTitle>
        <span id="places-title">Locais que mergulhou</span>
      </SectionTitle>

      <form
        className="places__search"
        role="search"
        aria-label="Pesquisar locais de mergulho"
        onSubmit={(e) => e.preventDefault()}
        style={{ marginBottom: 10 }}
      >
        <label className="search__input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="#9aa3af" />
            <path d="M20 20l-3.5-3.5" stroke="#9aa3af" />
          </svg>
          <input
            type="search"
            placeholder="Pesquise pelo título, local ou data"
            aria-label="Pesquisar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button type="submit" className="search__btn" aria-label="Buscar">🔍</button>
      </form>

      <div
        ref={mapRef}
        className="places__map"
        role="img"
        aria-label="Mapa com pins de mergulhos"
        style={{
          width: "100%",
          height: 360,
          borderRadius: 12,
          overflow: "hidden",
          outline: "1px solid #e5e7eb",
        }}
      />

      {loading && !err && <p style={{ marginTop: 8 }}>Carregando mapa…</p>}
      {err && <p style={{ marginTop: 8, color: "#dc2626" }}>{err}</p>}
      {!loading && !err && filtered.length === 0 && (
        <p style={{ marginTop: 8 }}>
          Nenhum mergulho com coordenadas foi encontrado.
          <br />
          <small>Verifique se seus logs/locais possuem latitude/longitude ou GeoJSON.</small>
        </p>
      )}
    </section>
  );
}


/* Tabela de mergulhos (já com API) */
function DivesTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await apiFetch("/api/diveLogs", { auth: true });
        if (!active) return;
        const arr = Array.isArray(data) ? data : [];
        arr.sort((a, b) => {
          const da = new Date(a?.date || 0).getTime();
          const db = new Date(b?.date || 0).getTime();
          return db - da;
        });
        setLogs(arr);
      } catch (e) {
        if (active) setErr(e?.message || "Falha ao carregar mergulhos.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * PAGE_SIZE;
  const rows = logs.slice(start, start + PAGE_SIZE);

  const fmtDate = (v) => {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  };

  const getSpotName = (log) => {
    const ds = log?.divingSpotId;
    if (ds && typeof ds === "object" && (ds.name || ds.title)) return ds.name || ds.title;
    return "—";
  };

  return (
    <section className="dives" aria-labelledby="dives-title">
      <SectionTitle>
        <span id="dives-title">Seus últimos mergulhos</span>
      </SectionTitle>

      <div className="table" role="table" aria-label="Últimos mergulhos">
        <div className="table__head" role="row">
          <div role="columnheader">Título</div>
          <div role="columnheader">Data</div>
          <div role="columnheader">Local</div>
          <div role="columnheader" className="u-right">Profundidade atingida</div>
        </div>

        {err && (
          <div className="table__row" role="row">
            <div role="cell" colSpan={4} style={{ color: "#dc2626" }}>
              {err}
            </div>
          </div>
        )}

        {loading && !err && Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <div className="table__row" role="row" key={`sk-${i}`}>
            <div role="cell">—</div>
            <div role="cell">—</div>
            <div role="cell">—</div>
            <div role="cell" className="u-right">—</div>
          </div>
        ))}

        {!loading && !err && rows.length === 0 && (
          <div className="table__row" role="row">
            <div role="cell" colSpan={4}>Nenhum mergulho encontrado.</div>
          </div>
        )}

        {!loading && !err && rows.map((log) => (
          <div className="table__row" role="row" key={log._id}>
            <div role="cell">{log?.title || "—"}</div>
            <div role="cell">{fmtDate(log?.date)}</div>
            <div role="cell">{getSpotName(log)}</div>
            <div role="cell" className="u-right">
              {log?.depth != null ? `${log.depth} m` : "—"}
            </div>
          </div>
        ))}
      </div>

      <nav className="pager" aria-label="Paginação">
        <button
          type="button"
          aria-label="Página anterior"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={pageSafe <= 1}
        >
          ‹
        </button>
        <span aria-live="polite" style={{ margin: "0 8px" }}>
          {pageSafe} / {totalPages}
        </span>
        <button
          type="button"
          aria-label="Próxima página"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={pageSafe >= totalPages}
        >
          ›
        </button>
      </nav>
    </section>
  );
}

/* ---------------------------
 * Página Logged
 * ------------------------- */
export default function Logged() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(state?.user || getCurrentUser());

  useEffect(() => {
    if (!user) {
      me()
        .then((u) => {
          setUser(u);
          try { localStorage.setItem("user", JSON.stringify(u)); } catch {}
        })
        .catch(() => {});
    }
  }, [user]);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    user?.email ||
    "usuário";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="logged">
      {/* ===== Sidebar ===== */}
      <aside className="logged__sidebar">
        <div className="logged__brand">
          <img
            src="/images/logo-atlantida-branca.png"
            alt="Atlântida"
            className="logged__logoImg"
          />
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

        <button type="button" className="logged__logout" onClick={handleLogout}>
          <img src="/images/mini-icon/Sair.png" alt="" className="logged__icon" aria-hidden />
          <span>Sair do sistema</span>
        </button>
      </aside>

      {/* ===== Conteúdo ===== */}
      <main className="logged__content">
        <div className="page dash">
          <header className="dash__head">
            <h1 className="dash__title">Olá, {displayName}!</h1>
            <p className="dash__sub">
              Bem-vindo de volta ao seu espaço de mergulho — aqui você encontra um
              resumo do seu desempenho subaquático. Vamos mergulhar nos detalhes!
            </p>
          </header>

          <div className="dash__grid">
            <WeatherCard user={user} />
            <DivesMap />
          </div>

          <DivesTable />
        </div>
      </main>
    </div>
  );
}

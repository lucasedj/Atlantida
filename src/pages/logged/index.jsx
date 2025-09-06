import React, { memo, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./logged.css";
import { getCurrentUser, me, logout } from "../../features/auth/authService";

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

/* Weather “skeleton” pronto para plugar API depois */
function WeatherCard() {
  return (
    <section className="card weather" aria-labelledby="weather-title">
      <SectionTitle>
        <span id="weather-title">Previsão do tempo da semana</span>
      </SectionTitle>

      <div className="weather__box">
        <div className="weather__top">
          <div className="weather__temp" aria-live="polite">—°C</div>

          <div className="weather__cond">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="#3b82f6" />
              <path d="M8 3v4M16 3v4M3 9h18" stroke="#3b82f6" />
            </svg>
            <span>—, —</span>
          </div>

          <div className="weather__place">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="#3b82f6"/>
              <circle cx="12" cy="9.5" r="2.5" stroke="#3b82f6"/>
            </svg>
            <span>—</span>
          </div>
        </div>

        <ul className="weather__week" aria-label="Próximos dias">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="weather__day" aria-hidden>
              <span className="weather__d">—</span>
              <span className="weather__i">☁️</span>
              <span className="weather__t">—° <small>—°</small></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PlacesCard() {
  const handleMapError = (e) => {
    e.currentTarget.style.display = "none";
  };

  return (
    <section className="places" aria-labelledby="places-title">
      <SectionTitle>
        <span id="places-title">Locais que mergulhou</span>
      </SectionTitle>

      <div className="places__map" role="img" aria-label="Mapa com pins de mergulhos">
        <img
          src="/images/map-brasil.jpg"
          alt=""
          className="places__mapImg"
          onError={handleMapError}
        />
      </div>

      <form className="places__search" role="search" aria-label="Pesquisar locais de mergulho" onSubmit={(e)=>e.preventDefault()}>
        <label className="search__input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="#9aa3af" />
            <path d="M20 20l-3.5-3.5" stroke="#9aa3af" />
          </svg>
          <input
            type="search"
            placeholder="Pesquise pelo título, local ou data"
            aria-label="Pesquisar"
          />
        </label>
        <button type="submit" className="search__btn" aria-label="Buscar">🔍</button>
      </form>
    </section>
  );
}

function DivesTable() {
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

        {Array.from({ length: 5 }).map((_, i) => (
          <div className="table__row" role="row" key={i}>
            <div role="cell">—</div>
            <div role="cell">—</div>
            <div role="cell">—</div>
            <div role="cell" className="u-right">—</div>
          </div>
        ))}
      </div>

      <nav className="pager" aria-label="Paginação">
        <button type="button" aria-label="Página anterior">‹</button>
        <button type="button" aria-label="Próxima página">›</button>
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
    // fallback: se recarregar a página e não tiver user no storage
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
            <WeatherCard />
            <PlacesCard />
          </div>

          <DivesTable />
        </div>
      </main>
    </div>
  );
}

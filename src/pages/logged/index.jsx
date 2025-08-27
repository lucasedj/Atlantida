import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./logged.css";

export default function Logged() {
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

        <nav className="logged__nav">
          <NavLink end to="/logged" className="logged__item">
            <img src="/images/mini-icon/início.png" alt="" className="logged__icon" />
            <span>Início</span>
          </NavLink>

          <NavLink to="/logged/estatisticas" className="logged__item">
            <img src="/images/mini-icon/estatística.png" alt="" className="logged__icon" />
            <span>Estatísticas</span>
          </NavLink>

          <NavLink to="/logged/locais" className="logged__item">
            <img src="/images/mini-icon/locais-de-mergulho.png" alt="" className="logged__icon" />
            <span>Locais de mergulho</span>
          </NavLink>

          <NavLink to="/logged/certificados" className="logged__item">
            <img src="/images/mini-icon/certificados.png" alt="" className="logged__icon" />
            <span>Certificados</span>
          </NavLink>

          <NavLink to="/logged/perfil" className="logged__item">
            <img src="/images/mini-icon/perfil.png" alt="" className="logged__icon" />
            <span>Perfil do usuário</span>
          </NavLink>
        </nav>

        <div className="logged__card">
          <div className="logged__cardMedia">
            <img src="/images/logo-mergulho.png" alt="" aria-hidden />
          </div>
          <Link to="/logged/registrar-mergulho" className="logged__primaryBtn" role="button">
            <span className="logged__plus" aria-hidden>＋</span>
            Registrar mergulho
          </Link>
        </div>

        <Link to="/login" className="logged__logout">
          <img src="/images/mini-icon/Sair.png" alt="" className="logged__icon" />
          <span>Sair do sistema</span>
        </Link>
      </aside>

      {/* ===== Conteúdo ===== */}
      <main className="logged__content">
        <div className="page dash">
          {/* Headline */}
          <header className="dash__head">
            <h1 className="dash__title">Olá, {"{User}"}!</h1>
            <p className="dash__sub">
              Bem-vindo de volta ao seu espaço de mergulho, no seu dashboard, você encontrará um
              resumo do seu desempenho subaquático. Vamos mergulhar nos detalhes!
            </p>
          </header>

          {/* Linha superior: clima + mapa */}
          <div className="dash__grid">
            {/* Previsão da semana */}
            <section className="card weather">
              <h2 className="dash__sectionTitle">Previsão do tempo da semana</h2>

              <div className="weather__box">
                <div className="weather__top">
                  <div className="weather__temp">23°C</div>

                  <div className="weather__cond">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#3b82f6" />
                      <path d="M8 3v4M16 3v4M3 9h18" stroke="#3b82f6" />
                    </svg>
                    <span>Quarta-feira, chuva fraca</span>
                  </div>

                  <div className="weather__place">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="#3b82f6"/>
                      <circle cx="12" cy="9.5" r="2.5" stroke="#3b82f6"/>
                    </svg>
                    <span>Araras, São Paulo</span>
                  </div>
                </div>

                <ul className="weather__week">
                  {[
                    { d: "qua", hi: 28, lo: 21, icon: "rain" },
                    { d: "qui", hi: 29, lo: 21, icon: "cloud" },
                    { d: "sex", hi: 28, lo: 22, icon: "storm" },
                    { d: "sáb", hi: 29, lo: 21, icon: "sun" },
                    { d: "dom", hi: 29, lo: 21, icon: "rain" },
                    { d: "seg", hi: 31, lo: 20, icon: "sun" },
                    { d: "ter", hi: 31, lo: 21, icon: "cloud" },
                    { d: "qua", hi: 32, lo: 22, icon: "cloud" },
                  ].map((it) => (
                    <li key={it.d} className="weather__day">
                      <span className="weather__d">{it.d}</span>
                      <span className="weather__i" aria-hidden>
                        {it.icon === "sun" && "☀️"}
                        {it.icon === "cloud" && "☁️"}
                        {it.icon === "rain" && "🌧️"}
                        {it.icon === "storm" && "⛈️"}
                      </span>
                      <span className="weather__t">{it.hi}° <small>{it.lo}°</small></span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Locais que mergulhou + busca */}
            <section className="places">
              <h2 className="dash__sectionTitle">Locais que mergulhou</h2>

              <div className="places__map">
                {/* Mostra o mapa se existir a imagem; se não, um degradê de fallback */}
                <img
                  src="/images/map-brasil.jpg"
                  alt=""
                  className="places__mapImg"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span style={{ left: "92%", top: "12%" }} className="pin" />
                <span style={{ left: "78%", top: "32%" }} className="pin" />
                <span style={{ left: "86%", top: "43%" }} className="pin" />
                <span style={{ left: "74%", top: "66%" }} className="pin" />
                <span style={{ left: "62%", top: "80%" }} className="pin" />
              </div>

              <div className="places__search">
                <div className="search__input">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="11" cy="11" r="7" stroke="#9aa3af" />
                    <path d="M20 20l-3.5-3.5" stroke="#9aa3af" />
                  </svg>
                  <input type="text" placeholder="Pesquise pelo título, local ou data" />
                </div>
                <button type="button" className="search__btn" aria-label="Buscar">🔍</button>
              </div>
            </section>
          </div>

          {/* Tabela: últimos mergulhos */}
          <section className="dives">
            <h2 className="dash__sectionTitle">Seus últimos mergulhos</h2>

            <div className="table">
              <div className="table__head">
                <div>Título</div>
                <div>Data</div>
                <div>Local</div>
                <div className="u-right">Profundidade atingida</div>
              </div>

              {Array.from({ length: 5 }).map((_, i) => (
                <div className="table__row" key={i}>
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              ))}
            </div>

            <div className="pager">
              <button type="button" aria-label="Anterior">‹</button>
              <button type="button" aria-label="Próximo">›</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

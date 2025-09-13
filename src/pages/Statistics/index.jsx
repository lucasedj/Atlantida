import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./statistics.css"; // certifique-se de usar o CSS certo

const MenuItem = ({ to, icon, children, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      isActive ? "logged__item active" : "logged__item"
    }
  >
    <img src={icon} alt="" className="logged__icon" aria-hidden />
    <span>{children}</span>
  </NavLink>
);

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // ou logout()
    navigate("/login");
  };

  return (
    <div className="logged"> {/* Container geral para grid layout */}
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

      <main className="logged__main">
        {/* Conteúdo: Estatísticas */}
        <div className="statistics">
          {/* Cabeçalho */}
          <div className="statistics__header">
            <div>
              <h1>Estatísticas</h1>
              <p>
                Explore as estatísticas detalhadas dos seus mergulhos, desde a profundidade máxima até as condições submarinas, tudo em um só lugar.
              </p>
            </div>

            {/* Filtro de data */}
            <div className="statistics__filter">
              <label htmlFor="period">Filtre por período</label>
              <div>
                <input type="date" id="period-start" />
                <span> - </span>
                <input type="date" id="period-end" />
              </div>
            </div>
          </div>

          {/* Cards de estatísticas */}
          <div className="statistics__cards">
            <div className="statistics__card">
              <span className="statistics__label">Total de mergulhos</span>
              <strong className="statistics__value">13</strong>
            </div>
            <div className="statistics__card">
              <span className="statistics__label">Tempo médio</span>
              <strong className="statistics__value">35 Minutos</strong>
            </div>
            <div className="statistics__card">
              <span className="statistics__label">Profundidade média</span>
              <strong className="statistics__value">25 Metros</strong>
            </div>
            <div className="statistics__card">
              <span className="statistics__label">Corpo de água mais comum</span>
              <strong className="statistics__value">Oceano</strong>
            </div>
            <div className="statistics__card">
              <span className="statistics__label">Clima mais comum</span>
              <strong className="statistics__value">Ensolarado</strong>
            </div>
          </div>

          {/* Gráfico */}
          <div className="statistics__chart">
            <div className="statistics__chartHeader">
              <button className="statistics__chartBtn">Tempo total de fundo</button>
            </div>
            <div className="statistics__chartContent">
              <div className="statistics__chartPlaceholder">
                <p>[ Gráfico de barras virá aqui ]</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sidebar;

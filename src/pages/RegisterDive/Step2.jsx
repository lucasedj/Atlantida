import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import "../Logged/logged.css";
import "./register-dive.css";

export default function Step2() {
  const navigate = useNavigate();

  // estado simples só para validação mínima
  const [depth, setDepth] = useState("");
  const [bottomTime, setBottomTime] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // validação leve: números válidos e não negativos
    const d = Number(depth);
    const t = Number(bottomTime);
    const okDepth = !Number.isNaN(d) && d >= 0 && d <= 200;   // ajuste o limite se quiser
    const okTime  = !Number.isNaN(t) && t >= 0 && t <= 600;

    if (!okDepth || !okTime) {
      // aqui você pode mostrar toasts ou setar estados de erro
      return;
    }

    // salve no contexto/store se precisar
    navigate("/logged/registrar-mergulho/Step3");
  };

  const MenuLink = ({ to, icon, label, end = false }) => (
    <NavLink
      end={end}
      to={to}
      className={({ isActive }) => `logged__item${isActive ? " active" : ""}`}
    >
      <img src={icon} alt="" aria-hidden className="logged__icon" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="logged">
      {/* ========= Sidebar ========= */}
      <aside className="logged__sidebar" aria-label="Navegação principal">
        <div className="logged__brand">
          <img
            src="/images/logo-atlantida-branca.png"
            alt="Atlântida"
            className="logged__logoImg"
          />
        </div>

        <nav className="logged__nav">
          <MenuLink end to="/logged" icon="/images/mini-icon/início.png" label="Início" />
          <MenuLink to="/logged/estatisticas" icon="/images/mini-icon/estatística.png" label="Estatísticas" />
          <MenuLink to="/logged/locais" icon="/images/mini-icon/locais-de-mergulho.png" label="Locais de mergulho" />
          <MenuLink to="/logged/certificados" icon="/images/mini-icon/certificados.png" label="Certificados" />
          <MenuLink to="/logged/perfil" icon="/images/mini-icon/perfil.png" label="Perfil do usuário" />
        </nav>

        {/* Card registrar mergulho */}
        <div className="logged__card" aria-label="Atalho para registrar mergulho">
          <div className="logged__cardMedia">
            <img src="/images/logo-mergulho.png" alt="" aria-hidden />
          </div>
          <Link to="/logged/registrar-mergulho" className="logged__primaryBtn">
            <span className="logged__plus" aria-hidden>＋</span>
            Registrar mergulho
          </Link>
        </div>

        {/* Logout */}
        <Link to="/login" className="logged__logout">
          <img src="/images/mini-icon/Sair.png" alt="" aria-hidden className="logged__icon" />
          <span>Sair do sistema</span>
        </Link>
      </aside>

      {/* ========= Conteúdo ========= */}
      <main className="logged__content">
        <div className="page register">
          <header className="register__head">
            <h1 className="register__title">Registre seu mergulho</h1>
            <p className="register__sub">
              Registre detalhadamente seus mergulhos, anote observações, cadastre seu
              local de mergulho, anexe fotos e registre esse momento incrível.
            </p>
          </header>

          {/* Etapas */}
          <nav className="steps" aria-label="Etapas do formulário">
            <span className="steps__item">
              <span className="steps__num">1</span>
              <span className="steps__label">Informações Gerais</span>
            </span>
            <span className="steps__item is-active" aria-current="step">
              <span className="steps__num">2</span>
              <span className="steps__label">Profundidade e Tempo</span>
            </span>
            <span className="steps__item">
              <span className="steps__num">3</span>
              <span className="steps__label">Condições Ambientais</span>
            </span>
            <span className="steps__item">
              <span className="steps__num">4</span>
              <span className="steps__label">Equipamentos</span>
            </span>
            <span className="steps__item">
              <span className="steps__num">5</span>
              <span className="steps__label">Experiência e Observações</span>
            </span>
          </nav>
          <div className="steps__progress is-2" aria-hidden="true" />

          <p className="register__stage">Etapa 2 de 5</p>

          {/* Formulário – Etapa 2 */}
          <form className="card form" onSubmit={handleSubmit} noValidate>
            <h2 className="form__title">Profundidade e Tempo</h2>

            <div className="form-grid">
              {/* Profundidade */}
              <div className="field">
                <label className="label" htmlFor="depth">
                  Profundidade máxima
                </label>
                <span className="hint">A que profundidade você chegou? (em metros)</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    id="depth"
                    name="depth"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    max="200"
                    className="input"
                    placeholder="0.0"
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    required
                    aria-describedby="depthUnit"
                  />
                  <span id="depthUnit" className="hint" style={{ alignSelf: "center" }}>m</span>
                </div>
              </div>

              {/* Tempo no fundo */}
              <div className="field">
                <label className="label" htmlFor="bottomTime">
                  Tempo no fundo
                </label>
                <span className="hint">Quanto tempo levou o seu mergulho? (em minutos)</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    id="bottomTime"
                    name="bottomTime"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="0"
                    max="600"
                    className="input"
                    placeholder="0"
                    value={bottomTime}
                    onChange={(e) => setBottomTime(e.target.value)}
                    required
                    aria-describedby="timeUnit"
                  />
                  <span id="timeUnit" className="hint" style={{ alignSelf: "center" }}>min</span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="form-actions" style={{ gap: 12 }}>
              <Link to="/logged/registrar-mergulho" className="btn-outline">
                ETAPA ANTERIOR
              </Link>
              <button type="submit" className="btn-primary">
                PRÓXIMA ETAPA
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

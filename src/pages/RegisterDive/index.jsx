// src/pages/RegisterDive/index.jsx
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDraftField } from "./useDiveDraft";

import "../Logged/logged.css";
import "./register-dive.css";

export default function RegisterDive() {
  const navigate = useNavigate();

  // campos persistentes da etapa 1
  const [title, setTitle]       = useDraftField("title", "");
  const [place, setPlace]       = useDraftField("place", "");
  const [date, setDate]         = useDraftField("date", "");      // yyyy-mm-dd
  const [diveType, setDiveType] = useDraftField("diveType", "costa"); // 'costa' | 'barco' | 'outros'

  // erro local do formulário (não persiste)
  const [formErr, setFormErr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !place.trim() || !date) {
      setFormErr("Preencha Título, Local e Data para continuar.");
      return;
    }
    setFormErr("");
    navigate("/logged/registrar-mergulho/Step2");
  };

  const menuLink = ({ to, icon, label, end = false }) => (
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
          {menuLink({ end: true, to: "/logged", icon: "/images/mini-icon/início.png", label: "Início" })}
          {menuLink({ to: "/logged/estatisticas", icon: "/images/mini-icon/estatística.png", label: "Estatísticas" })}
          {menuLink({ to: "/logged/locais", icon: "/images/mini-icon/locais-de-mergulho.png", label: "Locais de mergulho" })}
          {menuLink({ to: "/logged/certificados", icon: "/images/mini-icon/certificados.png", label: "Certificados" })}
          {menuLink({ to: "/logged/perfil", icon: "/images/mini-icon/perfil.png", label: "Perfil do usuário" })}
        </nav>

        <div className="logged__card" aria-label="Atalho para registrar mergulho">
          <div className="logged__cardMedia">
            <img src="/images/logo-mergulho.png" alt="" aria-hidden />
          </div>
          <Link to="/logged/registrar-mergulho" className="logged__primaryBtn">
            <span className="logged__plus" aria-hidden>＋</span>
            Registrar mergulho
          </Link>
        </div>

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
            <span className="steps__item is-active" aria-current="step">
              <span className="steps__num">1</span>
              <span className="steps__label">Informações Gerais</span>
            </span>
            <span className="steps__item">
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
          <div className="steps__progress is-1" aria-hidden="true" />

          <p className="register__stage">Etapa 1 de 5</p>

          {/* Formulário */}
          <form className="card form" onSubmit={handleSubmit} noValidate>
            <h2 className="form__title">Informações Gerais</h2>

            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="titulo">Título do Mergulho</label>
                <span className="hint">Que nome você quer dar para seu mergulho?</span>
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  className="input"
                  placeholder="Ex.: Batismo em Arraial"
                  autoComplete="off"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="local">Local de Mergulho</label>
                <span className="hint">Onde você mergulhou?</span>
                <input
                  id="local"
                  name="local"
                  type="text"
                  className="input"
                  placeholder="Cidade / Ponto"
                  autoComplete="off"
                  required
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="data">Data</label>
                <span className="hint">Qual foi a data do seu mergulho?</span>
                <input
                  id="data"
                  name="data"
                  type="date"
                  className="input"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="field" role="group" aria-labelledby="tipoLabel">
                <label className="label" id="tipoLabel">Tipo de Mergulho</label>
                <span className="hint">Como você entrou na água?</span>
                <div className="segmented" aria-label="Escolha do tipo">
                  {["costa","barco","outros"].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`segmented__btn ${diveType === opt ? "is-selected" : ""}`}
                      aria-pressed={diveType === opt}
                      onClick={() => setDiveType(opt)}
                    >
                      {opt === "costa" ? "Na costa" : opt === "barco" ? "Barco" : "Outros"}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="tipoMergulho" value={diveType} />
              </div>
            </div>

            {/* Erro do formulário (se houver) */}
            {formErr && (
              <p style={{ color: "#dc2626", marginTop: 8 }} role="alert" aria-live="assertive">
                {formErr}
              </p>
            )}

            {/* Ações */}
            <div className="form-actions">
              <button className="btn-primary" type="submit">
                PRÓXIMA ETAPA
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

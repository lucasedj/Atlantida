import React, { useState, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import "../Logged/logged.css";
import "./register-dive.css";

export default function Step3() {
  const navigate = useNavigate();

  /* ---------- Estado dos grupos ---------- */
  // single-select (agora!)
  const [weather, setWeather]   = useState("");   // condições climáticas
  const [waves, setWaves]       = useState("");   // ondas
  const [current, setCurrent]   = useState("");   // correnteza

  // multi-select (mantido)
  const [swell, setSwell]       = useState(new Set()); // ondulação (pode multi)

  // single-select (já eram)
  const [waterType, setWaterType]   = useState("");  // salgada | doce
  const [waterBody, setWaterBody]   = useState("");  // oceano | lago | pedreira
  const [visibility, setVisibility] = useState("");  // alto | moderado | baixo

  // temperaturas
  const [tAir, setTAir]         = useState("");
  const [tSurface, setTSurface] = useState("");
  const [tBottom, setTBottom]   = useState("");

  /* ---------- Helpers ---------- */
  const selectOne = useCallback((value, setFn) => setFn(value), []);
  const toggleInSet = useCallback((value, setFn) => {
    setFn(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  }, []);

  const SegBtn = ({ active, onClick, children }) => (
    <button
      type="button"
      className={`segmented__btn${active ? " is-selected" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );

  const MenuLink = ({ to, label, icon, end = false }) => (
    <NavLink
      end={end}
      to={to}
      className={({ isActive }) => `logged__item${isActive ? " active" : ""}`}
    >
      <img src={icon} alt="" aria-hidden className="logged__icon" />
      <span>{label}</span>
    </NavLink>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/logged/registrar-mergulho/Step4");
  };

  return (
    <div className="logged">
      {/* ========= Sidebar ========= */}
      <aside className="logged__sidebar" aria-label="Navegação principal">
        <div className="logged__brand">
          <img src="/images/logo-atlantida-branca.png" alt="Atlântida" className="logged__logoImg" />
        </div>

        <nav className="logged__nav">
          <MenuLink end to="/logged" label="Início" icon="/images/mini-icon/início.png" />
          <MenuLink to="/logged/estatisticas" label="Estatísticas" icon="/images/mini-icon/estatística.png" />
          <MenuLink to="/logged/locais" label="Locais de mergulho" icon="/images/mini-icon/locais-de-mergulho.png" />
          <MenuLink to="/logged/certificados" label="Certificados" icon="/images/mini-icon/certificados.png" />
          <MenuLink to="/logged/perfil" label="Perfil do usuário" icon="/images/mini-icon/perfil.png" />
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
            <span className="steps__item"><span className="steps__num">1</span><span className="steps__label">Informações Gerais</span></span>
            <span className="steps__item"><span className="steps__num">2</span><span className="steps__label">Profundidade e Tempo</span></span>
            <span className="steps__item is-active" aria-current="step"><span className="steps__num">3</span><span className="steps__label">Condições Ambientais</span></span>
            <span className="steps__item"><span className="steps__num">4</span><span className="steps__label">Equipamentos</span></span>
            <span className="steps__item"><span className="steps__num">5</span><span className="steps__label">Experiência e Observações</span></span>
          </nav>
          <div className="steps__progress is-3" aria-hidden="true" />

          <p className="register__stage">Etapa 3 de 5</p>

          {/* ===== Formulário — Condições Ambientais ===== */}
          <form className="card form" onSubmit={handleSubmit} noValidate>
            <h2 className="form__title">Condições Ambientais</h2>

            {/* Condições Climáticas (single) */}
            <div className="field">
              <label className="label" htmlFor="wx-group">Condições Climáticas</label>
              <span className="hint">Como estavam as condições climáticas?</span>
              <div id="wx-group" className="segmented" style={{ flexWrap: "wrap", rowGap: 8 }}>
                {["Ensolarado","Parcialmente nublado","Nublado","Chuvoso","Com vento","Com neblina"].map(v => (
                  <SegBtn key={v} active={weather === v} onClick={() => selectOne(v, setWeather)}>
                    {v}
                  </SegBtn>
                ))}
              </div>
            </div>

            {/* Temperatura */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Temperatura</label>
              <span className="hint">Como estava a temperatura? (°C)</span>

              <div className="form-grid" style={{ marginTop: 6 }}>
                <div className="field">
                  <input type="number" className="input" placeholder="Temperatura do Ar"
                         value={tAir} onChange={(e) => setTAir(e.target.value)} />
                </div>
                <div className="field">
                  <input type="number" className="input" placeholder="Temperatura na Superfície"
                         value={tSurface} onChange={(e) => setTSurface(e.target.value)} />
                </div>
                <div className="field">
                  <input type="number" className="input" placeholder="Temperatura no Fundo"
                         value={tBottom} onChange={(e) => setTBottom(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Tipo de Água (single) */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Tipo de Água</label>
              <span className="hint">Qual é o tipo de água?</span>
              <div className="segmented">
                {["Salgada","Doce"].map(v => (
                  <SegBtn key={v} active={waterType === v} onClick={() => selectOne(v, setWaterType)}>
                    {v}
                  </SegBtn>
                ))}
              </div>
            </div>

            {/* Corpo de Água (single) */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Corpo de Água</label>
              <span className="hint">Em que corpo de água você mergulhou?</span>
              <div className="segmented">
                {["Oceano","Lago","Pedreira"].map(v => (
                  <SegBtn key={v} active={waterBody === v} onClick={() => selectOne(v, setWaterBody)}>
                    {v}
                  </SegBtn>
                ))}
              </div>
            </div>

            {/* Visibilidade (single) */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Visibilidade</label>
              <span className="hint">Como estava a visibilidade?</span>
              <div className="segmented">
                {["Alto","Moderado","Baixo"].map(v => (
                  <SegBtn key={v} active={visibility === v} onClick={() => selectOne(v, setVisibility)}>
                    {v}
                  </SegBtn>
                ))}
              </div>
            </div>

            {/* Ondas (single agora) */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Ondas</label>
              <span className="hint">Como estavam as ondas?</span>
              <div className="segmented" style={{ flexWrap: "wrap", rowGap: 8 }}>
                {["Nenhum","Pequeno","Médio","Grande"].map(v => (
                  <SegBtn key={v} active={waves === v} onClick={() => selectOne(v, setWaves)}>
                    {v}
                  </SegBtn>
                ))}
              </div>
            </div>

            {/* Correnteza (single agora) */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Correnteza</label>
              <span className="hint">Como estava a correnteza?</span>
              <div className="segmented" style={{ flexWrap: "wrap", rowGap: 8 }}>
                {["Nenhum","Leve","Médio","Forte"].map(v => (
                  <SegBtn key={v} active={current === v} onClick={() => selectOne(v, setCurrent)}>
                    {v}
                  </SegBtn>
                ))}
              </div>
            </div>

            {/* Ondulação (continua multi) */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Ondulação</label>
              <span className="hint">Como estava a ondulação?</span>
              <div className="segmented" style={{ flexWrap: "wrap", rowGap: 8 }}>
                {["Nenhum","Leve","Médio","Forte"].map(v => (
                  <SegBtn key={v} active={current === v} onClick={() => selectOne(v, setCurrent)}>
                    {v}
                  </SegBtn>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="form-actions" style={{ gap: 12 }}>
              <Link to="/logged/registrar-mergulho/Step2" className="btn-outline">
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

// src/pages/RegisterDive/Step4.jsx
import React, { useState, useCallback, useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

/* Reaproveita o CSS da sidebar */
import "../Logged/logged.css";
/* CSS compartilhado do fluxo de registro */
import "./register-dive.css";

export default function Step4() {
  const navigate = useNavigate();

  /* ---------- Estado dos campos ---------- */
  // Seleções single
  const [suit, setSuit] = useState("");                 // Roupa
  const [cylMaterial, setCylMaterial] = useState("");   // Aço | Alumínio | Outros
  const [gasMix, setGasMix] = useState("");             // AR | EANx32 | ...

  // Multi-select
  const [extras, setExtras] = useState(new Set());      // Capuz | Luvas | Botas

  // Inputs
  const [ballast, setBallast] = useState("");           // lastro
  const [cylSize, setCylSize] = useState("");           // tamanho do cilindro
  const [pIni, setPIni] = useState("");                 // pressão inicial (bar)
  const [pFim, setPFim] = useState("");                 // pressão final (bar)
  const [extrasOther, setExtrasOther] = useState("");

  /* ---------- Helpers de seleção ---------- */
  const selectOne = useCallback((value, setter) => setter(value), []);
  const toggleInSet = useCallback((value, setter) => {
    setter(prev => {
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
      <img src={icon} alt="" className="logged__icon" aria-hidden />
      <span>{label}</span>
    </NavLink>
  );

  /* ---------- Cálculo automático: Quantidade Usada ---------- */
  const qUsed = useMemo(() => {
    const ini = Number(pIni);
    const fim = Number(pFim);
    if (
      Number.isFinite(ini) &&
      Number.isFinite(fim) &&
      ini > 0 &&
      fim >= 0 &&
      ini >= fim
    ) {
      return `${ini - fim} bar`;
    }
    return "";
  }, [pIni, pFim]);

  const handleNext = (e) => {
    e.preventDefault();
    // salvar em contexto/store se necessário
    navigate("/logged/registrar-mergulho/Step5");
  };

  return (
    <div className="logged">
      {/* ========= Sidebar ========= */}
      <aside className="logged__sidebar">
        <div className="logged__brand">
          <img
            src="/images/logo-atlantida-branca.png"
            alt="Atlântida"
            className="logged__logoImg"
          />
        </div>

        <nav className="logged__nav">
          <MenuLink end to="/logged" label="Início" icon="/images/mini-icon/início.png" />
          <MenuLink to="/logged/estatisticas" label="Estatísticas" icon="/images/mini-icon/estatística.png" />
          <MenuLink to="/logged/locais" label="Locais de mergulho" icon="/images/mini-icon/locais-de-mergulho.png" />
          <MenuLink to="/logged/certificados" label="Certificados" icon="/images/mini-icon/certificados.png" />
          <MenuLink to="/logged/perfil" label="Perfil do usuário" icon="/images/mini-icon/perfil.png" />
        </nav>

        <div className="logged__card">
          <div className="logged__cardMedia">
            <img src="/images/logo-mergulho.png" alt="" aria-hidden />
          </div>
          <Link to="/logged/registrar-mergulho" className="logged__primaryBtn">
            <span className="logged__plus" aria-hidden>＋</span>
            Registrar mergulho
          </Link>
        </div>

        <Link to="/login" className="logged__logout">
          <img src="/images/mini-icon/Sair.png" alt="" className="logged__icon" aria-hidden />
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

          {/* Steps (Etapa 4 ativa) */}
          <nav className="steps">
            <span className="steps__item">
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
            <span className="steps__item is-active" aria-current="step">
              <span className="steps__num">4</span>
              <span className="steps__label">Equipamentos</span>
            </span>
            <span className="steps__item">
              <span className="steps__num">5</span>
              <span className="steps__label">Experiência e Observações</span>
            </span>
          </nav>
          <div className="steps__progress is-4" aria-hidden="true" />

          <p className="register__stage">Etapa 4 de 5</p>

          {/* ===== Formulário – Equipamentos ===== */}
          <form className="card form" onSubmit={handleNext} noValidate>
            <h2 className="form__title">Equipamentos</h2>

            {/* Roupa (single) */}
            <div className="field">
              <label className="label">Roupa</label>
              <span className="hint">Com que roupa você vestiu?</span>
              <div className="segmented" style={{ flexWrap: "wrap", gap: 8 }}>
                {[
                  "Nenhum",
                  "Roupa longa 3mm",
                  "Roupa longa 5mm",
                  "Roupa longa 7mm",
                  "Curta",
                  "Semi seca",
                  "Roupa seca",
                ].map(v => (
                  <SegBtn
                    key={v}
                    active={suit === v}
                    onClick={() => selectOne(v, setSuit)}
                  >
                    {v}
                  </SegBtn>
                ))}
              </div>
            </div>

            {/* Lastro */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Lastro</label>
              <span className="hint">Qual foi a quantidade do seu lastro?</span>
              <input
                type="text"
                className="input"
                placeholder="Lastro"
                value={ballast}
                onChange={(e) => setBallast(e.target.value)}
              />
            </div>

            {/* Cilindro (material single + tamanho input) */}
            <div className="form-grid" style={{ marginTop: 6 }}>
              <div className="field">
                <label className="label">Cilindro</label>
                <span className="hint">Qual tipo de cilindro você usou?</span>
                <div className="segmented" style={{ gap: 8 }}>
                  {["Aço","Alumínio","Outros"].map(v => (
                    <SegBtn
                      key={v}
                      active={cylMaterial === v}
                      onClick={() => selectOne(v, setCylMaterial)}
                    >
                      {v}
                    </SegBtn>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="label">&nbsp;</label>
                <span className="hint">Tamanho do cilindro</span>
                <input
                  type="text"
                  className="input"
                  placeholder="Tamanho do Cilindro"
                  value={cylSize}
                  onChange={(e) => setCylSize(e.target.value)}
                />
              </div>
            </div>

            {/* Mistura gasosa (single) */}
            <div className="field" style={{ marginTop: 6 }}>
              <label className="label">Mistura Gasosa</label>
              <span className="hint">Que tipo de gás você usou?</span>
              <div className="segmented" style={{ flexWrap: "wrap", gap: 8 }}>
                {["AR","EANx32","EANx36","EANx40","Enriquecido","Trimix","Rebreather"].map(v => (
                  <SegBtn
                    key={v}
                    active={gasMix === v}
                    onClick={() => selectOne(v, setGasMix)}
                  >
                    {v}
                  </SegBtn>
                ))}
              </div>
            </div>

            {/* Pressão do Cilindro (com cálculo automático) */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Pressão do Cilindro</label>

              <input
                type="number"
                className="input"
                placeholder="Pressão Inicial (bar)"
                value={pIni}
                onChange={(e) => setPIni(e.target.value)}
                min="0"
                step="1"
                inputMode="numeric"
              />

              <input
                type="number"
                className="input"
                placeholder="Pressão Final (bar)"
                value={pFim}
                onChange={(e) => setPFim(e.target.value)}
                min="0"
                step="1"
                inputMode="numeric"
                style={{ marginTop: 8 }}
              />

              <input
                type="text"
                className="input"
                placeholder="Quantidade Usada"
                value={qUsed}
                readOnly
                style={{
                  marginTop: 8,
                  background: "#f3f4f6",
                  color: "#6b7280",
                  cursor: "not-allowed"
                }}
              />
            </div>

            {/* Equipamentos adicionais (multi + “Outros”) */}
            <div className="field" style={{ marginTop: 6 }}>
              <label className="label">Equipamentos Adicionais</label>
              <span className="hint">Quais outros equipamentos usou?</span>
              <div className="segmented" style={{ gap: 8, marginBottom: 8 }}>
                {["Capuz","Luvas","Botas"].map(v => (
                  <SegBtn
                    key={v}
                    active={extras.has(v)}
                    onClick={() => toggleInSet(v, setExtras)}
                  >
                    {v}
                  </SegBtn>
                ))}
              </div>
              <input
                type="text"
                className="input"
                placeholder="Outros"
                value={extrasOther}
                onChange={(e) => setExtrasOther(e.target.value)}
              />
            </div>

            {/* Ações */}
            <div className="form-actions" style={{ gap: 12 }}>
              <Link to="/logged/registrar-mergulho/Step3" className="btn-outline">
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

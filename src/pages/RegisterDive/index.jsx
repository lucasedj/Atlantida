// src/pages/RegisterDive/index.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDraftField } from "./useDiveDraft";
import { apiFetch } from "../../services/api";

import "../logged/logged.css";
import "./register-dive.css";

/* ================================
 * Autocomplete de "Local de mergulho"
 * ================================ */
function AutocompletePlace({
  value,
  onChangeText,
  onSelect,             // recebe (spot) ou (null) se livre
  onCreateNew,          // clicar em "Não achou..."
  onMatchChange,        // <<< NOVO: (isExactMatch:boolean, spot|null)
  placeholder = "Cidade / Ponto",
  inputId = "local",
}) {
  const [open, setOpen] = useState(false);
  const [allSpots, setAllSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef(null);
  const listId = "place-suggestions";

  // carrega os spots quando o campo recebe foco (uma vez)
  const ensureLoad = async () => {
    if (allSpots.length || loading) return;
    try {
      setLoading(true);
      const data = await apiFetch("/api/divingSpots", { auth: true });
      setAllSpots(Array.isArray(data) ? data : []);
    } catch {
      setAllSpots([]);
    } finally {
      setLoading(false);
    }
  };

  // fecha ao clicar fora
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return allSpots.slice(0, 8);
    return allSpots
      .filter((s) => (s.name || "").toLowerCase().includes(q))
      .slice(0, 8);
  }, [value, allSpots]);

  const hasResults = filtered.length > 0;

  // Match exato (para validar antes de avançar)
  const exactSpot = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return null;
    if (loading || !allSpots.length) return null; // aguarda carregar para validar
    return allSpots.find((s) => (s.name || "").toLowerCase() === q) || null;
  }, [value, allSpots, loading]);

  const notFound = Boolean((value || "").trim()) && !exactSpot;

  // Notifica o pai sempre que o match mudar
  useEffect(() => {
    onMatchChange?.(!!exactSpot, exactSpot);
  }, [exactSpot, onMatchChange]);

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length)); // inclui o item "criar"
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // último índice é o CTA "criar"
      if (highlight === filtered.length) {
        onCreateNew?.();
        setOpen(false);
        return;
      }
      if (highlight >= 0 && filtered[highlight]) {
        const s = filtered[highlight];
        onChangeText?.(s.name || "");
        onSelect?.(s);
        onMatchChange?.(true, s); // garante estado válido
        setOpen(false);
      } else {
        // enter com texto livre
        onSelect?.(null);
        onMatchChange?.(false, null);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="auto" ref={boxRef} data-notfound={notFound || undefined}>
      <input
        id={inputId}
        name={inputId}
        type="text"
        className="input"
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onChangeText?.(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          ensureLoad();
        }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          highlight >= 0
            ? `opt-${filtered[highlight]?._id || "create"}`
            : undefined
        }
        aria-invalid={notFound ? true : undefined}
        required
      />

      {open && (
        <div className="auto__panel" role="listbox" id={listId}>
          {loading && <div className="auto__item is-muted">Carregando locais…</div>}

          {!loading && hasResults && (
            <>
              {filtered.map((s, i) => (
                <button
                  key={s._id}
                  id={`opt-${s._id}`}
                  type="button"
                  role="option"
                  aria-selected={highlight === i}
                  className={`auto__item${highlight === i ? " is-active" : ""}`}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChangeText?.(s.name || "");
                    onSelect?.(s);
                    onMatchChange?.(true, s);
                    setOpen(false);
                  }}
                  title={s.name}
                >
                  <span className="auto__title">{s.name || "Ponto de mergulho"}</span>
                  {typeof s.avgRating === "number" && (
                    <small className="auto__sub">⭐ {s.avgRating.toFixed(1)}</small>
                  )}
                </button>
              ))}
            </>
          )}

          {!loading && (
            <button
              id="opt-create"
              type="button"
              role="option"
              aria-selected={highlight === filtered.length}
              className={`auto__item auto__create${
                highlight === filtered.length ? " is-active" : ""
              }`}
              onMouseEnter={() => setHighlight(filtered.length)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onCreateNew?.();
                setOpen(false);
              }}
            >
              Não achou o local? <u>Clica aqui para criar!</u>
            </button>
          )}
        </div>
      )}

      {/* Aviso abaixo do campo quando não há match exato */}
      {notFound && (
        <p className="field__error" role="status" aria-live="polite">
          local de mergulho não encontrado
        </p>
      )}
    </div>
  );
}

export default function RegisterDive() {
  const navigate = useNavigate();

  // campos persistentes da etapa 1
  const [title, setTitle]       = useDraftField("title", "");
  const [place, setPlace]       = useDraftField("place", "");
  const [date, setDate]         = useDraftField("date", "");          // yyyy-mm-dd
  const [diveType, setDiveType] = useDraftField("diveType", "costa"); // 'costa' | 'barco' | 'outros'

  // controle de validade do "Local de Mergulho"
  const [placeValid, setPlaceValid] = useState(false);

  // erro local do formulário (não persiste)
  const [formErr, setFormErr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !place.trim() || !date) {
      setFormErr("Preencha Título, Local e Data para continuar.");
      return;
    }
    if (!placeValid) {
      setFormErr("Local de mergulho não encontrado. Se preferir, crie em 'Locais de mergulho'.");
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

  const nextDisabled =
    !title.trim() || !place.trim() || !date || !placeValid;

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

                {/* Autocomplete */}
                <AutocompletePlace
                  inputId="local"
                  value={place}
                  onChangeText={setPlace}
                  onSelect={() => {/* opcional: guardar id se quiser */}}
                  onCreateNew={() => navigate("/logged/locais")}
                  onMatchChange={(ok/* boolean */, spot) => setPlaceValid(ok)}  // <<< NOVO
                  placeholder="Cidade / Ponto"
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
              <button className="btn-primary" type="submit" disabled={nextDisabled}>
                PRÓXIMA ETAPA
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

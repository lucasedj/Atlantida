// src/pages/RegisterDive/Step5.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import "../Logged/logged.css";
import "./register-dive.css";

/** Img com fallback em caminhos de /public */
function PublicImg({ candidates, alt = "", className = "", style }) {
  const [idx, setIdx] = useState(0);
  const src = candidates[Math.min(idx, candidates.length - 1)];
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        if (idx < candidates.length - 1) setIdx((i) => i + 1);
      }}
    />
  );
}

export default function Step5() {
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState("");
  const [files, setFiles] = useState([]); // {file, url}

  const BASE = import.meta.env.BASE_URL || "/";
  const withBase = (p) => `${BASE}${p}`;

  // Ícone do upload — deixe o arquivo em public/images/mini-icon/Upload.png
  const uploadCandidates = useMemo(
    () => [
      withBase("images/mini-icon/Upload.png"),
      withBase("images/mini-icon/upload.png"),
      withBase("images/Upload.png"),
      withBase("images/upload.png"),
      // SVG fallback
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M20 5l7 7h-5v10h-4V12h-5l7-7z' fill='%238A8A8A'/><rect x='8' y='30' width='24' height='3' rx='1.5' fill='%238A8A8A'/></svg>",
    ],
    [BASE]
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
    // aqui você enviaria os dados e as fotos
    navigate("/logged");
  };

  /** Ao escolher arquivos, gera URLs de preview */
  const handleFiles = (fileList) => {
    const arr = Array.from(fileList || []);
    const next = arr.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setFiles((prev) => [...prev, ...next]);
  };

  const onInputChange = (e) => handleFiles(e.target.files);
  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };
  const onDragOver = (e) => e.preventDefault();

  const removeFile = (idx) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx]?.url);
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  // Limpa URLs quando sair da página
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="logged">
      {/* ========= Sidebar ========= */}
      <aside className="logged__sidebar" aria-label="Navegação principal">
        <div className="logged__brand">
          <img
            src={withBase("images/logo-atlantida-branca.png")}
            alt="Atlântida"
            className="logged__logoImg"
          />
        </div>

        <nav className="logged__nav">
          <MenuLink end to="/logged" label="Início" icon={withBase("images/mini-icon/início.png")} />
          <MenuLink to="/logged/estatisticas" label="Estatísticas" icon={withBase("images/mini-icon/estatística.png")} />
          <MenuLink to="/logged/locais" label="Locais de mergulho" icon={withBase("images/mini-icon/locais-de-mergulho.png")} />
          <MenuLink to="/logged/certificados" label="Certificados" icon={withBase("images/mini-icon/certificados.png")} />
          <MenuLink to="/logged/perfil" label="Perfil do usuário" icon={withBase("images/mini-icon/perfil.png")} />
        </nav>

        <div className="logged__card" aria-label="Atalho para registrar mergulho">
          <div className="logged__cardMedia">
            <img src={withBase("images/logo-mergulho.png")} alt="" aria-hidden />
          </div>
          <Link to="/logged/registrar-mergulho" className="logged__primaryBtn">
            <span className="logged__plus" aria-hidden>＋</span>
            Registrar mergulho
          </Link>
        </div>

        <Link to="/login" className="logged__logout">
          <img src={withBase("images/mini-icon/Sair.png")} alt="" aria-hidden className="logged__icon" />
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

          {/* Steps */}
          <nav className="steps" aria-label="Etapas do formulário">
            <span className="steps__item"><span className="steps__num">1</span><span className="steps__label">Informações Gerais</span></span>
            <span className="steps__item"><span className="steps__num">2</span><span className="steps__label">Profundidade e Tempo</span></span>
            <span className="steps__item"><span className="steps__num">3</span><span className="steps__label">Condições Ambientais</span></span>
            <span className="steps__item"><span className="steps__num">4</span><span className="steps__label">Equipamentos</span></span>
            <span className="steps__item is-active" aria-current="step"><span className="steps__num">5</span><span className="steps__label">Experiência e Observações</span></span>
          </nav>
          <div className="steps__progress is-5" aria-hidden="true" />
          <p className="register__stage">Etapa 5 de 5</p>

          {/* ===== Form ===== */}
          <form className="card form" onSubmit={handleSubmit} noValidate>
            <h2 className="form__title">Experiência e Observações</h2>

            {/* Opinião */}
        <div className="field">
        <span className="label">Opinião</span>
        <span className="hint">Dê uma nota para esse local</span>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            {[1, 2, 3, 4, 5].map((i) => {
            const filled = i <= rating;
            return (
                <button
                key={i}
                type="button"
                aria-label={`${i} estrela${i > 1 ? "s" : ""}`}
                aria-pressed={filled}
                onClick={() => setRating(i)}
                className="segmented__btn"
                style={{
                    width: 40,
                    height: 36,
                    padding: 0,
                    fontSize: 22,
                    lineHeight: 1,
                    color: filled ? "gold" : "#9ca3af", // ⭐ amarelo se selecionado, cinza se não
                }}
                title={`${i} / 5`}
                >
                {filled ? "★" : "☆"}
                </button>
            );
            })}
        </div>
        </div>

            {/* Dificuldade */}
            <div className="field" style={{ marginTop: 12 }}>
              <span className="label">Dificuldade</span>
              <span className="hint">Qual foi o nível de dificuldade neste local?</span>
              <div className="segmented" style={{ gap: 8 }}>
                {["Pequena", "Média", "Grande"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`segmented__btn${difficulty === opt ? " is-selected" : ""}`}
                    onClick={() => setDifficulty(opt)}
                    aria-pressed={difficulty === opt}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Comentário */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label" htmlFor="comentario">Comentário</label>
              <span className="hint">Anote as memórias do seu mergulho</span>
              <textarea
                id="comentario"
                className="input"
                placeholder="Insira sua avaliação aqui"
                style={{ height: 180, paddingTop: 10, paddingBottom: 10, resize: "vertical" }}
              />
            </div>

            {/* Fotos (dropzone clicável + preview) */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Fotos</label>
              <span className="hint">O que você viu durante seu mergulho?</span>

              {/* Input hidden para clicar na área */}
              <input
                id="photosInput"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onInputChange}
              />

              {/* Área clicável e com suporte a arrastar/soltar */}
              <label
                htmlFor="photosInput"
                className="dropzone dropzone--clickable"
                style={{ marginTop: 8 }}
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: 6,
                    minHeight: 140,
                  }}
                >
                  <PublicImg
                    candidates={uploadCandidates}
                    alt="Upload"
                    style={{ width: 40, height: 40, opacity: 0.7 }}
                  />
                  <div>
                    <strong>Arraste e solte</strong> ou <u>clique para enviar</u>
                  </div>
                </div>
              </label>

              {/* Thumbnails */}
              {files.length > 0 && (
                <div
                  className="thumbs-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  {files.map((f, idx) => (
                    <div
                      className="thumb"
                      key={f.url}
                      style={{
                        position: "relative",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "#fff",
                      }}
                    >
                      <img
                        src={f.url}
                        alt={`Foto ${idx + 1}`}
                        style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                      />
                      <button
                        type="button"
                        className="thumb__remove"
                        onClick={() => removeFile(idx)}
                        aria-label="Remover foto"
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          border: "none",
                          background: "rgba(0,0,0,.6)",
                          color: "#fff",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="form-actions" style={{ gap: 12 }}>
              <Link to="/logged/registrar-mergulho/Step4" className="btn-outline">
                ETAPA ANTERIOR
              </Link>
              <button type="submit" className="btn-primary">
                REGISTRAR MERGULHO
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

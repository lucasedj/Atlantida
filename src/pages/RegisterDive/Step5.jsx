// src/pages/RegisterDive/Step5.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

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

  // avaliação desta etapa (persistida em draft)
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState("");
  const [comment, setComment] = useState("");

  // fotos desta etapa (não persistimos arquivos no localStorage)
  const [files, setFiles] = useState([]); // [{file, url}]
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const BASE = import.meta.env.BASE_URL || "/";
  const withBase = (p) => `${BASE}${p}`;

  // Ícone do upload
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

  // ========== Draft helpers ==========
  const DRAFT_KEY = "diveDraft";
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const saveDraft = (patch) => {
    const prev = loadDraft() || {};
    const next = { ...prev, ...patch };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
    return next;
  };
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  };

  // hidrata rating/difficulty/comment do draft
  useEffect(() => {
    const d = loadDraft();
    if (!d) return;
    if (typeof d.rating === "number") setRating(d.rating);
    if (d.difficulty) setDifficulty(d.difficulty);
    if (d.comment != null) setComment(String(d.comment));
  }, []);

  // autosave desses 3 campos
  useEffect(() => {
    saveDraft({ rating, difficulty, comment });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rating, difficulty, comment]);

  // arquivos -> previews (não persistimos em draft por serem File/Blob)
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

  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Converte Files -> [{data, contentType}]
  const filesToBase64 = async (fileObjs) => {
    const read = (file) =>
      new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
          const result = String(fr.result || "");
          const match = result.match(/^data:(.+?);base64,(.*)$/);
          if (match) {
            resolve({ contentType: match[1], data: match[2] });
          } else {
            resolve({
              contentType: file.type || "application/octet-stream",
              data: result,
            });
          }
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });

    return Promise.all(fileObjs.map(read));
  };

  // normaliza string para minúsculas sem acentos
  const norm = (s) =>
    (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // mapeia 'Pequena/Média/Grande' -> 'BAIXO/MODERADO/ALTO'
  const difficultyToLevel = (txt) => {
    const t = norm(txt);
    if (t === "grande") return "ALTO";
    if (t === "media" || t === "média") return "MODERADO";
    if (t === "pequena") return "BAIXO";
    return undefined;
  };

  // tenta descobrir o _id do spot pelo nome (igual ignorando acento/maiúsculas)
  const findSpotIdByName = async (placeName) => {
    if (!placeName) return null;
    try {
      const data = await apiFetch("/api/divingSpots", { auth: true });
      const arr = Array.isArray(data) ? data : [];
      const target = norm(placeName);
      const found = arr.find((s) => norm(s.name) === target);
      return found?._id || null;
    } catch {
      return null;
    }
  };

  // ========== SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSubmitting(true);

    try {
      const d = loadDraft() || {};

      const toNum = (v) =>
        v === "" || v == null || Number.isNaN(Number(v))
          ? undefined
          : Number(v);
      const toArr = (v) =>
        Array.isArray(v) ? v : v instanceof Set ? Array.from(v) : v ? [v] : [];

      // Geral (vindos das etapas anteriores)
      const title = d.title || d.titulo || "";
      const placeStr = d.place || d.location || d.local || ""; // texto digitado na etapa 1
      const date = d.date || d.data || ""; // yyyy-mm-dd
      const type = d.diveType || d.tipoMergulho || "";

      // Se você já tiver salvo um ID do ponto:
      let divingSpotId = d.divingSpotId || undefined;

      // Profundidade/tempo
      const depth = toNum(d.depth ?? d.maxDepth);
      const bottomTimeInMinutes = toNum(
        d.bottomTimeInMinutes ?? d.bottomTime ?? d.timeBottom
      );

      // Ambientais
      const weatherConditions = d.weather;
      const temperature = {
        air: toNum(d.tAir),
        surface: toNum(d.tSurface),
        bottom: toNum(d.tBottom),
      };
      const waterType = d.waterType;
      const visibility = d.visibility; // já compatível com ALTO/MODERADO/BAIXO se veio da etapa 3
      const waves = d.waves;
      const current = d.current;
      const surge = Array.isArray(d.swell) ? d.swell.join(", ") : d.swell;

      // Equipamentos
      const suit = d.suit;
      const weight = d.ballast;

      const additionalEquipment = (() => {
        const base = toArr(d.extras);
        if (d.extrasOther && String(d.extrasOther).trim())
          base.push(String(d.extrasOther).trim());
        return base;
      })();

      const cylinder = {
        type: d.cylMaterial,
        size: toNum(d.cylSize),
        gasMixture: d.gasMix,
        initialPressure: toNum(d.pIni),
        finalPressure: toNum(d.pFim),
      };
      if (
        cylinder.initialPressure != null &&
        cylinder.finalPressure != null &&
        cylinder.initialPressure >= cylinder.finalPressure
      ) {
        cylinder.usedAmount = cylinder.initialPressure - cylinder.finalPressure;
      }

      // Etapa 5 (atuais)
      const ratingNum = rating || undefined;
      const diffMap = { pequena: 1, media: 3, grande: 5 };
      const difficultyNum = diffMap[norm(difficulty)];
      const difficultyLevel = difficultyToLevel(difficulty); // 'ALTO' | 'MODERADO' | 'BAIXO' | undefined
      const notes = comment?.trim() || undefined;

      // Validação dos obrigatórios
      const missing = [];
      if (!title.trim()) missing.push("Título");
      if (!(divingSpotId || placeStr.trim())) missing.push("Local");
      if (!date) missing.push("Data");
      if (!type) missing.push("Tipo");
      if (depth === undefined) missing.push("Profundidade");
      if (bottomTimeInMinutes === undefined) missing.push("Tempo no fundo");

      if (missing.length) {
        setMsg(`Preencha: ${missing.join(", ")}.`);
        setSubmitting(false);
        return;
      }

      // Fotos
      const photos = await filesToBase64(files.map((f) => f.file)); // [{data, contentType}]

      // ===== 1) Salva o log do mergulho =====
      const payload = {
        title,
        date,
        type,
        depth,
        bottomTimeInMinutes,
        waterType,
        weatherConditions,
        temperature,
        visibility,
        waves,
        current,
        surge,
        suit,
        weight,
        additionalEquipment,
        cylinder,
        rating: ratingNum,
        difficulty: difficultyNum, // mantém numérico no log (1/3/5) como já estava
        notes,
        photos,
        ...(divingSpotId ? { divingSpotId } : { place: placeStr }), // usa 'place' se não houver ID
      };

      await apiFetch("/api/diveLogs", {
        method: "POST",
        auth: true,
        body: payload,
      });

      // ===== 2) Gera a AVALIAÇÃO para o ponto =====
      // Resolve o _id do spot se ainda não tiver
      if (!divingSpotId && placeStr) {
        divingSpotId = await findSpotIdByName(placeStr);
      }

      // Só cria avaliação se houver spotId e algum conteúdo relevante
      if (divingSpotId && (ratingNum || notes || (photos && photos.length))) {
        const reviewBody = {
          divingSpotId,
          rating: ratingNum,
          difficultyLevel, // ALTO | MODERADO | BAIXO
          visibility,      // se veio da Etapa 3
          comment: notes,
          photos,
        };

        try {
          await apiFetch("/api/comments", {
            method: "POST",
            auth: true,
            body: reviewBody,
          });
        } catch {
          try {
            await apiFetch(`/api/divingSpots/${divingSpotId}/comments`, {
              method: "POST",
              auth: true,
              body: reviewBody,
            });
          } catch {
            // não bloqueia o fluxo se a avaliação falhar
          }
        }
      }

      clearDraft();
      setMsg("Mergulho registrado com sucesso!");
      navigate("/logged");
    } catch (error) {
      setMsg(error?.message || "Não foi possível registrar o mergulho.");
    } finally {
      setSubmitting(false);
    }
  };

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

          {/* Mensagem */}
          {msg && (
            <p aria-live="polite" style={{ marginBottom: 12, color: msg.includes("sucesso") ? "#16a34a" : "#dc2626" }}>
              {msg}
            </p>
          )}

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
                        color: filled ? "gold" : "#9ca3af",
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
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ height: 180, paddingTop: 10, paddingBottom: 10, resize: "vertical" }}
              />
            </div>

            {/* Fotos */}
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label">Fotos</label>
              <span className="hint">O que você viu durante seu mergulho?</span>

              <input
                id="photosInput"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onInputChange}
              />

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
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "REGISTRANDO..." : "REGISTRAR MERGULHO"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

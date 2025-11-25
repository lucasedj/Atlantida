// src/pages/Certificates/Certificates.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { apiFetch, toPublicUrl } from "../../services/api";

import "../logged/logged.css";
import "./certificates.css";

export default function Certificates() {
  const [open, setOpen] = useState(false);          // modal "Adicionar"
  const [viewOpen, setViewOpen] = useState(false);  // modal "Ver detalhes"
  const [selected, setSelected] = useState(null);   // cert selecionado

  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  const [form, setForm] = useState({
    name: "",
    agency: "",
    number: "",
    level: "",
    issueDate: "",
    expiryDate: "",
  });

  // --- novo: modal de confirmação de exclusão ---
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- helpers simples ---
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "--");

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(URL.createObjectURL(f));
  };

  const clearFile = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(null);
    setFileUrl("");
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    clearFile();
    setForm({
      name: "",
      agency: "",
      number: "",
      level: "",
      issueDate: "",
      expiryDate: "",
    });
  };

  // --- carregar lista do usuário ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const data = await apiFetch("/api/certificates", { method: "GET", auth: true });
        if (mounted) setCerts(Array.isArray(data) ? data : (data?.items || []));
      } catch (e) {
        if (mounted) setErr(e?.message || "Falha ao carregar certificados.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- abrir modal de visualização ---
  const openDetails = (cert) => {
    setSelected(cert);
    setViewOpen(true);
  };

  // --- excluir certificado (execução real) ---
  const handleDelete = async (id) => {
    if (!id) return;
    setDeleting(true);
    setErr("");
    try {
      await apiFetch(`/api/certificates/${id}`, { method: "DELETE", auth: true });
      setCerts((prev) => prev.filter((c) => (c._id || c.id) !== id));
      setViewOpen(false);
      setSelected(null);
      setDeleteOpen(false);
    } catch (e) {
      setErr(e?.message || "Não foi possível excluir o certificado.");
    } finally {
      setDeleting(false);
    }
  };

  // --- adicionar (POST) ---
  const handleAdd = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.name?.trim() || !form.agency?.trim() || !form.number?.trim()) {
      setErr("Preencha Nome do certificado, Credenciadora e Nº de certificação.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("certificateName", form.name);
      fd.append("accreditor", form.agency);
      fd.append("certificationNumber", form.number);
      fd.append("level", form.level || "");
      fd.append("issueDate", form.issueDate || "");
      fd.append("expiryDate", form.expiryDate || "");
      if (file) fd.append("file", file);

      const created = await apiFetch("/api/certificates", {
        method: "POST",
        auth: true,
        body: fd,
      });

      setCerts((prev) => [created, ...prev]);
      resetForm();
      setOpen(false);
    } catch (e) {
      setErr(e?.message || "Não foi possível adicionar o certificado.");
    }
  };

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

  // --- card clicável ---
  const CertCard = ({ cert }) => {
    const name = cert.certificateName ?? cert.name ?? "Sem nome";
    const agency = cert.accreditor ?? cert.agency;
    const number = cert.certificationNumber ?? cert.number;
    const issueDate = cert.issueDate ?? cert.emissionDate ?? cert.issuedAt;
    const expiryDate = cert.expiryDate ?? cert.expirationDate ?? cert.validUntil;

    const raw =
      cert.fileUrl || cert.imageUrl || cert.url || cert.file?.url || cert.filePath || "";
    const src = raw ? toPublicUrl(raw) : "";
    const isPDF = src.toLowerCase().endsWith(".pdf");

    const onErr = (e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "/images/cert-placeholder.png";
    };

    return (
      <article
        className="cert__card cert__card--clickable"
        onClick={() => openDetails(cert)}
        onKeyDown={(ev) => (ev.key === "Enter" ? openDetails(cert) : null)}
        tabIndex={0}
        role="button"
        aria-label={`Abrir ${name}`}
      >
        <figure className="cert__figure">
          {src ? (
            isPDF ? (
              <div className="cert__pdfThumb"><span>PDF</span></div>
            ) : (
              <img className="cert__image" src={src} alt={`Certificado: ${name}`} onError={onErr} />
            )
          ) : (
            <div className="cert__placeholder" aria-hidden>📄</div>
          )}

          <figcaption className="cert__caption">
            <strong className="cert__name">{name}</strong>
            <div className="cert__meta">
              {agency && <span><b>Agência:</b> {agency}</span>}
              {number && <span> · <b>Nº:</b> {number}</span>}
              {issueDate && <span> · <b>Emissão:</b> {fmtDate(issueDate)}</span>}
              {expiryDate && <span> · <b>Validade:</b> {fmtDate(expiryDate)}</span>}
              {cert.level && <span> · <b>Nível:</b> {cert.level}</span>}
            </div>
          </figcaption>
        </figure>
      </article>
    );
  };

  return (
    <div className="logged">
      {/* ===== Sidebar ===== */}
      <aside className="logged__sidebar">
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
        <div className="page cert__wrap">
          <header className="cert__head">
            <h1 className="cert__title">Certificados</h1>
            <p className="cert__subtitle">Registre suas conquistas, armazene e visualize seus certificados.</p>
          </header>

          {err && <p style={{ color: "#dc2626" }}>{err}</p>}

          <section>
            <h2 className="cert__sectionTitle">Seus certificados</h2>

            <div className="cert__grid">
              <button
                type="button"
                className="cert__add"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-controls="add-cert-modal"
              >
                <span className="cert__addIcon" aria-hidden>
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none">
                    <path d="M6 4h9l3 3v13H6V4z" stroke="#c0c7d1" strokeWidth="1.5" />
                    <path d="M9 11h6M12 8v6" stroke="#c0c7d1" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="cert__addText">Adicionar Certificado</span>
              </button>

              {loading ? (
                <div className="cert__skeleton">Carregando...</div>
              ) : certs.length === 0 ? (
                <div className="cert__empty">Você ainda não cadastrou certificados.</div>
              ) : (
                certs.map((c) => <CertCard key={c._id || c.id || Math.random()} cert={c} />)
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ===== Modal: Ver Detalhes ===== */}
      {viewOpen && selected && (
        <div
          className="certModal__backdrop"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setViewOpen(false); }}
        >
          <div
            className="certView"
            role="dialog"
            aria-modal="true"
            aria-labelledby="certViewTitle"
          >
            <header className="certModal__head">
              <h3 id="certViewTitle" className="certModal__title">Informações do Certificado</h3>
              <div className="certView__actions">
                <button
                  type="button"
                  className="certView__delete"
                  title="Excluir certificado"
                  aria-label="Excluir certificado"
                  onClick={() => setDeleteOpen(true)}
                >
                  🗑️
                </button>
                <button
                  type="button"
                  className="certModal__close"
                  aria-label="Fechar"
                  onClick={() => setViewOpen(false)}
                >
                  ×
                </button>
              </div>
            </header>

            <div className="certView__body">
              {/* Imagem / PDF */}
              <div className="certView__imageBox">
                {(() => {
                  const raw =
                    selected.fileUrl ||
                    selected.imageUrl ||
                    selected.url ||
                    selected.file?.url ||
                    selected.filePath ||
                    "";
                  const src = raw ? toPublicUrl(raw) : "";
                  const isPDF = src.toLowerCase().endsWith(".pdf");
                  if (!src) return <div className="cert__placeholder" aria-hidden>📄</div>;
                  if (isPDF) {
                    return (
                      <a className="cert__pdfThumb cert__pdfThumb--big" href={src} target="_blank" rel="noreferrer">
                        <span>PDF — abrir</span>
                      </a>
                    );
                  }
                  return <img className="certView__image" src={src} alt="Imagem do certificado" />;
                })()}
              </div>

              {/* Infos */}
              <div className="certView__infoGrid">
                <div className="field">
                  <label className="label">Nome do certificado</label>
                  <div className="read">{selected.certificateName || selected.name || "--"}</div>
                </div>
                <div className="field">
                  <label className="label">Credenciadora</label>
                  <div className="read">{selected.accreditor || selected.agency || "--"}</div>
                </div>
                <div className="field">
                  <label className="label">Número de certificação</label>
                  <div className="read">{selected.certificationNumber || selected.number || "--"}</div>
                </div>
                <div className="field">
                  <label className="label">Nível de certificação</label>
                  <div className="read">{selected.level || selected.certificationLevel || "--"}</div>
                </div>
                <div className="field">
                  <label className="label">Data de emissão</label>
                  <div className="read">{fmtDate(selected.issueDate || selected.issuanceDate)}</div>
                </div>
                <div className="field">
                  <label className="label">Data de validade</label>
                  <div className="read">{fmtDate(selected.expiryDate || selected.expirationDate)}</div>
                </div>
              </div>
            </div>

            <footer className="certModal__footer">
              <button type="button" className="btn-primary" onClick={() => setViewOpen(false)}>
                FECHAR
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ===== Modal: Confirmação de Exclusão ===== */}
      {deleteOpen && selected && (
        <div
          className="certModal__backdrop"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteOpen(false); }}
        >
          <div
            className="certModal certConfirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deleteTitle"
          >
            <header className="certModal__head">
              <h3 id="deleteTitle" className="certModal__title">Excluir certificado</h3>
              <button
                type="button"
                className="certModal__close"
                aria-label="Fechar"
                onClick={() => setDeleteOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="certModal__body" style={{ paddingTop: 16 }}>
              <p style={{ margin: 0, color: "var(--c-ink-800, #1f2937)" }}>
                Deseja realmente excluir esse certificado?
              </p>
            </div>

            <footer className="certModal__footer">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
              >
                NÃO
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleDelete(selected._id || selected.id)}
                disabled={deleting}
                style={deleting ? { opacity: .7 } : undefined}
              >
                {deleting ? "EXCLUINDO..." : "EXCLUIR"}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ===== Modal: Adicionar (seu modal original) ===== */}
      {open && (
        <div
          className="certModal__backdrop"
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div id="add-cert-modal" role="dialog" aria-modal="true" aria-labelledby="certModalTitle" className="certModal">
            <header className="certModal__head">
              <div className="certModal__titleWrap">
                <span className="certModal__titleIcon" aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 4h9l3 3v13H6V4z" stroke="#3b82f6" strokeWidth="1.6" />
                    <path d="M9 10h6M9 13h6" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <h3 id="certModalTitle" className="certModal__title">Adicionar Certificado</h3>
              </div>
              <button type="button" className="certModal__close" aria-label="Fechar" onClick={() => setOpen(false)}>
                ×
              </button>
            </header>

            <form className="certModal__body" onSubmit={handleAdd}>
              <div className="certModal__left">
                <label htmlFor="certFile" className="certModal__label">
                  Imagem ou documento <span className="u-optional">(opcional)</span>
                </label>

                <label className="certDropzone">
                  <input id="certFile" type="file" accept="image/*,.pdf" hidden onChange={onPickFile} />
                  <div className="certDropzone__inner">
                    {fileUrl ? (
                      String(file?.name || "").toLowerCase().endsWith(".pdf") ? (
                        <div className="cert__pdfThumb" aria-label="PDF"><span>PDF</span></div>
                      ) : (
                        <img src={fileUrl} alt={file?.name || "Pré-visualização"} className="certDropzone__preview" />
                      )
                    ) : (
                      <>
                        <svg width="70" height="70" viewBox="0 0 64 64" fill="none" aria-hidden>
                          <rect x="16" y="8" width="26" height="36" rx="3" stroke="#cbd5e1" strokeWidth="2.5" />
                          <path d="M42 22h6l-6-6v6z" fill="#cbd5e1" />
                          <path d="M32 28v14" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"/>
                          <path d="M27 32l5-5 5 5" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className="certDropzone__text">
                          <div className="certDropzone__title">Selecione do seu dispositivo</div>
                          <div className="certDropzone__hint">PNG, JPG ou PDF • até 100MB</div>
                        </div>
                      </>
                    )}
                  </div>
                </label>

                {file && (
                  <button type="button" className="certDropzone__clear" onClick={clearFile}>
                    Remover arquivo
                  </button>
                )}
              </div>

              <div className="certModal__right">
                <div className="field">
                  <label className="label">Nome do certificado</label>
                  <input className="input" type="text" name="name" value={form.name} onChange={onChange} required />
                </div>

                <div className="field">
                  <label className="label">Credenciadora</label>
                  <input className="input" type="text" name="agency" value={form.agency} onChange={onChange} />
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label className="label">Número de certificação</label>
                    <input className="input" type="text" name="number" value={form.number} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label className="label">Nível de certificação <span className="u-optional">(opcional)</span></label>
                    <input className="input" type="text" name="level" value={form.level} onChange={onChange} />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label className="label">Data de emissão <span className="u-optional">(opcional)</span></label>
                    <input className="input" type="date" name="issueDate" value={form.issueDate} onChange={onChange} />
                  </div>
                  <div className="field">
                    <label className="label">Data de validade <span className="u-optional">(opcional)</span></label>
                    <input className="input" type="date" name="expiryDate" value={form.expiryDate} onChange={onChange} />
                  </div>
                </div>
              </div>

              <footer className="certModal__footer">
                <button type="button" className="btn-outline" onClick={() => setOpen(false)}>
                  CANCELAR
                </button>
                <button type="submit" className="btn-primary">ADICIONAR</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

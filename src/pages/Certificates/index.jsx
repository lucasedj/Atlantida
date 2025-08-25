import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

/* Reaproveita a sidebar/layout */
import "../Logged/logged.css";
/* Estilos específicos desta página (inclui o modal) */
import "./certificates.css";

export default function Certificates() {
  const [open, setOpen] = useState(false);

  /* preview simples do arquivo escolhido */
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFileUrl(URL.createObjectURL(f));
  };

  const clearFile = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(null);
    setFileUrl("");
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

  const handleAdd = (e) => {
    e.preventDefault();
    // aqui você poderia coletar os dados do form via FormData e enviar para sua API
    setOpen(false);
  };

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
            <p className="cert__subtitle">
              Registre suas conquistas, armazene e visualize seus certificados
              de forma prática e organizada. Vamos mergulhar na organização!
            </p>
          </header>

          <section>
            <h2 className="cert__sectionTitle">Seus certificados</h2>

            <div className="cert__grid">
              {/* Card “Adicionar Certificado” */}
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
                    <path d="M9 11h6M12 8v6" stroke="#c0c7d1" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="cert__addText">Adicionar Certificado</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* ===== Modal Adicionar Certificado ===== */}
      {open && (
        <div
          className="certModal__backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false); // fecha só clicando fora
          }}
        >
          <div
            id="add-cert-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="certModalTitle"
            className="certModal"
          >
            {/* Header */}
            <header className="certModal__head">
              <div className="certModal__titleWrap">
                <span className="certModal__titleIcon" aria-hidden>
                  {/* ícone azul no título */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 4h9l3 3v13H6V4z" stroke="#3b82f6" strokeWidth="1.6" />
                    <path d="M9 10h6M9 13h6" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <h3 id="certModalTitle" className="certModal__title">Adicionar Certificado</h3>
              </div>
              <button
                type="button"
                className="certModal__close"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>

            {/* Body */}
            <form className="certModal__body" onSubmit={handleAdd}>
              {/* Esquerda: dropzone */}
              <div className="certModal__left">
                <label htmlFor="certFile" className="certModal__label">
                  Imagem ou documento <span className="u-optional">(opcional)</span>
                </label>

                <label className="certDropzone">
                  <input
                    id="certFile"
                    type="file"
                    accept="image/*,.pdf"
                    hidden
                    onChange={onPickFile}
                  />
                  <div className="certDropzone__inner">
                    {fileUrl ? (
                      <img
                        src={fileUrl}
                        alt={file?.name || "Pré-visualização"}
                        className="certDropzone__preview"
                      />
                    ) : (
                      <>
                        {/* ícone doc + seta */}
                        <svg width="70" height="70" viewBox="0 0 64 64" fill="none" aria-hidden>
                          <rect x="16" y="8" width="26" height="36" rx="3" stroke="#cbd5e1" strokeWidth="2.5" />
                          <path d="M42 22h6l-6-6v6z" fill="#cbd5e1" />
                          <path d="M32 28v14" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"/>
                          <path d="M27 32l5-5 5 5" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>

                        <div className="certDropzone__text">
                          <div className="certDropzone__title">Selecione do seu dispositivo</div>
                          <div className="certDropzone__hint">Formatos aceitos: PNG, JPG • Máx 100MB</div>
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

              {/* Direita: campos */}
              <div className="certModal__right">
                <div className="field">
                  <label className="label">Nome do certificado</label>
                  <input className="input" type="text" placeholder="" required />
                </div>

                <div className="field">
                  <label className="label">Credenciadora</label>
                  <input className="input" type="text" placeholder="NAUI, PADI, CMAS, SSI, SDI..." />
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label className="label">Número de certificação</label>
                    <input className="input" type="text" placeholder="" />
                  </div>
                  <div className="field">
                    <label className="label">
                      Nível de certificação <span className="u-optional">(opcional)</span>
                    </label>
                    <input className="input" type="text" placeholder="" />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label className="label">
                      Data de emissão <span className="u-optional">(opcional)</span>
                    </label>
                    <input className="input" type="text" inputMode="numeric" placeholder="dd/mm/aaaa" />
                  </div>
                  <div className="field">
                    <label className="label">
                      Data de validade <span className="u-optional">(opcional)</span>
                    </label>
                    <input className="input" type="text" inputMode="numeric" placeholder="dd/mm/aaaa" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="certModal__footer">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setOpen(false)}
                >
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

import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./logged.css";          
import "../Logged/logged.css";  

export default function Certificates() {
  return (
    <div className="logged">
      {/* ===== Sidebar (igual à Logged) ===== */}
      <aside className="logged__sidebar">
        <div className="logged__brand">
          <img
            src="/images/logo-atlantida-branca.png"
            alt="Atlântida"
            className="logged__logoImg"
          />
        </div>

        <nav className="logged__nav">
          <NavLink end to="/logged" className="logged__item">
            <img className="logged__icon" src="/icons/home.svg" alt="" />
            <span>Início</span>
          </NavLink>

          <NavLink to="/logged/estatisticas" className="logged__item">
            <img className="logged__icon" src="/icons/chart.svg" alt="" />
            <span>Estatísticas</span>
          </NavLink>

          <NavLink to="/logged/locais" className="logged__item">
            <img className="logged__icon" src="/icons/pin.svg" alt="" />
            <span>Locais de mergulho</span>
          </NavLink>

          <NavLink to="/logged/certificados" className="logged__item">
            <img className="logged__icon" src="/icons/certificate.svg" alt="" />
            <span>Certificados</span>
          </NavLink>

          <NavLink to="/logged/perfil" className="logged__item">
            <img className="logged__icon" src="/icons/user.svg" alt="" />
            <span>Perfil do usuário</span>
          </NavLink>
        </nav>

        <div className="logged__card">
          <div className="logged__cardMedia">
            <img src="/images/logo-mergulho.png" alt="" aria-hidden />
          </div>
          <button className="logged__primaryBtn" type="button">
            <span className="logged__plus" aria-hidden>＋</span>
            Registrar mergulho
          </button>
        </div>

        <Link to="/login" className="logged__logout">
          <img className="logged__icon" src="/icons/logout.svg" alt="" />
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

            {/* Card “Adicionar Certificado” */}
            <button type="button" className="cert__add">
              <span className="cert__addIcon" aria-hidden>
                {/* Ícone inline para não depender de arquivo */}
                <svg width="54" height="54" viewBox="0 0 24 24" fill="none">
                  <path d="M6 4h9l3 3v13H6V4z" stroke="#c0c7d1" strokeWidth="1.5" />
                  <path d="M9 11h6M12 8v6" stroke="#c0c7d1" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="cert__addText">Adicionar Certificado</span>
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

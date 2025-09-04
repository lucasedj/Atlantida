import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./logged.css";

export default function Logged() {
  return (
    <div className="logged">
      {/* ===== Sidebar ===== */}
      <aside className="logged__sidebar">
        {/* Brand */}
        <div className="logged__brand">
          <img 
            src="/images/logo-atlantida-branca.png"  
            alt="Atlântida" 
            className="logged__logoImg"
          />
        </div>

        {/* Menu */}
        <nav className="logged__nav">
          <NavLink end to="/logged" className="logged__item">
            <img src="\images\mini-icon\início.png" alt="" className="logged__icon" />
            <span>Início</span>
          </NavLink>

          <NavLink to="/logged/estatisticas" className="logged__item">
            <img src="\images\mini-icon\estatística.png" alt="" className="logged__icon" />
            <span>Estatísticas</span>
          </NavLink>

          <NavLink to="/logged/locais" className="logged__item">
            <img src="\images\mini-icon\locais-de-mergulho.png" alt="" className="logged__icon" />
            <span>Locais de mergulho</span>
          </NavLink>

          <NavLink to="/logged/certificados" className="logged__item">
            <img src="\images\mini-icon\certificados.png" alt="" className="logged__icon" />
            <span>Certificados</span>
          </NavLink>

          <NavLink to="/logged/perfil" className="logged__item">
            <img src="\images\mini-icon\perfil.png" alt="" className="logged__icon" />
            <span>Perfil do usuário</span>
          </NavLink>
        </nav>

        {/* Card registrar mergulho */}
        <div className="logged__card">
          <div className="logged__cardMedia">
            <img src="/images/logo-mergulho.png" alt="" aria-hidden />
          </div>
          <Link
            to="/logged/registrar-mergulho"
            className="logged__primaryBtn"
            role="button"
          >
            <span className="logged__plus" aria-hidden>＋</span>
            Registrar mergulho
          </Link>
        </div>

        {/* Sair */}
        <Link to="/login" className="logged__logout">
          <img src="\images\mini-icon\Sair.png" alt="" className="logged__icon" />
          <span>Sair do sistema</span>
        </Link>
      </aside>

      {/* ===== Conteúdo ===== */}
      <main className="logged__content">
        {/* Widgets ou dashboard */}
      </main>
    </div>
  );
}

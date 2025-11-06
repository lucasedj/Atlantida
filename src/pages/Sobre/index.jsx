import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./sobre.css";

export default function Sobre() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Atlântida — Sobre nós";
  }, []);

  return (
    <div className="sobre">
      {/* HEADER */}
      <header className="sobre__header">
        <div className="sobre__header-wrap">
          <Link to="/" className="sobre__brand" aria-label="Voltar à Home">
            <img
              src="/images/logo-atlantida.png"
              alt="Atlântida"
              className="sobre__logo"
            />
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="sobre__hero" id="topo">
        <h1 className="sobre__hero-title">ATLÂNTIDA</h1>

        <span className="sobre__badge">
          Desenvolvedores e Idealizadores do Atlântida
        </span>

        <h2 className="sobre__title">Sobre nós</h2>

        <p className="sobre__lead">
          No Atlântida Mergulhos, nosso objetivo é simplificar o gerenciamento dos seus mergulhos.
          Oferecemos ferramentas para organizar seus registros, manter seus certificados atualizados
          e acompanhar sua evolução com estatísticas detalhadas, ajudando você a mergulhar com
          confiança e organização.
        </p>
      </section>

      {/* EQUIPE */}
      <section className="sobre__team">
        <h3 className="sobre__team-title">Integrantes da Nossa Equipe</h3>

        <div className="sobre__grid">
          {/* Card 1 */}
          <article className="sobre__card">
            <img src="/img01.jpeg" alt="Foto de Lucas Joanoni" className="sobre__avatar" />
            <div className="sobre__card-body">
              <h4 className="sobre__name">Lucas Joanoni</h4>
              <p className="sobre__role">Desenvolvedor Front-end e<br />Back-end</p>
              <a
                className="sobre__link"
                href="https://www.linkedin.com/in/lucasjoanoni"
                target="_blank"
                rel="noreferrer">              
                LinkedIn
              </a>
            </div>
          </article>

          {/* Card 2 */}
          <article className="sobre__card">
            <img src="/img02.jpeg" alt="Foto de Gabriel Alves Bueno" className="sobre__avatar" />
            <div className="sobre__card-body">
              <h4 className="sobre__name">Gabriel Bueno</h4>
              <p className="sobre__role">Desenvolvedor Front-end e<br />Back-end</p>
              <a
                className="sobre__link"
                href="https://www.linkedin.com/in/gabzbueno/"
                target="_blank"
                rel="noreferrer">              
                LinkedIn
              </a>
            </div>
          </article>

          {/* Card 3 */}
          <article className="sobre__card">
            <img src="/img03.png" alt="Foto de Camilo Perucci" className="sobre__avatar" />
            <div className="sobre__card-body">
              <h4 className="sobre__name">Camilo Perucci</h4>
              <p className="sobre__role">Orientador</p>
              <a
                className="sobre__link"
                href="https://www.linkedin.com/in/camilo-perucci/"
                target="_blank"
                rel="noreferrer">              
                LinkedIn
              </a>
            </div>
          </article>
        </div>
      </section>

      {/* FOOTER (igual ao Article.jsx) */}
      <footer className="footer">
        <div className="footer-top">
          <img src="/images/logo-atlantida.png" alt="Atlântida" className="footer-logo" />
        </div>

        <hr className="footer-sep" />

        <div className="footer-bottom">
          <p className="footer-copy">
            Copyright © {new Date().getFullYear()} - Atlântida App Mergulhos - Todos os
            direitos reservados
          </p>
          <Link to="/termos" className="footer-link">
            Termos de uso
          </Link>
        </div>
      </footer>
    </div>
  );
}

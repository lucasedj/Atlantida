import React from "react";
import { Link } from "react-router-dom";
import "../article.css";

/**
 * Página de Artigo — Negligência dos Oceanos
 * - Header simples (logo + CTA)
 * - Conteúdo com meta, título, lide, imagem hero e corpo
 * - Footer padronizado
 */
export default function ArticleNegligencia() {
  return (
    <>
      {/* ============================
          HEADER simples (logo à esquerda | CTA à direita)
      ============================ */}
      <header className="header header--simple">
        <div className="header-left">
          <Link to="/" aria-label="Voltar para a Home">
            <img
              src="/images/logo-atlantida.png"
              alt="Atlântida"
              style={{ height: 40, width: "auto", objectFit: "contain", cursor: "pointer" }}
            />
          </Link>
        </div>

        <div className="header-right">
          <Link to="/DOWNLOAD DO APP" className="link-cta">
            DOWNLOAD DO APP
          </Link>
        </div>
      </header>

      {/* ============================
          CONTEÚDO DO ARTIGO
      ============================ */}
      <main className="art-wrap">
        {/* --- Meta (categoria / data / tempo de leitura) --- */}
        <div className="art-meta" aria-label="Metadados do artigo">
          <span className="badge">Artigo popular</span>
          <span>22 de Agosto de 2024</span>
          <span className="dot" aria-hidden="true">•</span>
          <span>5 minutos de leitura</span>
        </div>

        {/* --- Título e lide --- */}
        <h1 className="art-title">
          O Impacto Devastador da<br />Negligência dos Oceanos
        </h1>
        <p className="art-lead">
          Como a falta de conservação dos oceanos e outros corpos d’água está destruindo a vida
          marinha e prejudicando o mergulho.
        </p>

        {/* --- Imagem hero do artigo --- */}
        <figure className="art-hero">
          <img
            src="/images/articles/negligencia-no-oceano.jpg"
            alt="Poluição marinha com resíduos plásticos no oceano"
            loading="lazy"
          />
        </figure>

        {/* ============================
            CORPO DO ARTIGO
        ============================ */}
        <section className="art-content">
          {/* Introdução */}
          <p>
            Os oceanos, mares e rios são fundamentais para a vida na Terra, mas a negligência 
            humana está levando esses ecossistemas ao colapso. A falta de preservação dos corpos d'água tem 
            consequências graves, tanto para a vida marinha quanto para aqueles que exploram as profundezas submersas. 
            Neste artigo, exploramos os efeitos devastadores da degradação dos oceanos e como isso afeta tanto os mergulhadores quanto a biodiversidade aquática.
          </p>

          {/* Seções do conteúdo */}
          <h3>1. Degradação dos Ecossistemas Marinhos</h3>
          <p>
            A poluição, a sobrepesca e a destruição de habitats estão causando uma rápida degradação dos ecossistemas marinhos. 
            Corais, que abrigam uma infinidade de espécies, estão morrendo devido ao aumento da temperatura da água e à acidificação dos oceanos. 
            A perda desses recifes de corais, que são vitais para a biodiversidade, resulta em um declínio drástico das populações de peixes e outros organismos marinhos.
          </p>

          <h3>2. Impacto na Experiência de Mergulho</h3>
          <p>
            Para os mergulhadores, a deterioração dos oceanos significa a perda de paisagens subaquáticas vibrantes 
            e a diminuição das oportunidades de encontros com a vida marinha. Áreas que antes eram ricas em biodiversidade 
            agora estão se tornando "desertos" subaquáticos, com poucos sinais de vida. Além disso, a presença de lixo marinho, 
            como plásticos e redes fantasmas, não só prejudica a vida marinha, mas também representa riscos físicos para os mergulhadores.
          </p>

          <h3>3. Riscos à Saúde Humana</h3>
          <p>
            A poluição dos oceanos não afeta apenas a vida marinha, mas também representa sérios riscos à saúde humana. 
            Contaminantes como metais pesados, resíduos químicos e microplásticos entram na cadeia alimentar marinha, 
            eventualmente chegando aos humanos através do consumo de frutos do mar. Para os mergulhadores, essas substâncias tóxicas 
            podem representar um perigo imediato ao entrar em contato com a pele ou ser inaladas durante o mergulho.
          </p>

          <h3>4. Perda de Espécies e Biodiversidade</h3>
          <p>
            A destruição dos habitats marinhos leva à extinção de inúmeras espécies. Cada espécie perdida é uma parte 
            insubstituível do ecossistema e sua ausência pode desencadear um efeito cascata, prejudicando a saúde geral do oceano. 
            Para os mergulhadores, isso significa menos oportunidades de observar e interagir com a vida marinha, 
            diminuindo a riqueza da experiência subaquática.
          </p>

          <h3>5. Erosão da Economia do Turismo de Mergulho</h3>
          <p>
            A saúde dos oceanos é crucial para o turismo de mergulho, uma indústria que depende da beleza 
            e da biodiversidade subaquática. A degradação dos ecossistemas marinhos leva à perda de destinos 
            de mergulho populares, afetando a economia local e reduzindo as oportunidades de emprego em comunidades 
            costeiras que dependem desse setor.
          </p>

          {/* Conclusão */}
          <p>
            A falta de preservação dos oceanos e outros corpos d'água tem consequências alarmantes para 
            a vida marinha e para os mergulhadores. É imperativo que todos nós tomemos medidas para proteger 
            esses ecossistemas preciosos, garantindo que as futuras gerações possam continuar a explorar e desfrutar 
            da rica biodiversidade subaquática.
          </p>

          {/* Referências/Fonte */}
          <p className="art-ref">
            Este texto foi adaptado dos artigos:&nbsp;
            <a href="https://www.nationalgeographic.com" target="_blank" rel="noreferrer">
              The Ocean’s Decline and the Impact on Marine Life
            </a>
            ,&nbsp;
            <a href="https://www.worldwildlife.org" target="_blank" rel="noreferrer">
              The Devastating Effects of Ocean Pollution
            </a>
            ,&nbsp;e&nbsp;
            <a href="https://oceanconservancy.org" target="_blank" rel="noreferrer">
              Marine Debris and Its Impacts on Human Health
            </a>.
          </p>
        </section>
      </main>

      {/* ============================
          FOOTER (mesmo padrão do Terms/Article)
      ============================ */}
      <footer className="footer">
        <div className="footer-top">
          <img src="/images/logo-atlantida.png" alt="Atlântida" className="footer-logo" />
          <button
            className="footer-back"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑ <span>Voltar ao topo</span>
          </button>
        </div>

        <hr className="footer-sep" />

        <div className="footer-bottom">
          <p className="footer-copy">
            Copyright © {new Date().getFullYear()} - Atlântida App Mergulhos - Todos os direitos reservados
          </p>
          <Link to="/termos" className="footer-link">Termos de uso</Link>
        </div>
      </footer>
    </>
  );
}

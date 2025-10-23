import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../article.css"; // Reaproveita o CSS genérico de artigos

/**
 * Página de Artigo — "Proteger os Oceanos"
 * Estrutura:
 *  - Header simples (logo + CTA Download)
 *  - Conteúdo principal com meta, título, lide, imagem hero e seções de texto
 *  - Footer padronizado igual aos outros artigos
 */
export default function Article3() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* ============================
          HEADER simples
          (Logo à esquerda + Botão "Download do App" à direita)
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
          CONTEÚDO PRINCIPAL DO ARTIGO
      ============================ */}
      <main className="art-wrap">
        {/* --- Metadados do artigo (categoria / data / tempo de leitura) --- */}
        <div className="art-meta">
          <span className="badge">Artigo popular</span>
          <span>01 de Setembro de 2024</span>
          <span className="dot" aria-hidden="true">•</span>
          <span>5 minutos de leitura</span>
        </div>

        {/* --- Título e lide --- */}
        <h1 className="art-title">
          Proteger os Oceanos: A<br />Missão dos Mergulhadores
        </h1>
        <p className="art-lead">
          Como os mergulhadores podem atuar como guardiões dos oceanos e ajudar a 
          alcançar o Objetivo 14 dos Objetivos do Desenvolvimento Sustentável, 
          focado na preservação da vida marinha.
        </p>

        {/* --- Imagem principal do artigo (Hero) --- */}
        <figure className="art-hero">
          <img
            src="/images/articles/proteger-o-oceano.jpg"
            alt="ODS 14 Vida na Água"
            loading="lazy"
          />
        </figure>

        {/* ============================
            CORPO DO ARTIGO
        ============================ */}
        <section className="art-content">
          {/* Introdução */}
          <p>
            Os mares e oceanos cobrem mais de 70% da superfície do nosso planeta e são essenciais para a vida na Terra. No entanto, 
            a saúde dos oceanos está em risco devido à poluição, sobrepesca e mudanças climáticas. 
            O Objetivo 14 dos Objetivos de Desenvolvimento Sustentável (ODS) das Nações Unidas visa "conservar e usar de forma sustentável 
            os oceanos, mares e os recursos marinhos". Mergulhadores, 
            com seu contato direto e íntimo com o ambiente marinho, estão em uma posição única para contribuir para este objetivo vital.
          </p>

          {/* Seções temáticas */}
          <h3>1. Monitoramento e Coleta de Dados</h3>
          <p>
            Mergulhadores têm a oportunidade de observar de perto os ecossistemas marinhos. 
            Eles podem participar de iniciativas de ciência cidadã, coletando dados sobre a saúde dos recifes, 
            a presença de espécies ameaçadas e a qualidade da água. Projetos como o Reef Check e o 
            Projeto AWARE permitem que mergulhadores contribuam diretamente para pesquisas científicas que informam políticas de conservação.
          </p>

          <h3>2. Limpeza dos Oceanos</h3>
          <p>
            Os mergulhadores frequentemente se envolvem em campanhas de limpeza subaquática, removendo plásticos, 
            redes fantasmas e outros detritos que ameaçam a vida marinha. 
            Esses esforços não só reduzem a poluição, mas também aumentam a 
            conscientização sobre a importância de manter os oceanos limpos.
          </p>

          <h3>3. Educação e Conscientização</h3>
          <p>
            Mergulhadores podem atuar como embaixadores dos oceanos, educando o público sobre as 
            ameaças que os oceanos enfrentam e promovendo práticas sustentáveis. 
            Através de palestras, workshops e redes sociais, eles podem inspirar outras pessoas a agir em prol da conservação marinha.
          </p>

          <h3>4. Apoio a Áreas Marinhas Protegidas</h3>
          <p>
            Muitas áreas marinhas protegidas (AMPs) dependem do apoio e do envolvimento dos mergulhadores. 
            Ao respeitar as regras dessas áreas e promover sua importância, 
            os mergulhadores ajudam a garantir que esses refúgios continuem a 
            proteger a biodiversidade marinha.
          </p>

          <h3>5. Redução da Pegada de Carbono</h3>
          <p>
            Embora os mergulhadores sejam apaixonados pelos oceanos, as viagens frequentes 
            para destinos de mergulho podem ter um impacto ambiental. Ao optar por operadores de mergulho sustentáveis, 
            reduzir o uso de plásticos e compensar as emissões de carbono, os mergulhadores podem minimizar seu impacto no ambiente marinho.
          </p>

          {/* Conclusão */}
          <p>
            Os mergulhadores têm um papel crucial na proteção e preservação dos oceanos. Ao se engajar ativamente em práticas sustentáveis e 
            apoiar iniciativas de conservação, eles não apenas ajudam a alcançar o Objetivo 14 dos ODS, 
            mas também garantem que as futuras gerações possam continuar a desfrutar das maravilhas subaquáticas.
          </p>

          {/* Fontes / Referências */}
          <p className="art-ref">
            Este texto foi adaptado dos artigos:&nbsp;
            <a href="https://sdgs.un.org/goals/goal14" target="_blank" rel="noreferrer">
              United Nations Sustainable Development Goals — Goal 14: Life Below Water
            </a>
            ,&nbsp;
            <a href="https://www.reefcheck.org/" target="_blank" rel="noreferrer">
              Reef Check — Monitoring Reef Health Worldwide
            </a>
            ,&nbsp;e&nbsp;
            <a href="https://www.projectaware.org/" target="_blank" rel="noreferrer">
              Project AWARE — Dive Against Debris Program
            </a>.
          </p>
        </section>
      </main>

      {/* ============================
          FOOTER padronizado (igual aos outros artigos)
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

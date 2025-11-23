import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./terms.css";

export default function Terms() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (

    <>
      {/* ================= HEADER ================= */}
      {/* Cabeçalho simples, apenas logo à esquerda e botão de download à direita */}
      <header className="header header--simple">
        <div className="header-left">
          {/* Logo que leva de volta para a página inicial */}
          <Link to="/">
            <img
              src="/images/logo-atlantida.png"
              alt="Atlântida"
              style={{ height: 40, width: "auto", objectFit: "contain", cursor: "pointer" }}
            />
          </Link>
        </div>

        <div className="header-right">
          {/* Botão de CTA para download do app */}
          <Link to="/DOWNLOAD DO APP" className="link-cta">
            DOWNLOAD DO APP
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      {/* Seção de destaque no topo da página de termos */}
      <section className="hero hero--terms">
        <div className="hero-inner">
          <h1 className="hero-title">
            Termos de uso e<br />Política de Privacidade
          </h1>
        </div>
      </section>

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <main className="terms-wrap">
        {/* Data de vigência */}
        <p className="terms-effective">
          Em vigor a partir de <strong>05 de agosto de 2024</strong>
        </p>

        {/* Título e introdução dos termos */}
        <h2 className="terms-h2">Termos de Uso</h2>
        <p className="terms-p">
          Bem-vindo aos Termos de Uso do Sistema de Gerenciamento de Mergulho. 
          Este documento estabelece os termos e condições que regem o uso da plataforma web e móvel desenvolvida para o 
          planejamento e gerenciamento de experiências subaquáticas para mergulhadores. 
          Ao utilizar nosso sistema, você concorda com estes termos e compromete-se a segui-los.
        </p>

        {/* Seção 1: Introdução */}
        <h3 className="terms-h3">1. Introdução</h3>

        {/* Sub-seção 1.1 */}
        <h4 className="terms-h4">1.1 Tema de Pesquisa</h4>
        <p className="terms-p">
          O Sistema de Gerenciamento de Mergulho foi projetado para fornecer aos mergulhadores uma solução multiplataforma para organizar suas experiências subaquáticas. 
          Nossa plataforma permite o armazenamento de informações fundamentais, análise de estatísticas de mergulhos e visualização de novos locais para mergulho.
        </p>

        {/* Sub-seção 1.2 */}
        <h4 className="terms-h4">1.2 Motivações e Justificativas</h4>
        <p className="terms-p">
          Reconhecemos a necessidade de uma solução customizada para o gerenciamento eficiente de informações relacionadas ao mergulho. 
          A falta de uma plataforma adequada resulta em perda de dados, dificuldades na identificação de padrões e tendências, e limitações na avaliação pessoal e comparação de experiências entre mergulhadores. 
          Nosso sistema busca aprimorar a experiência dos mergulhadores, promovendo a conservação marinha e incentivando a prática responsável do mergulho.
        </p>

        {/* Sub-seção 1.3 */}
        <h4 className="terms-h4">1.3 Objetivos</h4>

        {/* Sub-sub-seção 1.3.1 */}
        <h5 className="terms-h5">1.3.1 Objetivo Geral</h5>
        <p className="terms-p">
          Desenvolver um sistema web e móvel destinado ao planejamento e gerenciamento de experiências subaquáticas para mergulhadores.
        </p>

        {/* Seção 2: Cadastro */}
        <h3 className="terms-h3">2. Cadastro de Usuário</h3>
        <p className="terms-p">
          Ao utilizar nosso sistema, você concorda em fornecer informações precisas e atualizadas durante o processo de cadastro. 
          As informações solicitadas incluem nome, sobrenome, data de nascimento, email, senha, CEP, país, estado, cidade, bairro, logradouro, número e complemento. 
          Esses dados são essenciais para a criação e acesso à sua conta no sistema.
        </p>

        {/* Seção 3: Privacidade */}
        <h3 className="terms-h3">3. Privacidade e Segurança</h3>
        <p className="terms-p">
          Nosso sistema respeita a privacidade dos usuários e adota medidas de segurança para proteger suas informações pessoais. 
          Consulte nossa Política de Privacidade para obter mais detalhes sobre como coletamos, usamos e protegemos seus dados.
        </p>

        {/* Seção 4: Uso adequado */}
        <h3 className="terms-h3">4. Uso Adequado do Sistema</h3>
        <p className="terms-p">
          Ao utilizar nosso sistema, você concorda em respeitar as leis e regulamentos aplicáveis e em não usar a plataforma para atividades ilegais, fraudulentas, abusivas ou prejudiciais. 
          Você também concorda em não interferir ou danificar o funcionamento do sistema.
        </p>

        {/* Seção 5: Alterações */}
        <h3 className="terms-h3">5. Alterações nos Termos</h3>
        <p className="terms-p">
          Reservamo-nos o direito de fazer alterações nestes Termos de Uso a qualquer momento. 
          As alterações entrarão em vigor imediatamente após a publicação. 
          Recomendamos que você revise periodicamente estes termos para estar ciente de quaisquer atualizações.
        </p>

        {/* Seção 6: Encerramento */}
        <h3 className="terms-h3">6. Encerramento da Conta</h3>
        <p className="terms-p">
          Você pode encerrar sua conta a qualquer momento, entrando em contato conosco ou seguindo as instruções disponíveis no sistema. 
          Reservamo-nos o direito de encerrar ou suspender sua conta caso haja violação destes Termos de Uso.
        </p>

        {/* Seção 7: Contato */}
        <h3 className="terms-h3">7. Contato</h3>
        <p className="terms-p">
          Se você tiver dúvidas, preocupações ou comentários sobre estes Termos de Uso, entre em contato conosco através do nosso e-mail:{" "}
          <a href="mailto:atlantidamergulhos@gmail.com" className="terms-link">
            atlantidamergulhos@gmail.com
          </a>
        </p>
        <p className="terms-p">
          <p className="terms-p"></p>
          Ao utilizar nosso sistema, você concorda com estes Termos de Uso e compromete-se a segui-los. 

        </p>

        <p className="terms-p">
          <p className="terms-p"></p>
          Obrigado, Equipe Atlântida Mergulhos.
        </p>

        {/* Nota final */}
        <p className="terms-note">
          Ao utilizar nosso sistema, você concorda com estes Termos...
          <br />
          Data de efetivação: <strong>05/08/2024</strong>
        </p>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="footer-top">
          {/* Logo do rodapé */}
          <img src="/images/logo-atlantida.png" alt="Atlântida" className="footer-logo" />

          {/* Botão para voltar ao topo */}
          <button
            className="footer-back"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑ <span>Voltar ao topo</span>
          </button>
        </div>

        <hr className="footer-sep" />

        <div className="footer-bottom">
          {/* Copyright */}
          <p className="footer-copy">
            Copyright © {new Date().getFullYear()} - Atlântida App Mergulhos - Todos os direitos reservados
          </p>

          {/* Link para termos */}
          <Link to="/termos" className="footer-link">
            Termos de uso
          </Link>
        </div>
      </footer>
    </>
  );
}

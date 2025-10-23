import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../article.css";

/**
 * Página de Artigo
 * - Header simples (logo + CTA), igual ao Terms.jsx
 * - Conteúdo do artigo com meta, título, lide, imagem e corpo
 * - Footer igual ao Terms.jsx / Home.jsx
 */
export default function Article() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          WRAPPER DO ARTIGO
      ============================ */}
      <main className="art-wrap">
        {/* --- Meta (categoria / data / tempo de leitura) --- */}
        <div className="art-meta" aria-label="Metadados do artigo">
          <span className="badge">Artigo popular</span>
          <span>18 de Agosto de 2024</span>
          <span className="dot" aria-hidden="true">•</span>
          <span>7 minutos de leitura</span>
        </div>

        {/* --- Título e lide --- */}
        <h1 className="art-title">
          7 Práticas essenciais para<br />um Mergulho Responsável
        </h1>
        <p className="art-lead">
          Neste artigo, apresentaremos sete dicas fundamentais 
          para garantir que sua experiência de mergulho seja não 
          apenas emocionante, mas também sustentável.
        </p>

        {/* --- Imagem hero do artigo --- */}
        <figure className="art-hero">
          <img
            src="/images/articles/mergulho-responsavel.jpg"
            alt="Mergulhador praticando técnicas responsáveis próximo a um recife"
            loading="lazy"
          />
        </figure>

        {/* ============================
            CORPO DO ARTIGO
        ============================ */}
        <section className="art-content">
          {/* Introdução */}
          <p>
            Como mergulhadores, temos a responsabilidade de conservar os ecossistemas marinhos que tanto apreciamos e que são facilmente danificados. 
            Nossas ações podem ter consequências duradouras, e por isso é tão importante praticar o mergulho responsável onde quer que você vá. 
            Continue lendo para descobrir 7 ótimas dicas sobre como causar o menor impacto possível na vida marinha, mantendo-se atento e consciente.
          </p>

          {/* Dicas */}
          <h3>1. Obtenha o Treinamento Adequado</h3>
          <p>
            Independentemente do que alguém possa lhe dizer, o seu treinamento em mergulho e a certificação são passos cruciais para começar a mergulhar de forma segura e responsável. 
            Você pode encontrar ofertas de viagens de mergulho sem certificação, mas isso é um grande erro. 
            É perigoso para você, para outros mergulhadores e para a vida marinha mergulhar sem o treinamento adequado.
          </p>
          <p>
            Os mergulhadores da Gangga na Villa Almarik oferecem treinamento de mergulho PADI 5*, liderado por instrutores e guias profissionais. 
            Com uma certificação PADI, você pode mergulhar em qualquer lugar do mundo, e seus guias podem se sentir seguros 
            sabendo que você está devidamente capacitado para lidar com as situações subaquáticas.
          </p>

          <h3>2. A Palavra do Seu Instrutor é Lei</h3>
          <p>
            Mesmo que você tenha centenas de mergulhos no currículo, as instruções do seu instrutor ou guia devem ser seguidas em todos os momentos. 
            Não presuma que você sabe mais ou pense que tem experiência suficiente para se desviar dos planos, mesmo que minimamente. 
            Os mergulhos em Gili Trawangan são cuidadosamente planejados pelos guias da Gangga Divers para garantir sua segurança, diversão e a proteção do ambiente marinho.
          </p>

          <h3>3. Fale</h3>
          <p>
            A palavra do seu instrutor pode ser lei, mas sempre fale se notar algo que ele ou ela não tenha percebido. 
            Como mergulhador, é sua responsabilidade proteger os recifes. Se, por exemplo, você vir outro mergulhador ou guia agindo de forma imprudente ou danificando o recife, 
            é essencial que você diga algo imediatamente. Ficar calado por timidez ou por não querer causar incômodo pode resultar em danos ao recife ou em alguém enfrentando uma situação complicada.
          </p>

          <h3>4. Use Seus Olhos, Não Suas Mãos</h3>
          <p>
            Se você é mergulhador, sabe que a vida marinha é deslumbrante. Esse mundo ao seu redor enquanto você mergulha é tão 
            diferente daquele acima da água que você pode sentir a vontade de tocar as coisas. 
            No entanto, os ambientes marinhos são extremamente sensíveis, e existem bactérias e microrganismos na pele humana que podem contaminar os recifes e os peixes. 
            Os corais duros, em particular, são especialmente suscetíveis ao nosso toque devido à camada de tecido vivo que muitas vezes os protege.
          </p>

          <h3>5. Pratique o Controle</h3>
          <p>
            Uma das coisas mais importantes que você aprenderá durante o treinamento de mergulho é o controle de flutuabilidade. 
            Isso pode não ser algo natural e pode levar algum tempo para dominar. Enquanto pratica, você precisa ser extremamente cauteloso ao redor dos recifes para poder 
            flutuar sobre eles sem tocá-los. Se estiver tendo dificuldades com sua flutuabilidade, não hesite em pedir ajuda aos instrutores ou guias de mergulho.
          </p>

          <h3>6. Equipando-se Adequadamente</h3>
          <p>
            Seguindo o ponto anterior, obter o equipamento adequado é essencial para controlar sua flutuabilidade. 
            Certifique-se de que sua roupa de neoprene, nadadeiras, regulador, manômetro e cilindros estejam bem ajustados e que nada esteja solto. 
            Você pode danificar o recife sem nem perceber se algo estiver pendurado ou arrastando. Se você tiver seu próprio equipamento, experimente 
            tudo antes da viagem de mergulho para garantir que tudo ainda esteja bem ajustado e em boas condições. Você também pode alugar equipamentos com os mergulhadores 
            da Gangga, mas certifique-se de que o ajuste seja perfeito.
          </p>

          <h3>7. Não Deixe Nada para Trás</h3>
          <p>
            Há uma citação popular entre os mergulhadores: "Leve apenas fotos, deixe apenas bolhas". Isso pode parecer óbvio, mas você nunca 
            deve deixar nada no oceano que não lhe pertença. Seu primeiro pensamento pode ser "mas eu nunca jogaria lixo no oceano", mas você já pensou 
            no protetor solar que usa ou em qualquer loção corporal, perfume ou outros produtos que possa estar deixando para trás? Alguns desses produtos podem ser inofensivos para você, 
            mas podem ter efeitos devastadores sobre os recifes de coral. Além disso, você nunca deve alimentar peixes ou outras formas de vida marinha. Ao fazer isso, você pode, sem saber, 
            desequilibrar toda a cadeia alimentar. Lembre-se, não deixe NADA para trás, exceto suas bolhas.
          </p>

          <p>
            Seguindo essas práticas, você poderá apreciar o mergulho enquanto contribui para a preservação dos ecossistemas marinhos. 
            Afinal, você é um visitante no mundo subaquático e deve respeitar isso em todos os momentos.
          </p>

          {/* Referência/Fonte */}
          <p className="art-ref">
            Este texto foi adaptado do artigo{" "}
            <a
              href="https://www.scubadivermag.com"
              target="_blank"
              rel="noreferrer"
            >
              7 Ótimas Dicas para Mergulho Responsável
            </a>{" "}
            da Scuba Diver Mag.
          </p>
        </section>
      </main>

      {/* ============================
          FOOTER (mesmo padrão do Terms/Home)
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
            Copyright © {new Date().getFullYear()} - Atlântida App Mergulhos - Todos os
            direitos reservados
          </p>
          <Link to="/termos" className="footer-link">
            Termos de uso
          </Link>
        </div>
      </footer>
    </>
  );
}

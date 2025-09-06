import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import "./Home.css";

/* Leaflet (mapa) */
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Home() {
  /* ======= ESTADO DA PÁGINA ======= */
  const [spots, setSpots] = useState([]);            // lista de pontos de mergulho
  const [query, setQuery] = useState("");            // termo de busca
  const [loading, setLoading] = useState(true);      // carregando API
  const [error, setError] = useState(null);          // erro da API (se houver)
  const [selected, setSelected] = useState(null);    // id do spot selecionado (para destaque)

  /* ======= ESTADO DO MAPA ======= */
  const [mapCenter, setMapCenter] = useState({ lat: -14.235, lng: -51.9253 }); // Brasil
  const [zoom, setZoom] = useState(4);

  /* ======= EFEITO: HEADER STICKY COM SOMBRA AO ROLAR ======= */
  useEffect(() => {
    const headerEl = document.querySelector(".header");
    const onScroll = () => {
      if (!headerEl) return;
      headerEl.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ======= EFEITO: CARREGAR SPOTS ======= */
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    api
      .get("/api/divingSpots")
      .then((res) => {
        const data = res?.data?.data || res?.data || [];
        if (mounted) setSpots(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (mounted) setError(err?.message || "Erro ao carregar spots");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  /* ======= MEMO: FILTRAR SPOTS ======= */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return spots;
    return spots.filter((s) => {
      const name = (s.name || s.nome || "").toLowerCase();
      const loc  = (s.location || s.local || "").toLowerCase();
      return name.includes(q) || loc.includes(q);
    });
  }, [spots, query]);

  /* ======= UTIL: PEGAR COORDENADAS ======= */
  const getCoords = (s) => {
    const lat = s.lat ?? s.latitude ?? s.coords?.lat ?? s.coordenadas?.lat;
    const lng = s.lng ?? s.long ?? s.lon ?? s.longitude ?? s.coords?.lng ?? s.coordenadas?.lng;
    if (typeof lat === "number" && typeof lng === "number") return { lat, lng };
    if (typeof s.coords === "string") {
      const [a, b] = s.coords.split(",").map((v) => parseFloat(v.trim()));
      if (!Number.isNaN(a) && !Number.isNaN(b)) return { lat: a, lng: b };
    }
    return null;
  };

  /* ======= BUSCA: CENTRALIZA NO 1º RESULTADO ======= */
  const handleSearch = () => {
    const first = filtered.find((s) => getCoords(s));
    if (first) {
      const c = getCoords(first);
      setMapCenter(c);
      setZoom(10);
      setSelected(first.id || first._id || first.uuid || first.name);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  /* ======= SCROLL SUAVE PARA SEÇÕES ======= */
  const scrollTo = (id) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ================== HEADER ================== */}
      <header className="header">
        <div className="header-left">
          <img
            src="/images/logo-atlantida.png"
            alt="Atlântida"
            style={{ height: 40, width: "auto", objectFit: "contain" }}
          />
        </div>

        <div className="header-nav-group">
          <nav className="header-center">
            {/* rola para a seção de artigos */}
            <a
              href="#artigos"
              className="link link-ghost"
              onClick={(e) => { e.preventDefault(); scrollTo("artigos"); }}
            >
              Artigos
            </a>

            {/* rola para a prévia de termos */}
            <a
              href="#terms-preview"
              className="link link-ghost"
              onClick={(e) => { e.preventDefault(); scrollTo("terms-preview"); }}
            >
              Termos
            </a>

            {/* página interna */}
            <Link to="/Sobre Nós" className="link link-ghost">Sobre Nós</Link>
          </nav>

          {/* CTA do topo: rola até a seção do app */}
          <a
            href="#app-download"
            className="link-cta"
            onClick={(e) => { e.preventDefault(); scrollTo("app-download"); }}
          >
            DOWNLOAD DO APP
          </a>
        </div>
      </header>

      {/* ================== HERO ================== */}
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">
            Gerencie seus mergulhos
            <br />
            com facilidade e eficiência
            <span className="hero-dot">.</span>
          </h1>

          <p className="hero-sub">
            Planeje, organize e registre seus mergulhos. Encontre pontos de
            mergulho e compartilhe suas experiências.
          </p>

          {/* CTA principal agora leva ao login */}
          <Link to="/login" className="hero-button">
            COMECE SUA AVENTURA AGORA!
          </Link>

          <div className="hero-footer">
            <span style={{ fontSize: 22, transform: "translateY(-2px)" }}>↓</span>
            <span>Continue explorando</span>
          </div>
        </div>
      </section>

      {/* ================== LOCAIS DE MERGULHO ================== */}
      <section className="spots-section">
        <div className="spots-head">
          <h3 className="spots-kicker">LOCAIS DE MERGULHO</h3>
          <h2 className="spots-title">
            Explore novos locais de mergulho e veja
            <br />
            o que outros usuários estão dizendo.
          </h2>

          {/* Barra de busca (com ícone inline — o visual vem no CSS que você vai mandar) */}
          <div className="search-bar">
            <span className="search-ico" aria-hidden="true"></span>
            <input
              type="text"
              placeholder="Explore por novos locais aqui!"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Buscar locais de mergulho"
            />
            {/* botão opcional, podemos esconder via CSS */}
            <button className="search-btn" onClick={handleSearch} aria-label="Buscar">Buscar</button>
          </div>

          {/* Estados de carregamento/erro (markup aprimorado; estilos virão no CSS) */}
          {loading && (
            <div style={{ maxWidth: 600, margin: "16px auto" }}>
              <div className="skel" />
              <div className="skel" style={{ marginTop: 8 }} />
            </div>
          )}
          {error && (
            <div
              role="alert"
              style={{
                maxWidth: 600,
                margin: "16px auto",
                padding: 12,
                border: "1px solid #fee2e2",
                borderRadius: 8,
                background: "#fef2f2",
                color: "#991b1b",
              }}
            >
              Falha ao carregar os locais.{" "}
              <button onClick={() => window.location.reload()}>Tentar novamente</button>
            </div>
          )}
        </div>

        {/* Mapa (marcadores com destaque quando selecionados) */}
        <div className="spots-hero">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={zoom}
            className="spots-map"
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {filtered
              .map((s) => ({ s, c: getCoords(s) }))
              .filter((x) => x.c)
              .map(({ s, c }) => {
                const id = s.id || s._id || s.uuid || s.name;
                const isActive = selected === id;
                return (
                  <CircleMarker
                    key={id}
                    center={[c.lat, c.lng]}
                    radius={isActive ? 9 : 6}
                    pathOptions={{
                      color: isActive ? "#2563eb" : "#0ea5e9",
                      fillColor: isActive ? "#2563eb" : "#0ea5e9",
                      fillOpacity: 0.7
                    }}
                    eventHandlers={{ click: () => setSelected(id) }}
                  >
                    <Popup>
                      <strong>{s.name || s.nome}</strong>
                      <br />
                      {s.location || s.local || ""}
                    </Popup>
                  </CircleMarker>
                );
              })}
          </MapContainer>
        </div>
      </section>

      {/* ================== APP (iOS & Android) ================== */}
      <section className="app-section" id="app-download">
        <p className="app-kicker">APLICATIVO iOS E ANDROID</p>
        <h2 className="app-title">
          Todos os seus mergulhos
          <br />a um toque de distância.
        </h2>

        {/* Visual central (efeitos visuais serão no CSS) */}
        <div className="app-visual">
          <img className="app-reef" src="/images/landing/reef.svg" alt="" aria-hidden="true" />
          <img
            className="app-phone"
            src="/images/app/imagem-celular.png"
            alt="Tela do app Atlântida mostrando um mergulho"
            loading="lazy"
          />
        </div>

        {/* Badges das lojas (coloque os SVGs e estilizamos no CSS) */}
        <div className="app-stores">
          <a className="store-btn" href="#" aria-label="Download via Apple Store">
            <img src="/images/app/btn-apple-store.svg" alt="Baixar na App Store" />
          </a>
          <a className="store-btn" href="#" aria-label="Download via Google Play">
            <img src="/images/app/btn-apple-store.svg" alt="Disponível no Google Play" />
          </a>
        </div>

        {/* Passos */}
        <ul className="app-steps">
          <li className="step">
            <span className="ico" aria-hidden="true"></span>
            <span className="step-bullet">01</span>
            <h3 className="step-title">Baixe o aplicativo</h3>
            <p className="step-text">
              É gratuito. Baixe pela Apple Store ou Google Play.
            </p>
          </li>

          <li className="step">
            <span className="ico" aria-hidden="true"></span>
            <span className="step-bullet">02</span>
            <h3 className="step-title">Faça seu cadastro</h3>
            <p className="step-text">
              É rápido e simples. Crie sua conta em menos de 2 minutos.
            </p>
          </li>

          <li className="step">
            <span className="ico" aria-hidden="true"></span>
            <span className="step-bullet">03</span>
            <h3 className="step-title">Pronto!</h3>
            <p className="step-text">
              O app está preparado para seus novos mergulhos. E você?
            </p>
          </li>
        </ul>
      </section>

      {/* ================== ARTIGOS (Prévia) ================== */}
      <section id="artigos" className="articles-section">
        <div className="articles-head">
          <span className="articles-kicker">MERGULHO RESPONSÁVEL</span>
          <h2 className="articles-title">
            Descubra Como Proteger os Oceanos
            <br />
            Enquanto Aproveita a Beleza Subaquática.
          </h2>
        </div>

        <ul className="articles-grid">
          <li className="article-card">
            <Link to="/artigos/mergulho-responsavel" className="article-link">
              <div
                className="article-cover"
                style={{ backgroundImage: 'url("/images/articles/mergulho-responsavel.jpg")' }}
              />
              <div className="article-body">
                <h3 className="article-title">
                  7 Práticas essenciais para um Mergulho Responsável
                </h3>
                <div className="article-meta">
                  <time>17 de Julho de 2024</time>
                  <span className="spacer" />
                  <span className="badge">Ler artigo</span>
                </div>
              </div>
            </Link>
          </li>

          <li className="article-card">
            <Link to="/artigos/negligencia-dos-oceanos" className="article-link">
              <div
                className="article-cover"
                style={{ backgroundImage: 'url("/images/articles/negligencia-no-oceano.jpg")' }}
              />
              <div className="article-body">
                <h3 className="article-title">
                  O Impacto Devastador da Negligência dos Oceanos
                </h3>
                <div className="article-meta">
                  <time>22 de Agosto de 2024</time>
                  <span className="spacer" />
                  <span className="badge badge--green">Artigo popular</span>
                </div>
              </div>
            </Link>
          </li>

          <li className="article-card">
            <Link to="/artigos/missao-dos-mergulhadores" className="article-link">
              <div
                className="article-cover"
                style={{ backgroundImage: 'url("/images/articles/proteger-o-oceano.jpg")' }}
              />
              <div className="article-body">
                <h3 className="article-title">
                  Proteger os Oceanos: A Missão dos Mergulhadores
                </h3>
                <div className="article-meta">
                  <time>11 de Setembro de 2020</time>
                  <span className="spacer" />
                  <span className="badge badge--green">Artigo popular</span>
                </div>
              </div>
            </Link>
          </li>
        </ul>
      </section>

      {/* ================== TERMOS (Prévia) ================== */}
      <section id="terms-preview" className="terms-preview">
        <div className="terms-preview-head">
          <span className="terms-preview-kicker">LEITURA RECOMENDADA</span>
          <h2 className="terms-preview-title">Termos de Uso e Política de Privacidade</h2>
          <p className="terms-preview-sub">
            Entenda como cuidamos dos seus dados e o que esperamos no uso da plataforma.
          </p>
        </div>

        <div className="terms-preview-card">
          <div className="terms-preview-media" />
          <div className="terms-preview-body">
            <h3>Transparência e segurança em primeiro lugar</h3>
            <ul className="terms-preview-list">
              <li>Como coletamos e utilizamos seus dados</li>
              <li>Seus direitos de acesso e exclusão</li>
              <li>Boas práticas e uso responsável da plataforma</li>
            </ul>
            <Link to="/termos" className="terms-preview-cta">
              Ler Termos de Uso e Privacidade
            </Link>
          </div>
        </div>
      </section>

      {/* ================== FOOTER ================== */}
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

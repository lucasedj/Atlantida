import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { getCurrentUser, me } from "../../features/auth/authService";

import "../Logged/logged.css";
import "./profile.css";

export default function Profile() {
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    cep: "",
    country: "",
    state: "",
    city: "",
    district: "",
    street: "",
    complement: "",
    number: "",
  });

  // formata para yyyy-MM-dd (input date)
  function toInputDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    // cuidado com timezone — ISO já resolve para campos date
    return dt.toISOString().split("T")[0];
  }

  function hydrate(u) {
    if (!u) return;
    setUser(u);
    setForm({
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      birthDate: toInputDate(u.birthDate),
      email: u.email ?? "",
      cep: u.cep ?? "",
      country: u.country ?? "",
      state: u.state ?? "",
      city: u.city ?? "",
      district: u.district ?? "",
      street: u.street ?? "",
      complement: u.complement ?? "",
      number: u.number ?? "",
    });
  }

  useEffect(() => {
    // 1º tenta do localStorage
    const cached = getCurrentUser();
    if (cached) {
      hydrate(cached);
      return;
    }
    // 2º busca do backend usando o token
    me()
      .then((u) => {
        hydrate(u);
        try { localStorage.setItem("user", JSON.stringify(u)); } catch {}
      })
      .catch(() => {
        // se der erro, mantém vazio
      });
  }, []);

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

  return (
    <div className="logged">
      {/* ===== Sidebar ===== */}
      <aside className="logged__sidebar" aria-label="Navegação principal">
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

        <div className="logged__card" aria-label="Atalho para registrar mergulho">
          <div className="logged__cardMedia">
            <img src="/images/logo-mergulho.png" alt="" aria-hidden />
          </div>
          <Link to="/logged/registrar-mergulho" className="logged__primaryBtn">
            <span className="logged__plus" aria-hidden>＋</span>
            Registrar mergulho
          </Link>
        </div>

        <Link to="/login" className="logged__logout">
          <img src="/images/mini-icon/Sair.png" alt="" className="logged__icon" aria-hidden />
          <span>Sair do sistema</span>
        </Link>
      </aside>

      {/* ===== Conteúdo ===== */}
      <main className="logged__content">
        <div className="page profile">
          <header className="profile__head">
            <h1 className="profile__title">Perfil do usuário</h1>
            <p className="profile__sub">
              Gerencie suas informações pessoais, preferências e configurações da conta.
            </p>
          </header>

          {/* Dados pessoais */}
          <section className="profile__section">
            <h2 className="profile__sectionTitle">Dados pessoais</h2>
            <div className="profile__grid">
              <div className="field">
                <label className="label">Nome</label>
                <input className="input" type="text" value={form.firstName} readOnly />
              </div>
              <div className="field">
                <label className="label">Sobrenome</label>
                <input className="input" type="text" value={form.lastName} readOnly />
              </div>
              <div className="field">
                <label className="label">Data de nascimento</label>
                <input className="input" type="date" value={form.birthDate} readOnly />
              </div>
              <div className="field">
                <label className="label">E-mail</label>
                <input className="input" type="email" value={form.email} readOnly />
              </div>
            </div>
          </section>

          {/* Alterar senha (exibição apenas; não mostrar senha atual por segurança) */}
          <section className="profile__section">
            <h2 className="profile__sectionTitle">Alterar senha</h2>
            <div className="profile__grid">
              <div className="field">
                <label className="label">Senha antiga</label>
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Informe sua senha"
                />
              </div>
              <div className="field">
                <label className="label">Confirmar senha</label>
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>

            <div style={{ marginTop: "8px" }}>
              <label style={{ fontSize: "0.9rem", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  style={{ marginRight: "6px" }}
                />
                Mostrar senha
              </label>
            </div>
          </section>

          {/* Endereço */}
          <section className="profile__section">
            <h2 className="profile__sectionTitle">Endereço</h2>
            <div className="profile__grid">
              <div className="field">
                <label className="label">CEP</label>
                <input className="input" type="text" value={form.cep} readOnly />
              </div>
              <div className="field">
                <label className="label">País</label>
                <input className="input" type="text" value={form.country} readOnly />
              </div>
              <div className="field">
                <label className="label">Estado</label>
                <input className="input" type="text" value={form.state} readOnly />
              </div>
              <div className="field">
                <label className="label">Cidade</label>
                <input className="input" type="text" value={form.city} readOnly />
              </div>
              <div className="field">
                <label className="label">Bairro</label>
                <input className="input" type="text" value={form.district} readOnly />
              </div>
              <div className="field">
                <label className="label">Logradouro</label>
                <input className="input" type="text" value={form.street} readOnly />
              </div>
              <div className="field">
                <label className="label">Complemento</label>
                <input className="input" type="text" value={form.complement} readOnly />
              </div>
              <div className="field">
                <label className="label">Número</label>
                <input className="input" type="text" value={form.number} readOnly />
              </div>
            </div>
          </section>

          {/* Ações */}
          <div className="profile__actions">
            <button type="button" className="btn-danger-outline">
              <span className="profile__trash" aria-hidden></span>
              DELETAR CONTA
            </button>
            <button type="button" className="btn-primary">EDITAR INFORMAÇÕES</button>
          </div>
        </div>
      </main>
    </div>
  );
}

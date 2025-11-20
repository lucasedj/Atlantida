import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { getCurrentUser, me } from "../../features/auth/authService";
import { apiFetch } from "../../services/api";

import "../Logged/logged.css";
import "./profile.css";

export default function Profile() {
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [formBackup, setFormBackup] = useState(null);

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

  function toInputDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return "";
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
    const cached = getCurrentUser();
    if (cached) {
      hydrate(cached);
    } else {
      me()
        .then((u) => {
          hydrate(u);
          try { localStorage.setItem("user", JSON.stringify(u)); } catch { }
        })
        .catch(() => { });
    }
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleEdit() {
    setMsg("");
    setFormBackup(form);
    setIsEditing(true);
  }

  function handleCancel() {
    if (formBackup) setForm(formBackup);
    setIsEditing(false);
    setSaving(false);
    setShowPassword(false);
    setMsg("Edição cancelada.");
  }

  async function handleSave() {
    setMsg("");
    setSaving(true);
    try {
      const payload = { ...form };
      const updated = await apiFetch("/api/users", {
        method: "PUT",
        auth: true,
        body: payload,
      });

      setUser(updated);
      try { localStorage.setItem("user", JSON.stringify(updated)); } catch { }

      setFormBackup({
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        birthDate: toInputDate(updated.birthDate),
        email: updated.email ?? "",
        cep: updated.cep ?? "",
        country: updated.country ?? "",
        state: updated.state ?? "",
        city: updated.city ?? "",
        district: updated.district ?? "",
        street: updated.street ?? "",
        complement: updated.complement ?? "",
        number: updated.number ?? "",
      });

      setIsEditing(false);
      setMsg("Dados atualizados com sucesso.");
    } catch (err) {
      setMsg(err?.message || "Falha ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

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

      <main className="logged__content">
        <div className="page profile">
          <header className="profile__head">
            <h1 className="profile__title">Perfil do usuário</h1>
            <p className="profile__sub">
              Gerencie suas informações pessoais, preferências e configurações da conta.
            </p>
          </header>

          <section className="profile__section">
            <h2 className="profile__sectionTitle">Dados pessoais</h2>
            <div className="profile__grid">
              <div className="field">
                <label className="label">Nome</label>
                <input
                  className="input"
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">Sobrenome</label>
                <input
                  className="input"
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">Data de nascimento</label>
                <input
                  className="input"
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">E-mail</label>
                <input
                  className="input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </section>

          <section className="profile__section">
            <h2 className="profile__sectionTitle">Alterar senha</h2>
            <div className="profile__grid">
              <div className="field">
                <label className="label">Senha antiga</label>
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Informe sua senha"
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">Confirmar senha</label>
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repita a nova senha"
                  readOnly={!isEditing}
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

          <section className="profile__section">
            <h2 className="profile__sectionTitle">Endereço</h2>
            <div className="profile__grid">
              <div className="field">
                <label className="label">CEP</label>
                <input
                  className="input"
                  type="text"
                  name="cep"
                  value={form.cep}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">País</label>
                <input
                  className="input"
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">Estado</label>
                <input
                  className="input"
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">Cidade</label>
                <input
                  className="input"
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">Bairro</label>
                <input
                  className="input"
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">Logradouro</label>
                <input
                  className="input"
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">Complemento</label>
                <input
                  className="input"
                  type="text"
                  name="complement"
                  value={form.complement}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
              <div className="field">
                <label className="label">Número</label>
                <input
                  className="input"
                  type="text"
                  name="number"
                  value={form.number}
                  onChange={onChange}
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </section>

          {msg && (
            <p
              aria-live="polite"
              style={{ marginTop: 8, color: msg.includes("sucesso") ? "#16a34a" : "#dc2626" }}
            >
              {msg}
            </p>
          )}

          <div className="profile__actions">
            <button type="button" className="btn-danger-outline">
              <span className="profile__trash" aria-hidden></span>
              DELETAR CONTA
            </button>

            <button
              type="button"
              className="btn-primary-small"
              onClick={handleEdit}
              disabled={isEditing}
            >
              EDITAR INFORMAÇÕES
            </button>

            {isEditing && (
              <>
                <button
                  type="button"
                  className="btn-primary-small"
                  onClick={handleSave}
                  disabled={saving}
                  style={{ marginLeft: 8 }}
                >
                  {saving ? "SALVANDO..." : "SALVAR"}
                </button>

                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={handleCancel}
                  style={{ marginLeft: 8 }}
                  aria-label="Cancelar edição"
                >
                  CANCELAR
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

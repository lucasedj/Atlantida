import React, { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./RegisterForm1.css";

import EyeOnIcon from "../../assets/icons/eye-on-icon.svg";
import EyeOffIcon from "../../assets/icons/eye-off-icon.svg";
import Arrow from "../../assets/icons/arrow-icon-blue.svg";
import Logo from "../../assets/illustrations/logo-atlantida.svg";
import LeftCoral from "../../assets/illustrations/left-corals.svg";
import RightCoral from "../../assets/illustrations/right-corals.svg";

import { Context } from "../../context";

const RegistrationForm = () => {
  const {
    firstName, setFirstName,
    lastName, setLastName,
    dob, setDob,
    email, setEmail,
    password, setPassword,
    confirmPassword, setconfirmPassword,
    cep, setCep,
    country, setCountry,
    state, setState,
    city, setCity,
    district, setDistrict,
    street, setStreet,
    number, setNumber,
    complement, setComplement
  } = useContext(Context);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate(); // ✅ adicionado

  const onSubmit = (data) => {
    console.log(data);
    navigate("/registerE"); // ✅ redireciona após validação
  };

  
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  useEffect(() => {
   
  }, [])

  return (
    <div>
      {/* Navbar fica fora da container central */}
      <div className="navbar">
        <img src={Logo} alt="Logo Atlântida" className="logo" />
        <a href="/login" className="back-button">
          <img src={Arrow} alt="Seta voltar" style={{ width: "16px", height: "16px" }} />
          VOLTAR AO LOGIN
        </a>
      </div>

      {/* Corais decorativos */}
      <div className="corals">
        <img src={LeftCoral} alt="Coral esquerdo" className="left-coral" />
        <img src={RightCoral} alt="Coral direito" className="right-coral" />
      </div>

      {/* Container principal centralizado */}
      <div className="container">
        <h1 className="title">Crie sua conta</h1>
        <p className="subtitle">
          O cadastro será realizado em duas etapas, preencha todos os campos atentamente
        </p>

        {/* Stepper com indicadores e barras */}
        <div className="stepper-container">
          <div className="steps-row">
            <div className="step-item active">
              <div className="step-number">1</div>
              <span className="step-label">Dados pessoais</span>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <span className="step-label">Endereço</span>
            </div>
          </div>

          <div className="step-bar-container">
            <div className="step-bar active"></div>
            <div className="step-bar inactive"></div>
          </div>

          <div className="step-counter">Etapa 1 de 2</div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          {/* NOME */}
          <div className="form-group">
            <label className="label">Nome</label>
            <input
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              type =""
              className="input"
              placeholder="Seu primeiro nome"
            />
            {errors.firstName && <p className="error">Nome é obrigatório.</p>}
          </div>

          {/* SOBRENOME */}
          <div className="form-group">
            <label className="label">Sobrenome</label>
            <input
               value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              type ="text"
              className="input"
              placeholder="Seu último nome"
            />
            {errors.lastName && <p className="error">Sobrenome é obrigatório.</p>}
          </div>

          {/* DATA DE NASCIMENTO */}
          <div className="form-group">
            <label className="label">Data de nascimento</label>
            <input
              value={dob}
              onChange={(e) => {
                setDob(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              type="date"
              className="input"
              placeholder="dd/mm/aaaa"
            />
            {errors.dob && <p className="error">Data de nascimento é obrigatória.</p>}
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label className="label">E-mail</label>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              type="email"
              className="input"
              placeholder="exemplo@seuemail.com"
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          {/* SENHA */}
          <div className="form-group">
            <label className="label">Senha</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                setPassword(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
                className="input"
                placeholder="Informe sua senha"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img src={showPassword ? EyeOnIcon : EyeOffIcon} alt="Toggle password" />
              </button>
            </div>
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          {/* CONFIRMAR SENHA */}
          <div className="form-group">
            <label className="label">Confirmar senha</label>
            <div className="password-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                setconfirmPassword(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
                className="input"
                placeholder="Repita sua senha"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <img
                  src={showConfirmPassword ? EyeOnIcon : EyeOffIcon}
                  alt="Toggle confirm password"
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" className="submit-button">
            PRÓXIMA ETAPA
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;

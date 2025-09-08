import React, { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import "./RegisterForm2.css";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/client";

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

  const navigate = useNavigate();

  const onSubmit = (data) => {
    api.post("/api/users", {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      birthDate: dob,
      cep: cep,
      country: country,
      state: state,
      city: city,
      district: district,
      street: street,
      number: number,
      complement: complement,
    }, {
      withCredentials: true
    })
      .then((res) => {
        navigate("/login");
      })
      .catch((err) => {
        console.log(err.response?.data?.message)
      });

  }
  return (
    <div>
      {/* Navbar fica fora da container central */}
      <div className="navbar">
        <img src={Logo} alt="Logo Atlântida" className="logo" />
        <Link to="/register" className="back-button">
          <img src={Arrow} alt="Seta voltar" style={{ width: "16px", height: "16px" }} />
          VOLTAR À ETAPA ANTERIOR
        </Link>

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
            <div className="step-item">
              <div className="step-number">1</div>
              <span className="step-label">Dados pessoais</span>
            </div>
            <div className="step-item active">
              <div className="step-number">2</div>
              <span className="step-label">Endereço</span>
            </div>
          </div>

          <div className="step-bar-container">
            <div className="step-bar inactive"></div>
            <div className="step-bar active"></div>
          </div>

          <div className="step-counter">Etapa 2 de 2</div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          {/* CEP */}
          <div className="form-group">
            <label className="label">CEP</label>
            <input
              value={cep}
              onChange={(e) => {
                setCep(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              className="input"
              placeholder="00000-000"
            />
            {errors.cep && <p className="error">{errors.cep.message}</p>}
          </div>

          {/* PAÍS */}
          <div className="form-group">
            <label className="label">País</label>
            <input
              value={country}
              onChange={(e) => {
                setCountry(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              className="input"
              placeholder="Brasil"
            />
            {errors.country && <p className="error">{errors.country.message}</p>}
          </div>

          {/* ESTADO */}
          <div className="form-group">
            <label className="label">Estado</label>
            <input
              value={state}
              onChange={(e) => {
                setState(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              className="input"
              placeholder="Digite seu estado"
            />
            {errors.state && <p className="error">{errors.state.message}</p>}
          </div>

          {/* CIDADE */}
          <div className="form-group">
            <label className="label">Cidade</label>
            <input
              value={city}
              onChange={(e) => {
                setCity(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              className="input"
              placeholder="Digite sua cidade"
            />
            {errors.city && <p className="error">{errors.city.message}</p>}
          </div>

          {/* BAIRRO */}
          <div className="form-group">
            <label className="label">Bairro</label>
            <input
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              className="input"
              placeholder="Digite seu bairro"
            />
            {errors.district && <p className="error">{errors.district.message}</p>}
          </div>

          {/* LOGRADOURO */}
          <div className="form-group">
            <label className="label">Logradouro</label>
            <input
              value={street}
              onChange={(e) => {
                setStreet(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              className="input"
              placeholder="Digite o logradouro"
            />
            {errors.street && <p className="error">{errors.street.message}</p>}
          </div>

          {/* NÚMERO */}
          <div className="form-group">
            <label className="label">Número</label>
            <input
              value={number}
              onChange={(e) => {
                setNumber(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              className="input"
              placeholder="Número ou S/N"
            />
            {errors.number && <p className="error">{errors.number.message}</p>}
          </div>

          {/* COMPLEMENTO */}
          <div className="form-group">
            <label className="label">Complemento (opcional)</label>
            <input
              value={complement}
              onChange={(e) => {
                setComplement(e.target.value)
                e.target.setCustomValidity("")
              }}
              required
              onInvalid={(e) => e.target.setCustomValidity("")}
              className="input"
              placeholder="Apartamento, sala, conjunto, andar"
            />
          </div>

          <button type="submit" className="submit-button">
            CONCLUIR REGISTRO
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
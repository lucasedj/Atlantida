import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./RegisterForm2.css";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/client";

import Arrow from "../../assets/icons/arrow-icon-blue.svg";
import Logo from "../../assets/illustrations/logo-atlantida.svg";

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
    formState: { errors },
    setValue,            // 👈 vamos sincronizar Context -> RHF
  } = useForm({
    mode: "onChange",
    defaultValues: {
      cep: cep || "",
      country: country || "",
      state: state || "",
      city: city || "",
      district: district || "",
      street: street || "",
      number: number || "",
      complement: complement || "",
    },
  });

  const navigate = useNavigate();

  // --- Helpers de CEP ---
  const normalizeCep = (v = "") => v.replace(/\D/g, "").slice(0, 8);
  const maskCep = (v = "") => {
    const n = normalizeCep(v);
    return n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n;
  };

  // Helper para sincronizar qualquer campo com o RHF
  const sync = (name, value) => {
    setValue(name, value, { shouldValidate: true, shouldDirty: true });
  };

  // Estados locais para feedback da busca de CEP
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState("");

  // Sincroniza valores existentes do Context com o RHF ao montar (caso venham da etapa anterior)
  useEffect(() => {
    sync("cep", cep || "");
    sync("country", country || "");
    sync("state", state || "");
    sync("city", city || "");
    sync("district", district || "");
    sync("street", street || "");
    sync("number", number || "");
    sync("complement", complement || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // uma vez

  // Dispara a busca quando o CEP tiver 8 dígitos
  useEffect(() => {
    const digits = normalizeCep(cep);
    if (digits.length !== 8) {
      if (digits.length === 0) setCepMessage("");
      return;
    }

    let cancelled = false;
    const fetchAddress = async () => {
      setCepLoading(true);
      setCepMessage("Buscando endereço pelo CEP...");
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();

        if (cancelled) return;

        if (data?.erro) {
          setCepMessage("CEP não encontrado.");
          return;
        }

        // Preenche campos (não sobrescreve se usuário já digitou algo manualmente)
        setCountry((prev) => {
          const v = prev || "Brasil";
          sync("country", v);
          return v;
        });
        if (data.uf) {
          setState((prev) => {
            const v = prev || data.uf;
            sync("state", v);
            return v;
          });
        }
        if (data.localidade) {
          setCity((prev) => {
            const v = prev || data.localidade;
            sync("city", v);
            return v;
          });
        }
        if (data.bairro) {
          setDistrict((prev) => {
            const v = prev || data.bairro;
            sync("district", v);
            return v;
          });
        }
        if (data.logradouro) {
          setStreet((prev) => {
            const v = prev || data.logradouro;
            sync("street", v);
            return v;
          });
        }

        setCepMessage("Endereço preenchido automaticamente.");
      } catch (e) {
        setCepMessage("Falha ao buscar CEP. Tente novamente.");
      } finally {
        if (!cancelled) setCepLoading(false);
      }
    };

    // pequeno debounce para evitar chamadas em excesso
    const t = setTimeout(fetchAddress, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep]);

  const onSubmit = () => {
    api.post(
      "/api/users",
      {
        firstName,
        lastName,
        email,
        password,
        birthDate: dob,
        cep,
        country,
        state,
        city,
        district,
        street,
        number,
        complement,
      },
      { withCredentials: true }
    )
      .then(() => navigate("/login"))
      .catch((err) => {
        console.log(err.response?.data?.message);
      });
  };

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <img src={Logo} alt="Logo Atlântida" className="logo" />
        <Link to="/register" className="back-button">
          <img src={Arrow} alt="Seta voltar" style={{ width: "16px", height: "16px" }} />
          VOLTAR À ETAPA ANTERIOR
        </Link>
      </div>

      {/* Container principal */}
      <div className="container">
        <h1 className="title">Crie sua conta</h1>
        <p className="subtitle">
          O cadastro será realizado em duas etapas, preencha todos os campos atentamente
        </p>

        {/* Stepper */}
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
              {...register("cep", {
                required: "CEP é obrigatório.",
                pattern: {
                  value: /^\d{5}-\d{3}$/,
                  message: "Formato de CEP inválido. Use o formato 00000-000.",
                },
              })}
              value={cep}
              onChange={(e) => {
                const masked = maskCep(e.target.value);
                setCep(masked);
                sync("cep", masked);
              }}
              className="input"
              placeholder="00000-000"
              inputMode="numeric"
              autoComplete="postal-code"
            />
            {errors.cep && <p className="error">{errors.cep.message}</p>}
            {!!cepMessage && (
              <p className={cepLoading ? "info" : "success"} style={{ marginTop: 6 }}>
                {cepMessage}
              </p>
            )}
          </div>

          {/* PAÍS */}
          <div className="form-group">
            <input
              {...register("country", { required: "País é obrigatório." })}
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                sync("country", e.target.value);
              }}
              className="input"
              placeholder="Brasil"
              autoComplete="country-name"
            />
            {errors.country && <p className="error">{errors.country.message}</p>}
          </div>

          {/* ESTADO */}
          <div className="form-group">
            <label className="label">Estado</label>
            <input
              {...register("state", { required: "Estado é obrigatório." })}
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                sync("state", e.target.value);
              }}
              className="input"
              placeholder="Digite seu estado (UF)"
              autoComplete="address-level1"
            />
            {errors.state && <p className="error">{errors.state.message}</p>}
          </div>

          {/* CIDADE */}
          <div className="form-group">
            <label className="label">Cidade</label>
            <input
              {...register("city", { required: "Cidade é obrigatória." })}
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                sync("city", e.target.value);
              }}
              className="input"
              placeholder="Digite sua cidade"
              autoComplete="address-level2"
            />
            {errors.city && <p className="error">{errors.city.message}</p>}
          </div>

          {/* BAIRRO */}
          <div className="form-group">
            <label className="label">Bairro</label>
            <input
              {...register("district", { required: "Bairro é obrigatório." })}
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                sync("district", e.target.value);
              }}
              className="input"
              placeholder="Digite seu bairro"
            />
            {errors.district && <p className="error">{errors.district.message}</p>}
          </div>

          {/* LOGRADOURO */}
          <div className="form-group">
            <label className="label">Logradouro</label>
            <input
              {...register("street", { required: "Logradouro é obrigatório." })}
              value={street}
              onChange={(e) => {
                setStreet(e.target.value);
                sync("street", e.target.value);
              }}
              className="input"
              placeholder="Digite o logradouro"
              autoComplete="street-address"
            />
            {errors.street && <p className="error">{errors.street.message}</p>}
          </div>

          {/* NÚMERO */}
          <div className="form-group">
            <label className="label">Número</label>
            <input
              {...register("number", { required: "Número é obrigatório." })}
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                sync("number", e.target.value);
              }}
              className="input"
              placeholder="Número ou S/N"
              autoComplete="on"
            />
            {errors.number && <p className="error">{errors.number.message}</p>}
          </div>

          {/* COMPLEMENTO */}
          <div className="form-group">
            <label className="label">Complemento (opcional)</label>
            <input
              {...register("complement", {
                maxLength: { value: 100, message: "Complemento deve ter no máximo 100 caracteres." },
                required: false,
              })}
              value={complement}
              onChange={(e) => {
                setComplement(e.target.value);
                sync("complement", e.target.value);
              }}
              className="input"
              placeholder="Apartamento, sala, conjunto, andar"
            />
            {errors.complement && <p className="error">{errors.complement.message}</p>}
          </div>

          <button type="submit" className="submit-button" disabled={cepLoading}>
            {cepLoading ? "Carregando..." : "CONCLUIR REGISTRO"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;

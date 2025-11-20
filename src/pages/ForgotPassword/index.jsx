import SliderImages from "../../components/SliderImages";
import logo from "../../assets/illustrations/logo-atlantida.svg";
import styles from "./ForgotPassword.module.css";
import { Link } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import { apiFetch } from "../../services/api.js";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRecoverPassword = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // 🔹 Ajuste: rota completa do backend
      const response = await apiFetch("/api/users/recoverPassword", {
        method: "POST",
        body: { email },
        parse: "json"
      });

      setMessage(response.message || "Email enviado com sucesso!");
    } catch (err) {
      setError(err.payload?.message || err.message || "Erro ao enviar o email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.carousel}>
        <SliderImages />
      </div>

      <div className={styles.login}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo atlântida" />
        </div>

        <h1 className={styles.title}>Redefinição de senha</h1>

        <p className={styles.description}>
          Informe seu e-mail para o evnio da nova senha de acesso temporário.
        </p>

        <label htmlFor="email">Email</label>
        <input
          className={styles.input}
          type="email"
          id="email"
          placeholder="exemplo@seuemail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className={styles.btn_send_link}
          onClick={handleRecoverPassword}
          disabled={loading}
        >
          {loading ? "Enviando..." : "ENVIAR LINK"}
        </button>

        {message && <p className={styles.success}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}

        <Link to="/login" className={styles.btn_back_login}>
          <IconArrowLeft size={20} /> VOLTAR AO LOGIN
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;

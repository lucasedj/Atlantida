import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SliderImages from "../../components/SliderImages";
import logo from "../../assets/illustrations/logo-atlantida.svg";
import styles from "./Login.module.css";
import { login } from "../../features/auth/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate("/logged", { state: { user } });
    } catch (error) {
      setErr(error?.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.carousel}>
        <SliderImages />
      </div>

      <div className={styles.login}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo atlântida" />
        </div>

        <h1 className={styles.title}>Faça seu login</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email">E-mail</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            id="email"
            placeholder="exemplo@seuemail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className={styles.passwordLabelRow}>
            <label htmlFor="password">Senha</label>
            <Link to="/forgotpassword">esqueceu a senha?</Link>
          </div>
          <input
            className={styles.input}
            type="password"
            name="password"
            id="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {err && <p className={styles.error}>{err}</p>}

          <button
            type="submit"
            className={styles.btn_login}
            disabled={loading}
          >
            {loading ? "Entrando..." : "LOGIN"}
          </button>
        </form>

        <p className={styles.paragraph}>
          Não tem uma conta? <Link to="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

// src/routes.jsx
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import Article1 from "./pages/Articles/Article-1";
import Article2 from "./pages/Articles/Article-2";
import Article3 from "./pages/Articles/Article-3";

import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterStep1 from "./pages/RegisterStep1";
import RegisterStep2 from "./pages/RegisterStep2";
import ForgotPassword from "./pages/ForgotPassword";
import Error404 from "./pages/Error404";
import Terms from "./pages/Terms";
import Logged from "./pages/Logged";
import Statistics from "./pages/Statistics";

// Pastas com index.jsx podem ser importadas só pelo diretório
import RegisterDive from "./pages/RegisterDive";
import Step2 from "./pages/RegisterDive/Step2";
import Step3 from "./pages/RegisterDive/Step3";
import Step4 from "./pages/RegisterDive/Step4";
import Step5 from "./pages/RegisterDive/Step5";


import Certificates from "./pages/Certificates";
import Profile from "./pages/Profile";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial (ajuste se quiser redirecionar direto pro /logged) */}
        <Route path="/" element={<Home />} />
        {/* <Route path="/" element={<Navigate to="/logged" replace />} /> */}

        {/* Autenticação / termos */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterStep1 />} />
        <Route path="/registerE" element={<RegisterStep2 />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/logged/estatisticas" element={<Statistics />} />

        {/* Painel */}
        <Route path="/logged" element={<Logged />} />

        {/* Fluxo de registrar mergulho */}
        <Route path="/logged/registrar-mergulho" element={<RegisterDive />} />
        <Route path="/logged/registrar-mergulho/Step2" element={<Step2 />} />
        <Route path="/logged/registrar-mergulho/Step3" element={<Step3 />} />
        <Route path="/logged/registrar-mergulho/Step4" element={<Step4 />} />
        <Route path="/logged/registrar-mergulho/Step5" element={<Step5 />} />

        <Route path="/logged/perfil" element={<Profile />} />
        <Route path="/logged/certificados" element={<Certificates />} />

        {/* Artigos */}
        <Route path="/artigos/mergulho-responsavel" element={<Article1 />} />
        <Route path="/artigos/negligencia-dos-oceanos" element={<Article2 />} />
        <Route path="/artigos/missao-dos-mergulhadores" element={<Article3 />} />

        {/* 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
}

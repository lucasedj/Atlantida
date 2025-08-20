import { BrowserRouter, Route, Routes } from "react-router-dom";
import Article1 from "./pages/Articles/Article-1";
import Article2 from "./pages/Articles/Article-2";
import Article3 from "./pages/Articles/Article-3";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterStep1 from "./pages/RegisterStep1";
import ForgotPassword from "./pages/ForgotPassword";
import Error404 from "./pages/Error404";
import Terms from "./pages/Terms";
import Logged from "./pages/logged";
import Certificates from "./pages/Certificates";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/logged" element={<Logged />} />
        <Route path="/artigos/mergulho-responsavel" element={<Article1 />} />
        <Route path="/artigos/negligencia-dos-oceanos" element={<Article2 />} />
        <Route path="/artigos/missao-dos-mergulhadores" element={<Article3 />} />
        <Route path="/logged/certificados" element={<Certificates />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterStep1 />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

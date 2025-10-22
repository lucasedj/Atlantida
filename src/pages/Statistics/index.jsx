import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Chart } from "react-google-charts";
import "./statistics.css";
import { apiFetch } from "../../services/api";

const MenuItem = ({ to, icon, children, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      isActive ? "logged__item active" : "logged__item"
    }
  >
    <img src={icon} alt="" className="logged__icon" aria-hidden />
    <span>{children}</span>
  </NavLink>
);

const Sidebar = () => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [diveLogs, setDiveLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState("geral");

  const [stats, setStats] = useState({
    total: 0,
    avgTime: 0,
    avgDepth: 0,
    mostCommonWaterType: "",
    mostCommonWeather: "",
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const fetchDiveLogs = async (start, end) => {
    setLoading(true);
    setError(null);

    try {
      let data;

      if (start || end) {
        const body = {};
        if (start) body.startDate = new Date(start).toISOString();
        if (end) body.endDate = new Date(end).toISOString();

        data = await apiFetch("/api/diveLogs/dateRange", {
          method: "POST",
          body: body,
        });
      } else {
        data = await apiFetch("/api/diveLogs");
      }

      const sortedData = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];

      setDiveLogs(sortedData);
      calculateStats(sortedData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao buscar dados.");
      setDiveLogs([]);
      setStats({
        total: 0,
        avgTime: 0,
        avgDepth: 0,
        mostCommonWaterType: "",
        mostCommonWeather: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logs) => {
    if (!logs.length) {
      setStats({
        total: 0,
        avgTime: 0,
        avgDepth: 0,
        mostCommonWaterType: "",
        mostCommonWeather: "",
      });
      return;
    }

    const total = logs.length;
    const totalTime = logs.reduce((acc, cur) => acc + (cur.bottomTimeInMinutes || 0), 0);
    const totalDepth = logs.reduce((acc, cur) => acc + (cur.depth || 0), 0);

    const mostCommon = (arr) => {
      const freq = {};
      arr.forEach((val) => {
        freq[val] = (freq[val] || 0) + 1;
      });
      return Object.entries(freq).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    };

    const mostCommonWaterType = mostCommon(logs.map((log) => log.waterType || ""));
    const mostCommonWeather = mostCommon(logs.map((log) => log.weatherConditions || ""));

    setStats({
      total,
      avgTime: totalTime / total,
      avgDepth: totalDepth / total,
      mostCommonWaterType,
      mostCommonWeather,
    });
  };

  useEffect(() => {
    fetchDiveLogs();
  }, []);

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleFilterApply = () => fetchDiveLogs(startDate, endDate);

  const getChartData = () => {
    switch (selectedChart) {
      case "tempo":
        return [
          ["Mergulho", "Tempo (min)", { role: "style" }],
          ...diveLogs.map((log, i) => [
            log.title || `Mergulho ${i + 1}`,
            log.bottomTimeInMinutes || 0,
            "#0070E0",
          ]),
        ];
      case "profundidade":
        return [
          ["Mergulho", "Profundidade (m)", { role: "style" }],
          ...diveLogs.map((log, i) => [
            log.title || `Mergulho ${i + 1}`,
            log.depth || 0,
            "#007FFF",
          ]),
        ];
      case "temperatura":
        return [
          ["Mergulho", "Temp. fundo (°C)", { role: "style" }],
          ...diveLogs.map((log, i) => [
            log.title || `Mergulho ${i + 1}`,
            log.temperature?.bottom || 0,
            "#1F8FFF",
          ]),
        ];
      case "geral":
        return [
          ["Mergulho", "Tempo", "Profundidade", "Temp. Fundo"],
          ...diveLogs.map((log, i) => [
            log.title || `Mergulho ${i + 1}`,
            log.bottomTimeInMinutes || 0,
            log.depth || 0,
            log.temperature?.bottom || 0,
          ]),
        ];
      default:
        return [];
    }
  };

  const getChartOptions = () => {
    const base = {
      legend: { position: selectedChart === "geral" ? "top" : "none" },
      chartArea: { width: "70%" },
    };

    switch (selectedChart) {
      case "tempo":
        return {
          ...base,
          title: "Tempo total de fundo por mergulho",
          hAxis: { title: "Minutos" },
          vAxis: { title: "Mergulhos" },
        };
      case "profundidade":
        return {
          ...base,
          title: "Profundidade por mergulho",
          hAxis: { title: "Metros" },
          vAxis: { title: "Mergulhos" },
        };
      case "temperatura":
        return {
          ...base,
          title: "Temperatura de fundo por mergulho",
          hAxis: { title: "Temperatura (°C)" },
          vAxis: { title: "Mergulhos" },
        };
      case "geral":
        return {
          ...base,
          title: "Resumo geral por mergulho",
          isStacked: false,
          colors: ["#0070E0", "#1F8FFF", "#70B8FF"], // cores para as 3 séries
        };
      default:
        return base;
    }
  };

  return (
    <div className="logged">
      <aside className="logged__sidebar">
        <div className="logged__brand">
          <img src="/images/logo-atlantida-branca.png" alt="Atlântida" className="logged__logoImg" />
        </div>

        <nav className="logged__nav" aria-label="Navegação principal">
          <MenuItem end to="/logged" icon="/images/mini-icon/início.png">Início</MenuItem>
          <MenuItem to="/logged/estatisticas" icon="/images/mini-icon/estatística.png">Estatísticas</MenuItem>
          <MenuItem to="/logged/locais" icon="/images/mini-icon/locais-de-mergulho.png">Locais de mergulho</MenuItem>
          <MenuItem to="/logged/certificados" icon="/images/mini-icon/certificados.png">Certificados</MenuItem>
          <MenuItem to="/logged/perfil" icon="/images/mini-icon/perfil.png">Perfil do usuário</MenuItem>
        </nav>

        <div className="logged__card" aria-label="Atalho para registrar mergulho">
          <div className="logged__cardMedia">
            <img src="/images/logo-mergulho.png" alt="" aria-hidden />
          </div>
          <Link to="/logged/registrar-mergulho" className="logged__primaryBtn" role="button">
            <span className="logged__plus" aria-hidden>＋</span>
            Registrar mergulho
          </Link>
        </div>

        <button type="button" className="logged__logout" onClick={handleLogout}>
          <img src="/images/mini-icon/Sair.png" alt="" className="logged__icon" aria-hidden />
          <span>Sair do sistema</span>
        </button>
      </aside>

      <main className="logged__main">
        <div className="statistics">
          <div className="statistics__header">
            <div>
              <h1>Estatísticas</h1>
              <p>Explore as estatísticas detalhadas dos seus mergulhos, desde a profundidade até as condições.</p>
            </div>

            <div className="statistics__filter">
              <label htmlFor="period">Filtre por período</label>
              <div>
                <input type="date" id="period-start" value={startDate} onChange={handleStartDateChange} />
                <span> - </span>
                <input type="date" id="period-end" value={endDate} onChange={handleEndDateChange} />
                <button onClick={handleFilterApply} className="statistics__chartBtn" style={{ marginLeft: "10px" }}>
                  Aplicar
                </button>
              </div>
            </div>
          </div>

          {loading && <p>Carregando dados...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="statistics__cards">
            <div className="statistics__card">
              <span className="statistics__label">Total de mergulhos</span>
              <strong className="statistics__value">{stats.total}</strong>
            </div>
            <div className="statistics__card">
              <span className="statistics__label">Tempo médio</span>
              <strong className="statistics__value">{stats.avgTime.toFixed(0)} Minutos</strong>
            </div>
            <div className="statistics__card">
              <span className="statistics__label">Profundidade média</span>
              <strong className="statistics__value">{Math.round(stats.avgDepth)} Metros</strong>
            </div>
            <div className="statistics__card">
              <span className="statistics__label">Corpo de água mais comum</span>
              <strong className="statistics__value">{stats.mostCommonWaterType || "-"}</strong>
            </div>
            <div className="statistics__card">
              <span className="statistics__label">Clima mais comum</span>
              <strong className="statistics__value">{stats.mostCommonWeather || "-"}</strong>
            </div>
          </div>

          <div className="statistics__chart">
            <div className="statistics__chartHeader">
              <div className="statistics__chartSelector">
                <label htmlFor="chart-select" style={{ marginRight: "10px", fontWeight: "bold" }}>
                  Selecionar gráfico:
                </label>
                <select
                  id="chart-select"
                  value={selectedChart}
                  onChange={(e) => setSelectedChart(e.target.value)}
                  className="statistics__chartSelect"
                >
                  <option value="tempo">Tempo de fundo</option>
                  <option value="profundidade">Profundidade</option>
                  <option value="temperatura">Temp. fundo</option>
                  <option value="geral">Resumo geral</option>
                </select>
              </div>
            </div>
            <div className="statistics__chartContent">
              {diveLogs.length === 0 ? (
                <div className="statistics__chartPlaceholder">
                  <p>[ Nenhum dado para mostrar no gráfico ]</p>
                </div>
              ) : (
                <Chart
                  chartType={selectedChart === "geral" ? "ColumnChart" : "ColumnChart"}
                  width="100%"
                  height="300px"
                  data={getChartData()}
                  options={getChartOptions()}
                  loader={<div>Carregando gráfico...</div>}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sidebar;

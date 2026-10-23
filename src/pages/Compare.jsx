import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import BarChart from "../components/BarChart.jsx";
import { fetchAllIndicators } from "../services/worldBankApi.js";
import { formatNumber, formatMoney } from "../services/format.js";

const MIN = 2;
const MAX = 4;

function Compare({ countries }) {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState([]); // array of country codes
  const [choice, setChoice] = useState("");
  const [message, setMessage] = useState("");

  // indicatorData looks like { LKA: {gdp, gdpPerCapita, lifeExpectancy}, ... }
  const [indicatorData, setIndicatorData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // if we came from the "Compare this country" button, add that country
  useEffect(() => {
    const addCode = searchParams.get("add");
    if (addCode) {
      setSelected((old) => (old.includes(addCode) ? old : [...old, addCode]));
    }
  }, [searchParams]);

  // load indicators for any selected country we do not have yet
  useEffect(() => {
    let ignore = false;
    const missing = selected.filter((code) => !indicatorData[code]);
    if (missing.length === 0) return;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const results = await Promise.all(missing.map((code) => fetchAllIndicators(code)));
        if (ignore) return;
        const newData = {};
        missing.forEach((code, index) => {
          newData[code] = results[index];
        });
        setIndicatorData((old) => ({ ...old, ...newData }));
      } catch (err) {
        if (!ignore) setError("Some indicator data could not be loaded. Please try again.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [selected]);

  function addCountry() {
    setMessage("");
    if (choice === "") return;
    if (selected.includes(choice)) {
      setMessage("That country is already selected.");
      return;
    }
    if (selected.length >= MAX) {
      setMessage("You can compare up to " + MAX + " countries. Remove one first.");
      return;
    }
    setSelected([...selected, choice]);
    setChoice("");
  }

  function removeCountry(code) {
    setMessage("");
    setSelected(selected.filter((c) => c !== code));
  }

  // build one row of data per selected country
  const rows = selected.map((code) => {
    const country = countries.find((c) => c.cca3 === code);
    const ind = indicatorData[code];
    return {
      code: code,
      name: country ? country.name.common : code,
      population: country ? country.population : null,
      area: country ? country.area : null,
      gdp: ind && ind.gdp ? ind.gdp.value : null,
      gdpPerCapita: ind && ind.gdpPerCapita ? ind.gdpPerCapita.value : null,
      lifeExpectancy: ind && ind.lifeExpectancy ? ind.lifeExpectancy.value : null,
    };
  });

  const metrics = [
    { key: "population", label: "Population", format: formatNumber },
    { key: "area", label: "Land area (km²)", format: formatNumber },
    { key: "gdp", label: "GDP", format: formatMoney },
    { key: "gdpPerCapita", label: "GDP per capita", format: formatMoney },
    { key: "lifeExpectancy", label: "Life expectancy (years)", format: formatNumber },
  ];

  // highest / lowest for a metric (missing values are ignored, never treated as 0)
  function getExtremes(key) {
    const values = rows.filter((r) => r[key] !== null && r[key] !== undefined).map((r) => r[key]);
    if (values.length < 2) return { high: null, low: null };
    return { high: Math.max(...values), low: Math.min(...values) };
  }

  const canCompare = selected.length >= MIN;

  return (
    <div>
      <h1>Compare countries</h1>
      <p className="muted">Pick {MIN} to {MAX} countries.</p>

      <div className="toolbar">
        <div className="field grow">
          <label htmlFor="compare-select">Add a country</label>
          <select id="compare-select" value={choice} onChange={(e) => setChoice(e.target.value)}>
            <option value="">Choose a country...</option>
            {[...countries]
              .sort((a, b) => a.name.common.localeCompare(b.name.common))
              .map((c) => (
                <option key={c.cca3} value={c.cca3}>{c.name.common}</option>
              ))}
          </select>
        </div>
        <button className="btn primary" onClick={addCountry} disabled={choice === ""}>
          Add
        </button>
      </div>

      {message && <p className="error-text" role="alert">{message}</p>}

      <div className="chips">
        {selected.map((code) => {
          const c = countries.find((x) => x.cca3 === code);
          return (
            <span className="chip selected" key={code}>
              {c ? c.name.common : code}
              <button
                className="chip-remove"
                onClick={() => removeCountry(code)}
                aria-label={"Remove " + (c ? c.name.common : code)}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      {!canCompare && (
        <div className="center-box">
          <p>Select at least {MIN} countries to see the comparison.</p>
        </div>
      )}

      {canCompare && (
        <div>
          {loading && <Loader text="Loading World Bank data..." />}
          {error && <p className="error-text" role="alert">{error}</p>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Indicator</th>
                  {rows.map((r) => <th key={r.code}>{r.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => {
                  const extremes = getExtremes(m.key);
                  return (
                    <tr key={m.key}>
                      <th scope="row">{m.label}</th>
                      {rows.map((r) => {
                        const value = r[m.key];
                        let className = "";
                        let tag = "";
                        if (value !== null && value !== undefined) {
                          if (value === extremes.high) { className = "highest"; tag = " ▲ highest"; }
                          else if (value === extremes.low) { className = "lowest"; tag = " ▼ lowest"; }
                        }
                        return (
                          <td key={r.code} className={className}>
                            {value !== null && value !== undefined ? m.format(value) : "Unavailable"}
                            <small>{tag}</small>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="charts-grid">
            <BarChart
              title="Population"
              data={rows.map((r) => ({ name: r.name, value: r.population }))}
            />
            <BarChart
              title="GDP per capita"
              data={rows.map((r) => ({ name: r.name, value: r.gdpPerCapita }))}
              formatter={formatMoney}
            />
            <BarChart
              title="Life expectancy (years)"
              data={rows.map((r) => ({ name: r.name, value: r.lifeExpectancy }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Compare;

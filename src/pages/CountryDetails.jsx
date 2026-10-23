import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { fetchCountryExtras } from "../services/countryApi.js";
import { fetchAllIndicators, INDICATORS } from "../services/worldBankApi.js";
import { formatNumber, formatMoney, objectValues, currencyList } from "../services/format.js";

function CountryDetails({ countries }) {
  const { code } = useParams(); // the :code part of /country/:code

  // the country itself is already in the list loaded by App
  const country = countries.find((c) => c.cca3 === code.toUpperCase());

  const [indicators, setIndicators] = useState(null);
  const [indLoading, setIndLoading] = useState(true);
  const [indError, setIndError] = useState("");

  const [extras, setExtras] = useState(null); // languages, currencies, borders
  const [extrasLoading, setExtrasLoading] = useState(true);

  // load World Bank indicators whenever the code in the URL changes
  useEffect(() => {
    let ignore = false; // stops old (stale) responses from overwriting new ones

    async function loadIndicators() {
      setIndLoading(true);
      setIndError("");
      setIndicators(null);
      try {
        const data = await fetchAllIndicators(code);
        if (!ignore) setIndicators(data);
      } catch (err) {
        if (!ignore) setIndError("Development indicators could not be loaded right now.");
      } finally {
        if (!ignore) setIndLoading(false);
      }
    }

    loadIndicators();
    window.scrollTo(0, 0);

    return () => {
      ignore = true;
    };
  }, [code]);

  // load the optional extras (languages, currencies, borders)
  useEffect(() => {
    let ignore = false;

    async function loadExtras() {
      setExtrasLoading(true);
      setExtras(null);
      const data = await fetchCountryExtras(code);
      if (!ignore) {
        setExtras(data);
        setExtrasLoading(false);
      }
    }

    loadExtras();

    return () => {
      ignore = true;
    };
  }, [code]);

  if (!country) {
    return <ErrorMessage message={"We could not find a country with the code \"" + code + "\"."} />;
  }

  const capital = country.capital.length > 0 ? country.capital.join(", ") : "N/A";
  const languages = extras ? objectValues(extras.languages) : [];
  const currencies = extras ? currencyList(extras.currencies) : [];

  // match border codes (like "IND") to country names from the list
  const borderCodes = extras && extras.borders ? extras.borders : [];
  const borders = borderCodes.map((borderCode) => {
    const found = countries.find((c) => c.cca3 === borderCode);
    return { code: borderCode, name: found ? found.name.common : borderCode };
  });

  // text to show for the optional fields
  function extraText(list) {
    if (extrasLoading) return "Loading...";
    if (list.length > 0) return list.join(", ");
    return "Unavailable";
  }

  // one row of the indicator table
  function indicatorRow(key, formatter) {
    const item = indicators ? indicators[key] : null;
    return (
      <tr key={key}>
        <th scope="row">{INDICATORS[key].label}</th>
        <td>{item ? formatter(item.value) : "Unavailable"}</td>
        <td>{item ? item.year : "—"}</td>
      </tr>
    );
  }

  return (
    <div>
      <Link to="/explore" className="back-link">← Back to explore</Link>

      <div className="detail-header">
        <img src={country.flags.svg} alt={"Flag of " + country.name.common} />
        <div>
          <h1>{country.name.common}</h1>
          <p className="muted">{country.region}</p>
          <Link to={"/compare?add=" + country.cca3} className="btn small">Compare this country</Link>
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel">
          <h2>Key facts</h2>
          <dl>
            <dt>Capital</dt><dd>{capital}</dd>
            <dt>Region</dt><dd>{country.region}</dd>
            <dt>Income level</dt><dd>{country.incomeLevel}</dd>
            <dt>Population</dt>
            <dd>
              {formatNumber(country.population)}
              {country.populationYear ? " (" + country.populationYear + ")" : ""}
            </dd>
            <dt>Area</dt><dd>{country.area !== null ? formatNumber(country.area) + " km²" : "N/A"}</dd>
            <dt>Languages</dt><dd>{extraText(languages)}</dd>
            <dt>Currencies</dt><dd>{extraText(currencies)}</dd>
          </dl>
        </section>

        <section className="panel">
          <h2>Development indicators</h2>
          {indLoading && <Loader text="Loading indicators..." />}
          {indError && <p className="error-text">{indError}</p>}
          {indicators && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Indicator</th><th>Latest value</th><th>Year</th></tr>
                </thead>
                <tbody>
                  {indicatorRow("gdp", formatMoney)}
                  {indicatorRow("gdpPerCapita", formatMoney)}
                  {indicatorRow("lifeExpectancy", (v) => formatNumber(v) + " years")}
                  {indicatorRow("internet", (v) => formatNumber(v) + " %")}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>Bordering countries</h2>
        {extrasLoading ? (
          <p>Loading...</p>
        ) : borders.length === 0 ? (
          <p>{extras ? "No land borders (island nation or no data)." : "Border data is unavailable right now."}</p>
        ) : (
          <div className="chips">
            {borders.map((b) => (
              <Link key={b.code} to={"/country/" + b.code} className="chip">{b.name}</Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CountryDetails;

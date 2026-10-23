import { Link } from "react-router-dom";
import { formatNumber } from "../services/format.js";

function CountryCard({ country, view }) {
  const capital = country.capital && country.capital.length > 0 ? country.capital[0] : "N/A";

  return (
    <Link to={"/country/" + country.cca3} className={view === "list" ? "country-card list" : "country-card"}>
      <img src={country.flags?.svg || country.flags?.png} alt={"Flag of " + country.name.common} loading="lazy" />
      <div className="country-info">
        <h3>{country.name.common}</h3>
        <p>Capital: {capital}</p>
        <p>Region: {country.region || "N/A"}</p>
        <p>Population: {formatNumber(country.population)}</p>
        <p>Area: {formatNumber(country.area)} km²</p>
      </div>
    </Link>
  );
}

export default CountryCard;

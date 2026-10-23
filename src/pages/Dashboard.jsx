import { Link } from "react-router-dom";
import StatCard from "../components/StatCard.jsx";
import CountryCard from "../components/CountryCard.jsx";
import { formatNumber } from "../services/format.js";

function Dashboard({ countries, settings }) {
  // ----- summary statistics -----
  const countryCount = countries.length;

  let worldPopulation = 0;
  for (const c of countries) {
    worldPopulation += c.population || 0;
  }

  // list of unique regions
  const regions = [];
  for (const c of countries) {
    if (c.region && !regions.includes(c.region)) regions.push(c.region);
  }

  // most populated country
  let biggest = null;
  for (const c of countries) {
    if (biggest === null || c.population > biggest.population) biggest = c;
  }

  const favourite = countries.find((c) => c.cca3 === settings.country);

  return (
    <div>
      <section className="hero">
        <h1>{settings.name ? "Welcome back, " + settings.name : "See the world in numbers"}</h1>
        <p>Explore countries, check development indicators and compare them side by side.</p>
        <div className="hero-actions">
          <Link to="/explore" className="btn primary">Explore countries</Link>
          <Link to="/compare" className="btn">Compare countries</Link>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Countries" value={countryCount} />
        <StatCard label="World population" value={formatNumber(worldPopulation)} />
        <StatCard label="Regions" value={regions.length} note={regions.join(", ")} />
        <StatCard
          label="Most populated"
          value={biggest ? biggest.name.common : "N/A"}
          note={biggest ? formatNumber(biggest.population) + " people" : ""}
        />
      </section>

      {favourite && (
        <section>
          <h2>Your preferred country</h2>
          <div className="cards-grid single">
            <CountryCard country={favourite} view="grid" />
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;

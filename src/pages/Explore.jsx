import { useState } from "react";
import CountryCard from "../components/CountryCard.jsx";

function Explore({ countries, settings }) {
  // start with the saved preferences from the Settings page
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState(settings.region || "");
  const [sortBy, setSortBy] = useState(settings.sort || "name");
  const [view, setView] = useState("grid");

  // list of regions for the dropdown
  const regions = [];
  for (const c of countries) {
    if (c.region && !regions.includes(c.region)) regions.push(c.region);
  }
  regions.sort();

  // 1. filter by search text and region
  const filtered = countries.filter((c) => {
    const matchName = c.name.common.toLowerCase().includes(search.toLowerCase().trim());
    const matchRegion = region === "" || c.region === region;
    return matchName && matchRegion;
  });

  // 2. sort (copy the array first so the original is not changed)
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "population") return (b.population || 0) - (a.population || 0);
    if (sortBy === "area") return (b.area || 0) - (a.area || 0);
    return a.name.common.localeCompare(b.name.common);
  });

  function clearFilters() {
    setSearch("");
    setRegion("");
  }

  return (
    <div>
      <h1>Explore countries</h1>

      <div className="toolbar">
        <div className="field">
          <label htmlFor="search">Search by name</label>
          <input
            id="search"
            type="text"
            placeholder="e.g. Sri Lanka"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="region">Region</label>
          <select id="region" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name (A–Z)</option>
            <option value="population">Population (high to low)</option>
            <option value="area">Area (large to small)</option>
          </select>
        </div>

        <div className="field">
          <span className="label">View</span>
          <div className="toggle-group">
            <button
              className={view === "grid" ? "btn small active" : "btn small"}
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
            >
              Grid
            </button>
            <button
              className={view === "list" ? "btn small active" : "btn small"}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <p className="result-count">{sorted.length} countries found</p>

      {sorted.length === 0 ? (
        <div className="center-box">
          <p>No countries match your search. Try a different name or region.</p>
          <button className="btn" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className={view === "grid" ? "cards-grid" : "cards-list"}>
          {sorted.map((c) => (
            <CountryCard key={c.cca3} country={c} view={view} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Explore;

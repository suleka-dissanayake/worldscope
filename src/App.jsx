import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Loader from "./components/Loader.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Explore from "./pages/Explore.jsx";
import CountryDetails from "./pages/CountryDetails.jsx";
import Compare from "./pages/Compare.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";
import { fetchAllCountries } from "./services/countryApi.js";

const DEFAULT_SETTINGS = {
  name: "",
  region: "",
  country: "",
  sort: "name",
};

// read saved settings from localStorage (runs once, when the app starts)
function loadSettings() {
  try {
    const saved = localStorage.getItem("worldscope-settings");
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch (e) {
    console.log("Could not read settings", e);
  }
  return DEFAULT_SETTINGS;
}

function App() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(loadSettings);
  const [theme, setTheme] = useState(localStorage.getItem("worldscope-theme") || "light");

  // load the country list once for the whole app
  async function loadCountries() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllCountries();
      setCountries(data);
    } catch (err) {
      setError("Could not load countries. Check your internet connection and try again. (" + err.message + ")");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCountries();
  }, []);

  // apply the theme to the <html> tag and remember it
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("worldscope-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  function saveSettings(newSettings) {
    setSettings(newSettings);
    localStorage.setItem("worldscope-settings", JSON.stringify(newSettings));
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("worldscope-settings");
  }

  // pages that need the country list wait for it here
  function withData(page) {
    if (loading) return <Loader text="Loading countries..." />;
    if (error) return <ErrorMessage message={error} onRetry={loadCountries} />;
    return page;
  }

  return (
    <div className="app">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main className="container">
        <Routes>
          <Route path="/" element={withData(<Dashboard countries={countries} settings={settings} />)} />
          <Route path="/explore" element={withData(<Explore countries={countries} settings={settings} />)} />
          <Route path="/country/:code" element={withData(<CountryDetails countries={countries} />)} />
          <Route path="/compare" element={withData(<Compare countries={countries} />)} />
          <Route
            path="/settings"
            element={withData(
              <Settings
                countries={countries}
                settings={settings}
                onSave={saveSettings}
                onReset={resetSettings}
              />
            )}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        WorldScope · Data from REST Countries and the World Bank
      </footer>
    </div>
  );
}

export default App;

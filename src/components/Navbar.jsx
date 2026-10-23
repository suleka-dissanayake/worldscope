import { useState } from "react";
import { NavLink } from "react-router-dom";

function Navbar({ theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/explore", label: "Explore" },
    { to: "/compare", label: "Compare" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
          WorldScope
        </NavLink>

        <button
          className="menu-button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <button className="btn small" onClick={onToggleTheme}>
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

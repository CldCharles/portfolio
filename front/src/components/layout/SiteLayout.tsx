import { Menu } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

export function SiteLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="topbar">
        <NavLink className="brand" to="/">
          <span className="brand-mark">C</span>
          <span>Charles</span>
        </NavLink>

        <button
          aria-label="Ouvrir la navigation"
          className="menu-toggle"
          onClick={() => setMobileMenuOpen((current) => !current)}
          type="button"
        >
          <Menu size={18} />
        </button>

        <nav className={mobileMenuOpen ? "main-nav open" : "main-nav"}>
          <NavLink
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            end
            onClick={() => setMobileMenuOpen(false)}
            to="/"
          >
            Accueil
          </NavLink>
          <a className="nav-link" href="/#about" onClick={() => setMobileMenuOpen(false)}>
            A propos
          </a>
          <a className="nav-link" href="/#projects" onClick={() => setMobileMenuOpen(false)}>
            Projets
          </a>
          <NavLink
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            onClick={() => setMobileMenuOpen(false)}
            to="/cv-studio"
          >
            CV Studio
          </NavLink>
          <a className="nav-link" href="/#contact" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </a>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location]);

  const navClass = [
    'navbar',
    isHome && !scrolled ? 'navbar--transparent' : 'navbar--solid',
    scrolled ? 'navbar--scrolled' : '',
  ].filter(Boolean).join(' ');

  return (
    <header className={navClass}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">⌂</span>
          <span className="navbar__logo-text">Summer House</span>
        </Link>

        <nav className="navbar__links">
          <Link to="/cottages" className="navbar__link">Cottages</Link>
          <Link to="/map" className="navbar__link">Map</Link>
          <Link to="/cottages" className="btn btn--outline btn--sm navbar__cta">
            Book Now
          </Link>
        </nav>

        <button
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        <Link to="/cottages" className="navbar__mobile-link">Cottages</Link>
        <Link to="/map" className="navbar__mobile-link">Map</Link>
        <Link to="/cottages" className="navbar__mobile-link navbar__mobile-cta">Book Now</Link>
      </div>
    </header>
  );
}

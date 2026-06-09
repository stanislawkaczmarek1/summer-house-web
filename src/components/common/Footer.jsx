import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">

          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-icon">⌂</span>
              <span>Summer House</span>
            </Link>
            <p className="footer__tagline">
              Escape to nature. Find your perfect retreat among our handpicked cottages.
            </p>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Explore</h4>
            <ul className="footer__list">
              <li><Link to="/cottages" className="footer__link">All Cottages</Link></li>
              <li><Link to="/map" className="footer__link">Map View</Link></li>
              <li><Link to="/cottages" className="footer__link">Book Now</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Info</h4>
            <ul className="footer__list">
              <li><span className="footer__link">About Us</span></li>
              <li><span className="footer__link">Contact</span></li>
              <li><Link to="/admin/login" className="footer__link">Admin</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Contact</h4>
            <ul className="footer__list">
              <li className="footer__contact-item">
                <span className="footer__contact-icon">✉</span>
                <span>hello@summerhouse.com</span>
              </li>
              <li className="footer__contact-item">
                <span className="footer__contact-icon">✆</span>
                <span>+48 123 456 789</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="footer__bottom">
          <p className="footer__copy">© {year} Summer House. All rights reserved.</p>
          <div className="footer__legal">
            <span className="footer__link">Privacy Policy</span>
            <span className="footer__link">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

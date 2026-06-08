import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import './HomePage.css';

const FEATURES = [
  {
    icon: '⌂',
    title: 'Handpicked Cottages',
    desc: 'Every property is carefully selected for quality, comfort, and character.',
  },
  {
    icon: '◎',
    title: 'Prime Locations',
    desc: 'Discover retreats nestled in forests, by lakes, and in the mountains.',
  },
  {
    icon: '◷',
    title: 'Instant Booking',
    desc: 'Check real-time availability and confirm your stay in minutes.',
  },
  {
    icon: '✦',
    title: 'Unforgettable Stays',
    desc: 'Unique amenities and thoughtful details that make each visit special.',
  },
];

const STATS = [
  { value: '120+', label: 'Cottages' },
  { value: '4.9', label: 'Avg. Rating' },
  { value: '3k+', label: 'Happy Guests' },
  { value: '5', label: 'Years of Trust' },
];

export default function HomePage() {
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const onScroll = () => {
      const y = window.scrollY;
      el.style.setProperty('--parallax-y', `${y * 0.35}px`);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="home">
      <Navbar />

      <section className="hero" ref={heroRef}>
        <div className="hero__bg" />
        <div className="hero__overlay" />

        <div className="hero__content container">
          <div className="hero__text">
            <div className="hero__eyebrow animate-fade-in-up">
              <span className="hero__eyebrow-line" />
              <span>Premium Cottage Rentals</span>
              <span className="hero__eyebrow-line" />
            </div>

            <h1 className="hero__title animate-fade-in-up delay-100">
              Your Perfect<br />
              <em>Summer Escape</em><br />
              Awaits
            </h1>

            <p className="hero__subtitle animate-fade-in-up delay-200">
              Discover handpicked cottages in breathtaking locations.<br />
              Book your retreat and create memories that last forever.
            </p>

            <div className="hero__actions animate-fade-in-up delay-300">
              <Link to="/cottages" className="btn btn--accent btn--lg">
                Browse Cottages
              </Link>
              <Link to="/cottages" className="btn btn--light btn--lg">
                View on Map
              </Link>
            </div>
          </div>

          <div className="hero__visual animate-fade-in delay-200">
            <div className="hero__visual-frame">
              <span className="hero__visual-corner hero__visual-corner--tl" />
              <span className="hero__visual-corner hero__visual-corner--tr" />
              <span className="hero__visual-corner hero__visual-corner--bl" />
              <span className="hero__visual-corner hero__visual-corner--br" />

              <span className="hero__visual-line hero__visual-line--top" />
              <span className="hero__visual-line hero__visual-line--bottom" />

              <div className="hero__visual-circle-wrap">
                <div className="hero__visual-circle" />
                <div className="hero__visual-dot" />
              </div>


              <div className="hero__visual-icon">🏡</div>

              <div className="hero__visual-stat hero__visual-stat--tl">
                <span className="hero__visual-stat-value">4.9★</span>
                <span className="hero__visual-stat-label">Avg. rating</span>
              </div>
              <div className="hero__visual-stat hero__visual-stat--br">
                <span className="hero__visual-stat-value">120+</span>
                <span className="hero__visual-stat-label">Properties</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero__scroll animate-fade-in delay-500">
          <span className="hero__scroll-text">Scroll</span>
          <div className="hero__scroll-line" />
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          <div className="stats-bar__grid">
            {STATS.map(({ value, label }) => (
              <div key={label} className="stats-bar__item">
                <span className="stats-bar__value">{value}</span>
                <span className="stats-bar__label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section features">
        <div className="container">
          <div className="section-header section-header--center">
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">The Summer House<br />Experience</h2>
            <div className="divider divider--center" />
            <p className="section-subtitle">
              We believe that a great holiday begins with the perfect place to stay.
              Every cottage in our collection meets our high standards.
            </p>
          </div>

          <div className="features__grid">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <div
                key={title}
                className={`feature-card animate-fade-in-up delay-${(i + 1) * 100}`}
              >
                <div className="feature-card__icon">{icon}</div>
                <h3 className="feature-card__title">{title}</h3>
                <p className="feature-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--lg editorial">
        <div className="container">
          <div className="editorial__inner">
            <div className="editorial__text">
              <span className="section-label">Our Collection</span>
              <h2 className="section-title">
                Curated Retreats<br />for Every Taste
              </h2>
              <div className="divider" />
              <p className="editorial__body">
                From rustic lakeside cabins to modern forest lodges — our collection
                spans a wide range of styles, capacities, and locations. Each property
                is unique, fully equipped, and ready for an unforgettable stay.
              </p>
              <ul className="editorial__list">
                <li><span className="editorial__check">✓</span> Detailed descriptions & photo galleries</li>
                <li><span className="editorial__check">✓</span> Real-time availability calendar</li>
                <li><span className="editorial__check">✓</span> Transparent pricing, no hidden fees</li>
                <li><span className="editorial__check">✓</span> Interactive map with precise location</li>
              </ul>
              <Link to="/cottages" className="btn btn--primary btn--lg editorial__btn">
                Explore All Cottages
              </Link>
            </div>

            <div className="editorial__visual">
              <div className="editorial__img-grid">
                <div className="editorial__img editorial__img--1">
                  <div className="editorial__img-placeholder">
                    <span>🌲</span>
                  </div>
                </div>
                <div className="editorial__img editorial__img--2">
                  <div className="editorial__img-placeholder">
                    <span>🏡</span>
                  </div>
                </div>
                <div className="editorial__img editorial__img--3">
                  <div className="editorial__img-placeholder">
                    <span>🌊</span>
                  </div>
                </div>
              </div>
              <div className="editorial__badge">
                <span className="editorial__badge-number">120+</span>
                <span className="editorial__badge-text">properties<br />available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="map-teaser">
        <div className="map-teaser__bg" />
        <div className="map-teaser__overlay" />
        <div className="container map-teaser__content">
          <span className="section-label">Interactive Map</span>
          <h2 className="section-title map-teaser__title">
            Find Your Retreat<br />on the Map
          </h2>
          <p className="map-teaser__subtitle">
            Browse all available cottages on an interactive map.<br />
            Filter by location, capacity, or price range.
          </p>
          <Link to="/cottages" className="btn btn--accent btn--lg">
            Open Map View
          </Link>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-card__decor" />
            <div className="cta-card__content">
              <span className="section-label">Ready to Escape?</span>
              <h2 className="cta-card__title">
                Start Planning<br />Your Dream Holiday
              </h2>
              <p className="cta-card__subtitle">
                Check availability, choose your cottage, and book in just a few clicks.
                No account required.
              </p>
              <div className="cta-card__actions">
                <Link to="/cottages" className="btn btn--accent btn--lg">
                  Browse Cottages
                </Link>
                <Link to="/cottages" className="btn btn--outline btn--lg">
                  Check Availability
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

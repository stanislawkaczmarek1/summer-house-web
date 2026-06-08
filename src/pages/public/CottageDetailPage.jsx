import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import CottageGallery from '../../components/cottages/CottageGallery';
import CottageMap from '../../components/map/CottageMap';
import { cottagesApi } from '../../api/cottages';
import './CottageDetailPage.css';

const AMENITY_ICONS = {
  'WiFi': '⌘',
  'Parking': '⊡',
  'Kitchen': '⊕',
  'Fireplace': '◈',
  'Pool': '◎',
  'Pet-friendly': '◉',
  'BBQ': '◆',
  'Sauna': '◇',
};

export default function CottageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cottage, setCottage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [available, setAvailable] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await cottagesApi.getById(id);
        setCottage(res.data);
      } catch {
        setError('Cottage not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const checkAvailability = async () => {
    if (!checkIn || !checkOut) return;
    try {
      setChecking(true);
      setAvailable(null);
      const res = await cottagesApi.getAvailability(id, {
        start_date: checkIn,
        end_date: checkOut,
      });
      setAvailable(res.data.available);
    } catch {
      setAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  const handleBookNow = () => {
    const params = new URLSearchParams({ checkIn, checkOut, guests });
    navigate(`/cottages/${id}/reserve?${params}`);
  };

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    ))
    : 0;

  const totalPrice = cottage
    ? (nights * parseFloat(cottage.price_per_night)).toFixed(2)
    : 0;

  if (loading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div className="container detail-skeleton">
          <div className="skeleton" style={{ height: 480, borderRadius: 16 }} />
          <div className="detail-skeleton__body">
            <div className="skeleton" style={{ height: 14, width: '30%' }} />
            <div className="skeleton" style={{ height: 36, width: '60%' }} />
            <div className="skeleton" style={{ height: 14, width: '45%' }} />
            <div className="skeleton" style={{ height: 80, width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !cottage) {
    return (
      <div className="detail-page">
        <Navbar />
        <div className="container detail-error">
          <span>⚠</span>
          <h2>{error || 'Cottage not found'}</h2>
          <Link to="/cottages" className="btn btn--outline">← Back to Cottages</Link>
        </div>
      </div>
    );
  }

  const {
    name, description, capacity, price_per_night,
    address, latitude, longitude,
    cottage_images = [],
    amenities = [],
  } = cottage;

  return (
    <div className="detail-page">
      <Navbar />

      <main className="detail-main">
        <div className="container">

          <nav className="detail-breadcrumb animate-fade-in">
            <Link to="/" className="detail-breadcrumb__link">Home</Link>
            <span className="detail-breadcrumb__sep">›</span>
            <Link to="/cottages" className="detail-breadcrumb__link">Cottages</Link>
            <span className="detail-breadcrumb__sep">›</span>
            <span className="detail-breadcrumb__current">{name}</span>
          </nav>

          <div className="detail-gallery animate-fade-in-up">
            <CottageGallery images={cottage_images} />
          </div>

          <div className="detail-grid">

            <div className="detail-content animate-fade-in-up delay-100">

              <div className="detail-header">
                <div className="detail-header__meta">
                  <span className="detail-header__capacity">◎ Up to {capacity} guests</span>
                  {address && <span className="detail-header__address">⊹ {address}</span>}
                </div>
                <h1 className="detail-header__title">{name}</h1>
                <div className="detail-header__price">
                  <span className="detail-header__price-amount">
                    ${parseFloat(price_per_night).toFixed(0)}
                  </span>
                  <span className="detail-header__price-unit"> / night</span>
                </div>
              </div>

              <div className="detail-divider" />

              {description && (
                <section className="detail-section">
                  <h2 className="detail-section__title">About this cottage</h2>
                  <p className="detail-section__body">{description}</p>
                </section>
              )}

              {amenities.length > 0 && (
                <section className="detail-section">
                  <h2 className="detail-section__title">Amenities</h2>
                  <div className="detail-amenities">
                    {amenities.map(a => (
                      <div key={a.id} className="detail-amenity">
                        <span className="detail-amenity__icon">{AMENITY_ICONS[a.name] ?? '·'}</span>
                        <span className="detail-amenity__name">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="detail-section">
                <h2 className="detail-section__title">Location</h2>
                {address && <p className="detail-section__address">⊹ {address}</p>}
                <CottageMap lat={latitude} lng={longitude} name={name} address={address} />
              </section>

            </div>

            <aside className="detail-sidebar animate-fade-in-up delay-200">
              <div className="booking-card">
                <div className="booking-card__header">
                  <div>
                    <span className="booking-card__price">
                      ${parseFloat(price_per_night).toFixed(0)}
                    </span>
                    <span className="booking-card__per-night"> / night</span>
                  </div>
                  <span className="booking-card__capacity">◎ Max {capacity} guests</span>
                </div>

                <div className="booking-card__body">
                  <div className="booking-card__dates">
                    <div className="booking-card__date-group">
                      <label className="form-label">Check-in</label>
                      <input
                        type="date"
                        className="form-input"
                        value={checkIn}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => {
                          setCheckIn(e.target.value);
                          setAvailable(null);
                          if (checkOut && e.target.value >= checkOut) setCheckOut('');
                        }}
                      />
                    </div>
                    <div className="booking-card__date-group">
                      <label className="form-label">Check-out</label>
                      <input
                        type="date"
                        className="form-input"
                        value={checkOut}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        onChange={e => {
                          setCheckOut(e.target.value);
                          setAvailable(null);
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Guests</label>
                    <select
                      className="form-input"
                      value={guests}
                      onChange={e => setGuests(Number(e.target.value))}
                    >
                      {Array.from({ length: capacity }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  {nights > 0 && (
                    <div className="booking-card__breakdown">
                      <div className="booking-card__breakdown-row">
                        <span>${parseFloat(price_per_night).toFixed(0)} × {nights} night{nights > 1 ? 's' : ''}</span>
                        <span>${totalPrice}</span>
                      </div>
                      <div className="booking-card__breakdown-total">
                        <span>Total</span>
                        <span>${totalPrice}</span>
                      </div>
                    </div>
                  )}

                  {available === true && (
                    <div className="booking-card__avail booking-card__avail--yes">
                      ✓ Available for selected dates
                    </div>
                  )}
                  {available === false && (
                    <div className="booking-card__avail booking-card__avail--no">
                      ✕ Not available for selected dates
                    </div>
                  )}

                  {available !== true ? (
                    <button
                      className="btn btn--primary btn--full"
                      onClick={checkAvailability}
                      disabled={!checkIn || !checkOut || checking}
                    >
                      {checking
                        ? <><span className="spinner spinner--sm spinner--light" /> Checking…</>
                        : 'Check Availability'
                      }
                    </button>
                  ) : (
                    <button className="btn btn--accent btn--full" onClick={handleBookNow}>
                      Book Now
                    </button>
                  )}

                  <p className="booking-card__note">
                    No account required · Free cancellation policy
                  </p>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

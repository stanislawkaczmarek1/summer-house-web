import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { cottagesApi } from '../../api/cottages';
import { reservationsApi } from '../../api/reservations';
import './ReservationPage.css';

const INITIAL_FORM = { first_name: '', last_name: '', email: '', phone: '' };

function validate(form, guests, checkIn, checkOut) {
  const errors = {};
  if (!form.first_name.trim()) errors.first_name = 'First name is required.';
  if (!form.last_name.trim()) errors.last_name = 'Last name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email.';
  if (!form.phone.trim()) errors.phone = 'Phone number is required.';
  if (!checkIn) errors.checkIn = 'Check-in date is required.';
  if (!checkOut) errors.checkOut = 'Check-out date is required.';
  if (guests < 1) errors.guests = 'At least 1 guest required.';
  return errors;
}

export default function ReservationPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [cottage, setCottage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1);

  useEffect(() => {
    cottagesApi.getById(id)
      .then(r => setCottage(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [id]);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 0;

  const totalPrice = cottage
    ? (nights * parseFloat(cottage.pricePerNight)).toFixed(2)
    : '0.00';

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...form, [name]: value }, guests, checkIn, checkOut);
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(form, guests, checkIn, checkOut)[name] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setServerError('');
    const allTouched = Object.keys(INITIAL_FORM).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched({ ...allTouched, checkIn: true, checkOut: true, guests: true });
    const errs = validate(form, guests, checkIn, checkOut);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setSubmitting(true);
      await reservationsApi.create({
        cottageId: Number(id),
        startDate: checkIn,
        endDate: checkOut,
        guestsCount: guests,
        totalPrice: parseFloat(totalPrice),
        client: {
          firstName: form.first_name.trim(),
          lastName: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="reservation-page">
        <Navbar />
        <div className="reservation-success">
          <div className="reservation-success__card animate-scale-in">
            <div className="reservation-success__icon">✓</div>
            <h1 className="reservation-success__title">Booking Confirmed!</h1>
            <p className="reservation-success__subtitle">
              Thank you, <strong>{form.first_name}</strong>. Confirmation sent to <strong>{form.email}</strong>.
            </p>
            {cottage && (
              <div className="reservation-success__summary">
                <div className="reservation-success__row"><span>Cottage</span><span>{cottage.name}</span></div>
                <div className="reservation-success__row"><span>Check-in</span><span>{new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                <div className="reservation-success__row"><span>Check-out</span><span>{new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                <div className="reservation-success__row"><span>Guests</span><span>{guests}</span></div>
                <div className="reservation-success__row reservation-success__row--total"><span>Total</span><span>${totalPrice}</span></div>
              </div>
            )}
            <div className="reservation-success__actions">
              <Link to="/cottages" className="btn btn--primary btn--lg">Browse More Cottages</Link>
              <Link to="/" className="btn btn--ghost btn--lg">Back to Home</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reservation-page">
        <Navbar />
        <div className="container reservation-loading"><span className="spinner spinner--lg" /></div>
      </div>
    );
  }

  return (
    <div className="reservation-page">
      <Navbar />
      <main className="reservation-main">
        <div className="container">

          <nav className="detail-breadcrumb animate-fade-in">
            <Link to="/" className="detail-breadcrumb__link">Home</Link>
            <span className="detail-breadcrumb__sep">›</span>
            <Link to="/cottages" className="detail-breadcrumb__link">Cottages</Link>
            <span className="detail-breadcrumb__sep">›</span>
            {cottage && <><Link to={`/cottages/${id}`} className="detail-breadcrumb__link">{cottage.name}</Link><span className="detail-breadcrumb__sep">›</span></>}
            <span className="detail-breadcrumb__current">Book</span>
          </nav>

          <div className="reservation-grid">
            <div className="reservation-form-wrap animate-fade-in-up">
              <div className="reservation-form-header">
                <span className="section-label">Step 1 of 1</span>
                <h1 className="reservation-form-header__title">Complete Your Booking</h1>
                <p className="reservation-form-header__sub">No account required. Fill in your details below to confirm.</p>
              </div>

              <form className="reservation-form" onSubmit={handleSubmit} noValidate>
                {serverError && <div className="reservation-form__server-error">⚠ {serverError}</div>}

                <fieldset className="reservation-fieldset">
                  <legend className="reservation-fieldset__legend">Your Details</legend>
                  <div className="reservation-form__row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input name="first_name" type="text" className={`form-input ${errors.first_name && touched.first_name ? 'form-input--error' : ''}`} placeholder="Jane" value={form.first_name} onChange={handleChange} onBlur={handleBlur} autoComplete="given-name" />
                      {errors.first_name && touched.first_name && <span className="form-error">{errors.first_name}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input name="last_name" type="text" className={`form-input ${errors.last_name && touched.last_name ? 'form-input--error' : ''}`} placeholder="Smith" value={form.last_name} onChange={handleChange} onBlur={handleBlur} autoComplete="family-name" />
                      {errors.last_name && touched.last_name && <span className="form-error">{errors.last_name}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input name="email" type="email" className={`form-input ${errors.email && touched.email ? 'form-input--error' : ''}`} placeholder="jane@example.com" value={form.email} onChange={handleChange} onBlur={handleBlur} autoComplete="email" />
                    {errors.email && touched.email && <span className="form-error">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input name="phone" type="tel" className={`form-input ${errors.phone && touched.phone ? 'form-input--error' : ''}`} placeholder="+48 123 456 789" value={form.phone} onChange={handleChange} onBlur={handleBlur} autoComplete="tel" />
                    {errors.phone && touched.phone && <span className="form-error">{errors.phone}</span>}
                  </div>
                </fieldset>

                <fieldset className="reservation-fieldset">
                  <legend className="reservation-fieldset__legend">Stay Details</legend>
                  <div className="reservation-form__row">
                    <div className="form-group">
                      <label className="form-label">Check-in</label>
                      <input type="date" className={`form-input ${errors.checkIn && touched.checkIn ? 'form-input--error' : ''}`} value={checkIn} min={new Date().toISOString().split('T')[0]} onChange={e => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(''); }} onBlur={() => setTouched(t => ({ ...t, checkIn: true }))} />
                      {errors.checkIn && touched.checkIn && <span className="form-error">{errors.checkIn}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Check-out</label>
                      <input type="date" className={`form-input ${errors.checkOut && touched.checkOut ? 'form-input--error' : ''}`} value={checkOut} min={checkIn || new Date().toISOString().split('T')[0]} onChange={e => setCheckOut(e.target.value)} onBlur={() => setTouched(t => ({ ...t, checkOut: true }))} />
                      {errors.checkOut && touched.checkOut && <span className="form-error">{errors.checkOut}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Guests</label>
                    <select className="form-input" value={guests} onChange={e => setGuests(Number(e.target.value))}>
                      {Array.from({ length: cottage?.capacity || 10 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </fieldset>

                <button type="submit" className="btn btn--accent btn--lg btn--full" disabled={submitting}>
                  {submitting ? <><span className="spinner spinner--sm" /> Processing…</> : `Confirm Booking · $${totalPrice}`}
                </button>
                <p className="reservation-form__disclaimer">By confirming, you agree to our booking policy.</p>
              </form>
            </div>

            <aside className="reservation-summary animate-fade-in-up delay-200">
              <div className="summary-card">
                <h2 className="summary-card__title">Booking Summary</h2>
                {cottage && (
                  <>
                    <div className="summary-card__cottage">
                      <div className="summary-card__cottage-img">
                        {/* Backend: images[0].imageUrl */}
                        {cottage.images?.[0]?.imageUrl
                          ? <img src={cottage.images[0].imageUrl} alt={cottage.name} />
                          : <span>⌂</span>
                        }
                      </div>
                      <div className="summary-card__cottage-info">
                        <h3>{cottage.name}</h3>
                        {cottage.address && <p>⊹ {cottage.address}</p>}
                      </div>
                    </div>
                    <div className="summary-card__divider" />
                    <div className="summary-card__rows">
                      <div className="summary-card__row"><span className="summary-card__label">Check-in</span><span className="summary-card__value">{checkIn ? new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span></div>
                      <div className="summary-card__row"><span className="summary-card__label">Check-out</span><span className="summary-card__value">{checkOut ? new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span></div>
                      <div className="summary-card__row"><span className="summary-card__label">Guests</span><span className="summary-card__value">{guests}</span></div>
                      <div className="summary-card__row"><span className="summary-card__label">Duration</span><span className="summary-card__value">{nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : '—'}</span></div>
                    </div>
                    <div className="summary-card__divider" />
                    <div className="summary-card__rows">
                      <div className="summary-card__row">
                        <span className="summary-card__label">${parseFloat(cottage.pricePerNight).toFixed(0)} × {nights} night{nights !== 1 ? 's' : ''}</span>
                        <span className="summary-card__value">${totalPrice}</span>
                      </div>
                    </div>
                    <div className="summary-card__total"><span>Total</span><span>${totalPrice}</span></div>
                  </>
                )}
                <div className="summary-card__trust">
                  <div className="summary-card__trust-item"><span>✓</span> No hidden fees</div>
                  <div className="summary-card__trust-item"><span>✓</span> Free cancellation</div>
                  <div className="summary-card__trust-item"><span>✓</span> Instant confirmation</div>
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

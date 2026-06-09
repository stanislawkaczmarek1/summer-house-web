import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import CottageCard from '../../components/cottages/CottageCard';
import { cottagesApi } from '../../api/cottages';
import { amenitiesApi } from '../../api/amenities';
import './CottagesPage.css';

const SORT_OPTIONS = [
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'capacity',   label: 'Most Guests' },
  { value: 'newest',     label: 'Newest First' },
];

const CAPACITY_OPTIONS = [1, 2, 4, 6, 8, 10];

export default function CottagesPage() {
  const [cottages,          setCottages]          = useState([]);
  const [amenities,         setAmenities]         = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  const [search,            setSearch]            = useState('');
  const [minPrice,          setMinPrice]          = useState('');
  const [maxPrice,          setMaxPrice]          = useState('');
  const [minCapacity,       setMinCapacity]       = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy,            setSortBy]            = useState('newest');
  const [filtersOpen,       setFiltersOpen]       = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cRes, aRes] = await Promise.all([
          cottagesApi.getAll(),
          amenitiesApi.getAll(),
        ]);
        setCottages(cRes.data);
        setAmenities(aRes.data);
      } catch {
        setError('Failed to load cottages. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleAmenity = useCallback((id) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  }, []);

  const clearFilters = () => {
    setSearch(''); setMinPrice(''); setMaxPrice('');
    setMinCapacity(''); setSelectedAmenities([]); setSortBy('newest');
  };

  const filtered = cottages
    .filter(c => c.visible !== false)
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    })
    .filter(c => !minPrice || c.pricePerNight >= Number(minPrice))
    .filter(c => !maxPrice || c.pricePerNight <= Number(maxPrice))
    .filter(c => !minCapacity || c.capacity >= Number(minCapacity))
    .filter(c => {
      if (!selectedAmenities.length) return true;
      const ids = (c.amenities ?? []).map(a => a.id);
      return selectedAmenities.every(id => ids.includes(id));
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':  return a.pricePerNight - b.pricePerNight;
        case 'price_desc': return b.pricePerNight - a.pricePerNight;
        case 'capacity':   return b.capacity - a.capacity;
        default:           return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const hasActiveFilters = search || minPrice || maxPrice || minCapacity || selectedAmenities.length;

  return (
    <div className="cottages-page">
      <Navbar />

      <section className="cottages-hero">
        <div className="cottages-hero__overlay" />
        <div className="container cottages-hero__content">
          <span className="section-label">Our Collection</span>
          <h1 className="cottages-hero__title">Find Your Perfect Cottage</h1>
          <p className="cottages-hero__subtitle">Browse our handpicked selection of holiday retreats</p>
        </div>
      </section>

      <div className="cottages-searchbar">
        <div className="container">
          <div className="cottages-searchbar__inner">
            <div className="cottages-searchbar__input-wrap">
              <span className="cottages-searchbar__icon">⊹</span>
              <input
                type="text"
                className="cottages-searchbar__input"
                placeholder="Search by name or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="cottages-searchbar__clear" onClick={() => setSearch('')}>×</button>
              )}
            </div>
            <select
              className="cottages-searchbar__sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              className={`cottages-searchbar__filter-btn btn btn--outline btn--sm ${filtersOpen ? 'active' : ''}`}
              onClick={() => setFiltersOpen(o => !o)}
            >
              ⊞ Filters
              {hasActiveFilters ? <span className="cottages-searchbar__filter-dot" /> : null}
            </button>
          </div>
        </div>
      </div>

      <div className={`filters-panel ${filtersOpen ? 'filters-panel--open' : ''}`}>
        <div className="container">
          <div className="filters-panel__grid">
            <div className="filters-panel__group">
              <label className="filters-panel__label">Price per night</label>
              <div className="filters-panel__row">
                <input type="number" className="form-input filters-panel__input" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} min={0} />
                <span className="filters-panel__sep">—</span>
                <input type="number" className="form-input filters-panel__input" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min={0} />
              </div>
            </div>
            <div className="filters-panel__group">
              <label className="filters-panel__label">Minimum guests</label>
              <div className="filters-panel__chips">
                {CAPACITY_OPTIONS.map(n => (
                  <button
                    key={n}
                    className={`filters-panel__chip ${minCapacity == n ? 'filters-panel__chip--active' : ''}`}
                    onClick={() => setMinCapacity(prev => prev == n ? '' : n)}
                  >
                    {n}+
                  </button>
                ))}
              </div>
            </div>
            {amenities.length > 0 && (
              <div className="filters-panel__group filters-panel__group--wide">
                <label className="filters-panel__label">Amenities</label>
                <div className="filters-panel__chips">
                  {amenities.map(a => (
                    <button
                      key={a.id}
                      className={`filters-panel__chip ${selectedAmenities.includes(a.id) ? 'filters-panel__chip--active' : ''}`}
                      onClick={() => toggleAmenity(a.id)}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <button className="filters-panel__clear btn btn--ghost btn--sm" onClick={clearFilters}>
              ✕ Clear all filters
            </button>
          )}
        </div>
      </div>

      <main className="section section--sm cottages-main">
        <div className="container">
          {!loading && !error && (
            <div className="cottages-main__header">
              <p className="cottages-main__count">
                {filtered.length === 0 ? 'No cottages found' : `${filtered.length} cottage${filtered.length === 1 ? '' : 's'} found`}
              </p>
            </div>
          )}

          {loading && (
            <div className="cottages-skeleton">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="cottage-skeleton-card">
                  <div className="skeleton cottage-skeleton-card__img" />
                  <div className="cottage-skeleton-card__body">
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    <div className="skeleton" style={{ height: 20, width: '70%' }} />
                    <div className="skeleton" style={{ height: 12, width: '55%' }} />
                    <div className="skeleton" style={{ height: 12, width: '90%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="cottages-main__state cottages-main__error">
              <span className="cottages-main__error-icon">⚠</span>
              <p>{error}</p>
              <button className="btn btn--outline btn--sm" onClick={() => window.location.reload()}>Try Again</button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="cottages-main__state cottages-main__empty">
              <span className="cottages-main__empty-icon">⌂</span>
              <h3>No cottages match your filters</h3>
              <p>Try adjusting your search criteria</p>
              {hasActiveFilters && <button className="btn btn--outline btn--sm" onClick={clearFilters}>Clear Filters</button>}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="cottages-grid">
              {filtered.map((cottage, i) => (
                <div key={cottage.id} className={`animate-fade-in-up delay-${Math.min((i % 6 + 1) * 100, 600)}`}>
                  <CottageCard cottage={cottage} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

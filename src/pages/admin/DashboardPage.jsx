import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { cottagesApi } from '../../api/cottages';
import { reservationsApi } from '../../api/reservations';
import './DashboardPage.css';

const STATUS_BADGE = {
  confirmed: { label: 'Confirmed', cls: 'badge--success' },
  pending: { label: 'Pending', cls: 'badge--warning' },
  cancelled: { label: 'Cancelled', cls: 'badge--error' },
};

function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function DashboardPage() {
  const [cottages, setCottages] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cottagesApi.getAll(),
      reservationsApi.getAll(),
    ])
      .then(([c, r]) => {
        setCottages(c.data);
        setReservations(r.data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const totalCottages = cottages.length;
  const visibleCottages = cottages.filter(c => c.is_visible).length;
  const totalRes = reservations.length;
  const activeRes = reservations.filter(r =>
    r.status === 'confirmed' || r.status === 'pending'
  ).length;

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  return (
    <AdminLayout>
      <div className="animate-fade-in-up">

        <div className="admin-page-header">
          <div className="admin-page-header__left">
            <h1 className="admin-page-title">Dashboard</h1>
            <p className="admin-page-subtitle">Welcome back. Here's what's happening.</p>
          </div>
          <div className="dashboard-header-actions">
            <Link to="/admin/cottages/new" className="btn btn--primary btn--sm">
              + Add Cottage
            </Link>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card animate-fade-in-up delay-100">
            <span className="admin-stat-card__icon">⌂</span>
            <span className="admin-stat-card__label">Total Cottages</span>
            <span className="admin-stat-card__value">
              {loading ? '—' : totalCottages}
            </span>
            <span className="admin-stat-card__sub">{visibleCottages} visible</span>
          </div>

          <div className="admin-stat-card animate-fade-in-up delay-200">
            <span className="admin-stat-card__icon">◷</span>
            <span className="admin-stat-card__label">Total Reservations</span>
            <span className="admin-stat-card__value">
              {loading ? '—' : totalRes}
            </span>
            <span className="admin-stat-card__sub">{activeRes} active</span>
          </div>

          <div className="admin-stat-card animate-fade-in-up delay-300">
            <span className="admin-stat-card__icon">✦</span>
            <span className="admin-stat-card__label">Active Bookings</span>
            <span className="admin-stat-card__value">
              {loading ? '—' : activeRes}
            </span>
            <span className="admin-stat-card__sub">confirmed + pending</span>
          </div>

          <div className="admin-stat-card animate-fade-in-up delay-400">
            <span className="admin-stat-card__icon">◎</span>
            <span className="admin-stat-card__label">Hidden Cottages</span>
            <span className="admin-stat-card__value">
              {loading ? '—' : totalCottages - visibleCottages}
            </span>
            <span className="admin-stat-card__sub">not shown publicly</span>
          </div>
        </div>

        <div className="animate-fade-in-up delay-300">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Recent Reservations</h2>
            <Link to="/admin/reservations" className="btn btn--ghost btn--sm">
              View all →
            </Link>
          </div>

          <div className="admin-table-wrap">
            {loading ? (
              <div className="dashboard-loading">
                <span className="spinner" />
              </div>
            ) : recentReservations.length === 0 ? (
              <div className="dashboard-empty">
                <span>◷</span>
                <p>No reservations yet</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Cottage</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Guests</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map(r => {
                    const badge = STATUS_BADGE[r.status] ?? { label: r.status, cls: 'badge--neutral' };
                    const cottage = cottages.find(c => c.id === r.cottage_id);
                    return (
                      <tr key={r.id}>
                        <td className="dashboard-table__guest">
                          <span className="dashboard-table__name">
                            {r.client?.first_name} {r.client?.last_name}
                          </span>
                          <span className="dashboard-table__email">
                            {r.client?.email}
                          </span>
                        </td>
                        <td>{cottage?.name ?? `#${r.cottage_id}`}</td>
                        <td>{fmt(r.start_date)}</td>
                        <td>{fmt(r.end_date)}</td>
                        <td>{r.guests_count}</td>
                        <td className="dashboard-table__price">
                          ${parseFloat(r.total_price).toFixed(0)}
                        </td>
                        <td>
                          <span className={`badge ${badge.cls}`}>{badge.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

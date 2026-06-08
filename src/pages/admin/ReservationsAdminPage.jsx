import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { reservationsApi } from '../../api/reservations';
import { cottagesApi } from '../../api/cottages';
import './ReservationsAdminPage.css';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'cancelled'];

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

export default function ReservationsAdminPage() {
  const [reservations, setReservations] = useState([]);
  const [cottages, setCottages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [resRes, cotRes] = await Promise.all([
        reservationsApi.getAll(),
        cottagesApi.getAll(),
      ]);
      setReservations(resRes.data);
      setCottages(cotRes.data);
    } catch {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getCottageName = (id) =>
    cottages.find(c => c.id === id)?.name ?? `Cottage #${id}`;

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await reservationsApi.update(confirmCancel.id, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      });
      setReservations(prev =>
        prev.map(r => r.id === confirmCancel.id
          ? { ...r, status: 'cancelled', cancelled_at: new Date().toISOString() }
          : r
        )
      );
      setConfirmCancel(null);
      if (selected?.id === confirmCancel.id) {
        setSelected(prev => ({ ...prev, status: 'cancelled' }));
      }
    } catch {
      alert('Failed to cancel reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async (reservation) => {
    try {
      await reservationsApi.update(reservation.id, { status: 'confirmed' });
      setReservations(prev =>
        prev.map(r => r.id === reservation.id ? { ...r, status: 'confirmed' } : r)
      );
      if (selected?.id === reservation.id) {
        setSelected(prev => ({ ...prev, status: 'confirmed' }));
      }
    } catch {
      alert('Failed to confirm reservation.');
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await reservationsApi.remove(confirmDelete.id);
      setReservations(prev => prev.filter(r => r.id !== confirmDelete.id));
      setConfirmDelete(null);
      if (selected?.id === confirmDelete.id) setSelected(null);
    } catch {
      alert('Failed to delete reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = reservations
    .filter(r => statusFilter === 'all' || r.status === statusFilter)
    .filter(r => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.client?.first_name?.toLowerCase().includes(q) ||
        r.client?.last_name?.toLowerCase().includes(q) ||
        r.client?.email?.toLowerCase().includes(q) ||
        getCottageName(r.cottage_id).toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <AdminLayout>
      <div className="animate-fade-in-up">

        <div className="admin-page-header">
          <div className="admin-page-header__left">
            <h1 className="admin-page-title">Reservations</h1>
            <p className="admin-page-subtitle">
              {reservations.length} total ·{' '}
              {reservations.filter(r => r.status === 'confirmed').length} confirmed ·{' '}
              {reservations.filter(r => r.status === 'pending').length} pending
            </p>
          </div>
        </div>

        <div className="res-filters">
          <div className="res-filters__search-wrap">
            <span className="res-filters__search-icon">⊹</span>
            <input
              type="text"
              className="res-filters__search"
              placeholder="Search by guest name, email or cottage…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="res-filters__clear" onClick={() => setSearch('')}>×</button>
            )}
          </div>

          <div className="res-filters__status">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                className={`res-filters__status-btn ${statusFilter === s ? 'res-filters__status-btn--active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== 'all' && (
                  <span className="res-filters__status-count">
                    {reservations.filter(r => r.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="admin-error">⚠ {error}
            <button className="btn btn--ghost btn--sm" onClick={load}>Retry</button>
          </div>
        )}

        <div className="admin-table-wrap">
          {loading ? (
            <div className="admin-table-loading"><span className="spinner spinner--lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="admin-table-empty">
              <span>◷</span>
              <p>{search || statusFilter !== 'all' ? 'No reservations match your filters' : 'No reservations yet'}</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Cottage</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Nights</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const nights = Math.round(
                    (new Date(r.end_date) - new Date(r.start_date)) / (1000 * 60 * 60 * 24)
                  );
                  const badge = STATUS_BADGE[r.status] ?? { label: r.status, cls: 'badge--neutral' };
                  return (
                    <tr
                      key={r.id}
                      className="res-table__row"
                      onClick={() => setSelected(r)}
                    >
                      <td>
                        <div className="res-table__guest">
                          <span className="res-table__guest-name">
                            {r.client?.first_name} {r.client?.last_name}
                          </span>
                          <span className="res-table__guest-email">{r.client?.email}</span>
                        </div>
                      </td>
                      <td>{getCottageName(r.cottage_id)}</td>
                      <td>{fmt(r.start_date)}</td>
                      <td>{fmt(r.end_date)}</td>
                      <td>{nights}</td>
                      <td className="res-table__price">
                        ${parseFloat(r.total_price).toFixed(0)}
                      </td>
                      <td>
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="admin-table__actions">
                          {r.status === 'pending' && (
                            <button
                              className="btn btn--sm res-btn--confirm"
                              onClick={() => handleConfirm(r)}
                            >
                              Confirm
                            </button>
                          )}
                          {r.status !== 'cancelled' && (
                            <button
                              className="btn btn--sm admin-btn--danger"
                              onClick={() => setConfirmCancel(r)}
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            className="btn btn--sm admin-btn--danger"
                            onClick={() => setConfirmDelete(r)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <>
          <div className="overlay" onClick={() => setSelected(null)} />
          <div className="res-drawer animate-fade-in-right">
            <div className="res-drawer__header">
              <h2 className="res-drawer__title">Reservation #{selected.id}</h2>
              <button className="res-drawer__close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="res-drawer__body">
              <div className="res-drawer__section">
                <h3 className="res-drawer__section-title">Guest</h3>
                <div className="res-drawer__rows">
                  <div className="res-drawer__row">
                    <span>Name</span>
                    <span>{selected.client?.first_name} {selected.client?.last_name}</span>
                  </div>
                  <div className="res-drawer__row">
                    <span>Email</span>
                    <span>{selected.client?.email}</span>
                  </div>
                  <div className="res-drawer__row">
                    <span>Phone</span>
                    <span>{selected.client?.phone || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="res-drawer__section">
                <h3 className="res-drawer__section-title">Stay</h3>
                <div className="res-drawer__rows">
                  <div className="res-drawer__row">
                    <span>Cottage</span>
                    <span>{getCottageName(selected.cottage_id)}</span>
                  </div>
                  <div className="res-drawer__row">
                    <span>Check-in</span>
                    <span>{fmt(selected.start_date)}</span>
                  </div>
                  <div className="res-drawer__row">
                    <span>Check-out</span>
                    <span>{fmt(selected.end_date)}</span>
                  </div>
                  <div className="res-drawer__row">
                    <span>Guests</span>
                    <span>{selected.guests_count}</span>
                  </div>
                  <div className="res-drawer__row">
                    <span>Total price</span>
                    <span className="res-drawer__price">
                      ${parseFloat(selected.total_price).toFixed(2)}
                    </span>
                  </div>
                  <div className="res-drawer__row">
                    <span>Status</span>
                    <span className={`badge ${STATUS_BADGE[selected.status]?.cls ?? 'badge--neutral'}`}>
                      {STATUS_BADGE[selected.status]?.label ?? selected.status}
                    </span>
                  </div>
                  <div className="res-drawer__row">
                    <span>Created</span>
                    <span>{fmt(selected.created_at)}</span>
                  </div>
                  {selected.cancelled_at && (
                    <div className="res-drawer__row">
                      <span>Cancelled</span>
                      <span>{fmt(selected.cancelled_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="res-drawer__footer">
              {selected.status === 'pending' && (
                <button
                  className="btn btn--primary btn--full res-btn--confirm"
                  onClick={() => { handleConfirm(selected); setSelected(null); }}
                >
                  ✓ Confirm Reservation
                </button>
              )}
              {selected.status !== 'cancelled' && (
                <button
                  className="btn admin-btn--danger btn--full"
                  onClick={() => { setConfirmCancel(selected); setSelected(null); }}
                >
                  Cancel Reservation
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {confirmCancel && (
        <>
          <div className="overlay" onClick={() => setConfirmCancel(null)} />
          <div className="admin-modal animate-scale-in">
            <h2 className="admin-modal__title">Cancel Reservation</h2>
            <p className="admin-modal__body">
              Cancel the reservation for{' '}
              <strong>{confirmCancel.client?.first_name} {confirmCancel.client?.last_name}</strong>?
              The reservation will be marked as cancelled.
            </p>
            <div className="admin-modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirmCancel(null)} disabled={actionLoading}>
                Back
              </button>
              <button className="btn admin-btn--danger" onClick={handleCancel} disabled={actionLoading}>
                {actionLoading ? <><span className="spinner spinner--sm" /> Cancelling…</> : 'Cancel Reservation'}
              </button>
            </div>
          </div>
        </>
      )}

      {confirmDelete && (
        <>
          <div className="overlay" onClick={() => setConfirmDelete(null)} />
          <div className="admin-modal animate-scale-in">
            <h2 className="admin-modal__title">Delete Reservation</h2>
            <p className="admin-modal__body">
              Permanently delete reservation #{confirmDelete.id}?
              This action cannot be undone.
            </p>
            <div className="admin-modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)} disabled={actionLoading}>
                Back
              </button>
              <button className="btn admin-btn--danger" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? <><span className="spinner spinner--sm" /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

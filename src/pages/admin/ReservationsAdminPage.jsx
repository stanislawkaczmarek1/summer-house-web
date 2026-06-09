import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { reservationsApi } from '../../api/reservations';
import { cottagesApi } from '../../api/cottages';
import './ReservationsAdminPage.css';

const STATUS_OPTIONS = ['all', 'PENDING', 'CONFIRMED', 'CANCELLED'];

const STATUS_BADGE = {
  CONFIRMED: { label: 'Confirmed', cls: 'badge--success' },
  PENDING: { label: 'Pending', cls: 'badge--warning' },
  CANCELLED: { label: 'Cancelled', cls: 'badge--error' },
};

const STATUS_LABELS = {
  all: 'All',
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
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
      setLoading(true); setError(null);
      const [rRes, cRes] = await Promise.all([
        reservationsApi.getAll(),
        cottagesApi.getAll(),
      ]);
      setReservations(rRes.data);
      setCottages(cRes.data);
    } catch {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getCottageName = (cottageId) =>
    cottages.find(c => c.id === cottageId)?.name ?? `Cottage #${cottageId}`;

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      const updated = await reservationsApi.cancel(confirmCancel.id);
      setReservations(prev =>
        prev.map(r => r.id === confirmCancel.id ? updated.data : r)
      );
      setConfirmCancel(null);
      if (selected?.id === confirmCancel.id) setSelected(updated.data);
    } catch {
      alert('Failed to cancel reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async (reservation) => {
    try {
      const updated = await reservationsApi.update(reservation.id, { status: 'CONFIRMED' });
      setReservations(prev =>
        prev.map(r => r.id === reservation.id ? updated.data : r)
      );
      if (selected?.id === reservation.id) setSelected(updated.data);
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
        r.client?.firstName?.toLowerCase().includes(q) ||
        r.client?.lastName?.toLowerCase().includes(q) ||
        r.client?.email?.toLowerCase().includes(q) ||
        getCottageName(r.cottageId).toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <AdminLayout>
      <div className="animate-fade-in-up">

        <div className="admin-page-header">
          <div className="admin-page-header__left">
            <h1 className="admin-page-title">Reservations</h1>
            <p className="admin-page-subtitle">
              {reservations.length} total ·{' '}
              {reservations.filter(r => r.status === 'CONFIRMED').length} confirmed ·{' '}
              {reservations.filter(r => r.status === 'PENDING').length} pending
            </p>
          </div>
        </div>

        <div className="res-filters">
          <div className="res-filters__search-wrap">
            <span className="res-filters__search-icon">⊹</span>
            <input type="text" className="res-filters__search" placeholder="Search by guest name, email or cottage…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="res-filters__clear" onClick={() => setSearch('')}>×</button>}
          </div>

          <div className="res-filters__status">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                className={`res-filters__status-btn ${statusFilter === s ? 'res-filters__status-btn--active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {STATUS_LABELS[s]}
                {s !== 'all' && (
                  <span className="res-filters__status-count">
                    {reservations.filter(r => r.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="admin-error">⚠ {error}<button className="btn btn--ghost btn--sm" onClick={load}>Retry</button></div>}

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
                    (new Date(r.endDate) - new Date(r.startDate)) / (1000 * 60 * 60 * 24)
                  );
                  const badge = STATUS_BADGE[r.status] ?? { label: r.status, cls: 'badge--neutral' };
                  return (
                    <tr key={r.id} className="res-table__row" onClick={() => setSelected(r)}>
                      <td>
                        <div className="res-table__guest">
                          <span className="res-table__guest-name">
                            {r.client?.firstName} {r.client?.lastName}
                          </span>
                          <span className="res-table__guest-email">{r.client?.email}</span>
                        </div>
                      </td>
                      <td>{getCottageName(r.cottageId)}</td>
                      <td>{fmt(r.startDate)}</td>
                      <td>{fmt(r.endDate)}</td>
                      <td>{nights}</td>
                      <td className="res-table__price">${parseFloat(r.totalPrice).toFixed(0)}</td>
                      <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="admin-table__actions">
                          {r.status === 'PENDING' && (
                            <button className="btn btn--sm res-btn--confirm" onClick={() => handleConfirm(r)}>Confirm</button>
                          )}
                          {r.status !== 'CANCELLED' && (
                            <button className="btn btn--sm admin-btn--danger" onClick={() => setConfirmCancel(r)}>Cancel</button>
                          )}
                          <button className="btn btn--sm admin-btn--danger" onClick={() => setConfirmDelete(r)}>Delete</button>
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
                  <div className="res-drawer__row"><span>Name</span><span>{selected.client?.firstName} {selected.client?.lastName}</span></div>
                  <div className="res-drawer__row"><span>Email</span><span>{selected.client?.email}</span></div>
                  <div className="res-drawer__row"><span>Phone</span><span>{selected.client?.phone || '—'}</span></div>
                </div>
              </div>
              <div className="res-drawer__section">
                <h3 className="res-drawer__section-title">Stay</h3>
                <div className="res-drawer__rows">
                  <div className="res-drawer__row"><span>Cottage</span><span>{getCottageName(selected.cottageId)}</span></div>
                  <div className="res-drawer__row"><span>Check-in</span><span>{fmt(selected.startDate)}</span></div>
                  <div className="res-drawer__row"><span>Check-out</span><span>{fmt(selected.endDate)}</span></div>
                  <div className="res-drawer__row"><span>Guests</span><span>{selected.guestsCount}</span></div>
                  <div className="res-drawer__row"><span>Total price</span><span className="res-drawer__price">${parseFloat(selected.totalPrice).toFixed(2)}</span></div>
                  <div className="res-drawer__row"><span>Status</span><span className={`badge ${STATUS_BADGE[selected.status]?.cls ?? 'badge--neutral'}`}>{STATUS_BADGE[selected.status]?.label ?? selected.status}</span></div>
                  <div className="res-drawer__row"><span>Created</span><span>{fmt(selected.createdAt)}</span></div>
                  {selected.cancelledAt && <div className="res-drawer__row"><span>Cancelled</span><span>{fmt(selected.cancelledAt)}</span></div>}
                </div>
              </div>
            </div>
            <div className="res-drawer__footer">
              {selected.status === 'PENDING' && (
                <button className="btn btn--primary btn--full res-btn--confirm" onClick={() => { handleConfirm(selected); setSelected(null); }}>
                  ✓ Confirm Reservation
                </button>
              )}
              {selected.status !== 'CANCELLED' && (
                <button className="btn admin-btn--danger btn--full" onClick={() => { setConfirmCancel(selected); setSelected(null); }}>
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
              Cancel the reservation for <strong>{confirmCancel.client?.firstName} {confirmCancel.client?.lastName}</strong>?
            </p>
            <div className="admin-modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirmCancel(null)} disabled={actionLoading}>Back</button>
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
            <p className="admin-modal__body">Permanently delete reservation #{confirmDelete.id}? This action cannot be undone.</p>
            <div className="admin-modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)} disabled={actionLoading}>Back</button>
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

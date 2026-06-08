import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { cottagesApi } from '../../api/cottages';
import './CottagesAdminPage.css';

export default function CottagesAdminPage() {
  const [cottages, setCottages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await cottagesApi.getAll();
      setCottages(res.data);
    } catch {
      setError('Failed to load cottages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleVisibility = async (cottage) => {
    try {
      setToggling(cottage.id);
      await cottagesApi.patch(cottage.id, { is_visible: !cottage.is_visible });
      setCottages(prev =>
        prev.map(c => c.id === cottage.id ? { ...c, is_visible: !c.is_visible } : c)
      );
    } catch {
      alert('Failed to update visibility.');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await cottagesApi.remove(id);
      setCottages(prev => prev.filter(c => c.id !== id));
      setConfirmDelete(null);
    } catch {
      alert('Failed to delete cottage.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout>
      <div className="animate-fade-in-up">

        <div className="admin-page-header">
          <div className="admin-page-header__left">
            <h1 className="admin-page-title">Cottages</h1>
            <p className="admin-page-subtitle">
              {cottages.length} total · {cottages.filter(c => c.is_visible).length} visible
            </p>
          </div>
          <Link to="/admin/cottages/new" className="btn btn--primary">
            + Add Cottage
          </Link>
        </div>

        {error && (
          <div className="admin-error">
            ⚠ {error}
            <button className="btn btn--ghost btn--sm" onClick={load}>Retry</button>
          </div>
        )}

        <div className="admin-table-wrap">
          {loading ? (
            <div className="admin-table-loading">
              <span className="spinner spinner--lg" />
            </div>
          ) : cottages.length === 0 ? (
            <div className="admin-table-empty">
              <span>⌂</span>
              <p>No cottages yet</p>
              <Link to="/admin/cottages/new" className="btn btn--primary btn--sm">
                Add your first cottage
              </Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cottage</th>
                  <th>Capacity</th>
                  <th>Price / night</th>
                  <th>Location</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cottages.map(cottage => (
                  <tr key={cottage.id}>

                    <td>
                      <div className="cottages-admin-table__name-cell">
                        <div className="cottages-admin-table__thumb">
                          {cottage.cottage_images?.[0]?.image_url
                            ? <img src={cottage.cottage_images[0].image_url} alt={cottage.name} />
                            : <span>⌂</span>
                          }
                        </div>
                        <div>
                          <div className="cottages-admin-table__name">{cottage.name}</div>
                          <div className="cottages-admin-table__id">#{cottage.id}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="cottages-admin-table__capacity">
                        ◎ {cottage.capacity}
                      </span>
                    </td>

                    <td>
                      <span className="cottages-admin-table__price">
                        ${parseFloat(cottage.price_per_night).toFixed(0)}
                      </span>
                    </td>

                    <td>
                      <span className="cottages-admin-table__address">
                        {cottage.address || '—'}
                      </span>
                    </td>

                    <td>
                      <button
                        className={`visibility-toggle ${cottage.is_visible ? 'visibility-toggle--on' : 'visibility-toggle--off'}`}
                        onClick={() => handleToggleVisibility(cottage)}
                        disabled={toggling === cottage.id}
                        title={cottage.is_visible ? 'Click to hide' : 'Click to show'}
                      >
                        {toggling === cottage.id
                          ? <span className="spinner spinner--sm" />
                          : cottage.is_visible ? '◉ Visible' : '◯ Hidden'
                        }
                      </button>
                    </td>

                    <td>
                      <div className="admin-table__actions">
                        <Link
                          to={`/admin/cottages/${cottage.id}/edit`}
                          className="btn btn--outline btn--sm"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn--sm admin-btn--danger"
                          onClick={() => setConfirmDelete(cottage)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {confirmDelete && (
        <>
          <div className="overlay" onClick={() => setConfirmDelete(null)} />
          <div className="admin-modal animate-scale-in">
            <h2 className="admin-modal__title">Delete Cottage</h2>
            <p className="admin-modal__body">
              Are you sure you want to delete{' '}
              <strong>{confirmDelete.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="admin-modal__actions">
              <button
                className="btn btn--ghost"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting === confirmDelete.id}
              >
                Cancel
              </button>
              <button
                className="btn admin-btn--danger"
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleting === confirmDelete.id}
              >
                {deleting === confirmDelete.id
                  ? <><span className="spinner spinner--sm" /> Deleting…</>
                  : 'Delete'
                }
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: '⊞', exact: true },
  { to: '/admin/cottages', label: 'Cottages', icon: '⌂' },
  { to: '/admin/reservations', label: 'Reservations', icon: '◷' },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/admin/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className={`admin-layout ${collapsed ? 'admin-layout--collapsed' : ''}`}>

      <aside className="admin-sidebar">

        <div className="admin-sidebar__logo">
          <Link to="/" className="admin-sidebar__logo-link">
            <span className="admin-sidebar__logo-icon">⌂</span>
            {!collapsed && <span className="admin-sidebar__logo-text">Summer House</span>}
          </Link>
          <button
            className="admin-sidebar__collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {!collapsed && (
          <div className="admin-sidebar__section-label">Navigation</div>
        )}

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map(({ to, label, icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`
              }
            >
              <span className="admin-nav-item__icon">{icon}</span>
              {!collapsed && <span className="admin-nav-item__label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__bottom">
          <Link
            to="/"
            target="_blank"
            className="admin-nav-item admin-nav-item--secondary"
          >
            <span className="admin-nav-item__icon">⊹</span>
            {!collapsed && <span className="admin-nav-item__label">View Website</span>}
          </Link>

          <button
            className="admin-nav-item admin-nav-item--danger"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <span className="admin-nav-item__icon">
              {loggingOut ? <span className="spinner spinner--sm" /> : '→'}
            </span>
            {!collapsed && (
              <span className="admin-nav-item__label">
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </span>
            )}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </div>

    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [login_val, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in -> redirect
  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!login_val.trim() || !password.trim()) {
      setError('Please enter your login and password.');
      return;
    }

    try {
      setLoading(true);
      await login({ login: login_val.trim(), password });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Invalid login or password.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-page__bg" />

      <div className="login-card animate-scale-in">

        <div className="login-card__header">
          <Link to="/" className="login-card__logo">
            <span className="login-card__logo-icon">⌂</span>
            <span>Summer House</span>
          </Link>
          <h1 className="login-card__title">Admin Panel</h1>
          <p className="login-card__subtitle">Sign in to manage your properties</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {error && (
            <div className="login-form__error animate-fade-in">
              ⚠ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login">Login</label>
            <input
              id="login"
              type="text"
              className="form-input"
              placeholder="admin"
              value={login_val}
              onChange={e => { setLoginVal(e.target.value); setError(''); }}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="login-form__pass-wrap">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-form__pass-toggle"
                onClick={() => setShowPass(s => !s)}
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '◔' : '◉'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg btn--full login-form__submit"
            disabled={loading}
          >
            {loading
              ? <><span className="spinner spinner--sm spinner--light" /> Signing in…</>
              : 'Sign In'
            }
          </button>
        </form>

        <div className="login-card__footer">
          <Link to="/" className="login-card__back">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}

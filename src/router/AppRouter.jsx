import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ScrollToTop from '../components/common/ScrollToTop';

// Public pages
import MapPage from '../pages/public/MapPage';
import HomePage from '../pages/public/HomePage';
import CottagesPage from '../pages/public/CottagesPage';
import CottageDetailPage from '../pages/public/CottageDetailPage';
import ReservationPage from '../pages/public/ReservationPage';

// Admin pages
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import CottagesAdminPage from '../pages/admin/CottagesAdminPage';
import CottageFormPage from '../pages/admin/CottageFormPage';
import ReservationsAdminPage from '../pages/admin/ReservationsAdminPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated
    ? children
    : <Navigate to="/admin/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/cottages" element={<CottagesPage />} />
        <Route path="/cottages/:id" element={<CottageDetailPage />} />
        <Route path="/cottages/:id/reserve" element={<ReservationPage />} />

        {/* admin */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={
          <DashboardPage />
        } />
        <Route path="/admin/cottages" element={
          <CottagesAdminPage />
        } />
        <Route path="/admin/cottages/new" element={
          <CottageFormPage />
        } />
        <Route path="/admin/cottages/:id/edit" element={
          <CottageFormPage />
        } />
        <Route path="/admin/reservations" element={
          <ReservationsAdminPage />
        } />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

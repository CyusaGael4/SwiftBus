import { Navigate, Route, Routes } from 'react-router-dom';
import AgentRegisterPage from './pages/AgentRegisterPage.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import PassengerLayout from './components/passenger/PassengerLayout.jsx';
import ProtectedRoute from './components/routing/ProtectedRoute.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import BusesPage from './pages/BusesPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RoutesPage from './pages/RoutesPage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import BookingConfirmationPage from './pages/passenger/BookingConfirmationPage.jsx';
import RefundsPage from './pages/passenger/RefundsPage.jsx';
import CheckoutPage from './pages/passenger/CheckoutPage.jsx';
import HelpPage from './pages/passenger/HelpPage.jsx';
import HomePage from './pages/passenger/HomePage.jsx';
import MyBookingsPage from './pages/passenger/MyBookingsPage.jsx';
import MyTicketsPage from './pages/passenger/MyTicketsPage.jsx';
import PassengerDashboardPage from './pages/passenger/PassengerDashboardPage.jsx';
import PrivacyPage from './pages/passenger/PrivacyPage.jsx';
import ProfilePage from './pages/passenger/ProfilePage.jsx';
import SearchPage from './pages/passenger/SearchPage.jsx';
import TermsPage from './pages/passenger/TermsPage.jsx';
import TripPage from './pages/passenger/TripPage.jsx';

const STAFF_ROLES = ['admin', 'booking_agent', 'driver'];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/agent" element={<AgentRegisterPage />} />

      {/* Public passenger portal: browsing and seat selection need no account. */}
      <Route element={<PassengerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/trips/:id" element={<TripPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/refunds" element={<RefundsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        <Route element={<ProtectedRoute roles={['passenger']} />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking/:reference" element={<BookingConfirmationPage />} />
          <Route path="/passenger/dashboard" element={<PassengerDashboardPage />} />
          <Route path="/passenger/bookings" element={<MyBookingsPage />} />
          <Route path="/passenger/tickets" element={<MyTicketsPage />} />
          <Route path="/passenger/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Existing staff portal: unchanged routes, now explicitly staff-only. */}
      <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/buses" element={<BusesPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

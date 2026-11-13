import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboard.js';
import { peekCache } from '../api/http.js';
import BookingAnalyticsChart from '../components/dashboard/BookingAnalyticsChart.jsx';
import UpcomingDepartures from '../components/dashboard/UpcomingDepartures.jsx';
import InlineAlert from '../components/ui/InlineAlert.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import StatGroup from '../components/ui/StatGroup.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatNumber, formatSales, roleLabel } from '../lib/format.js';
import bookingIcon from '../assets/icons/d_booking.png';
import busIcon from '../assets/icons/d_bus.png';
import salesIcon from '../assets/icons/d_sales.png';
import usersIcon from '../assets/icons/d_users.png';

const emptyAnalytics = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
  day,
  bookings: 0,
}));

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(() => peekCache('/dashboard'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => !peekCache('/dashboard'));

  useEffect(() => {
    let active = true;

    dashboardApi
      .get()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = data?.stats || {};
  const analytics = data?.analytics || emptyAnalytics;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.fullName || roleLabel(user?.role)}`}
      />

      {error ? (
        <div className="mt-5">
          <InlineAlert>{error}</InlineAlert>
        </div>
      ) : null}

      <StatGroup
        items={[
          { label: 'Total buses', value: stats.totalBuses || 0, icon: busIcon },
          {
            label: "Today's bookings",
            value: formatNumber(stats.todaysBookings || 0),
            icon: bookingIcon,
          },
          {
            label: "Today's passengers",
            value: formatNumber(stats.todaysPassengers || 0),
            icon: usersIcon,
          },
          {
            label: 'Sales (RWF)',
            value: formatSales(stats.salesToday || 0),
            icon: salesIcon,
          },
        ]}
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.63fr)_minmax(300px,1fr)]">
        <section
          className={`card min-h-[396px] p-6 ${loading ? 'opacity-80' : ''}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[19px] font-semibold leading-none text-navy">
                Booking analytics
              </h2>
              <p className="mt-2.5 text-[12.5px] text-muted">Bookings by day</p>
            </div>
            <span className="pt-0.5 text-[12.5px] text-muted">This week</span>
          </div>

          <BookingAnalyticsChart data={analytics} />
        </section>

        <UpcomingDepartures departures={data?.upcomingDepartures || []} />
      </div>
    </div>
  );
}

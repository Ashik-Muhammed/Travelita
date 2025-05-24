import React, { useState, useEffect } from 'react';
import { db, isInitialized, initFirebase } from '../../config/firebase';
import { FaUsers, FaBoxOpen, FaCalendarAlt, FaDollarSign, FaArrowUp, FaArrowDown, FaEllipsisH } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import './AdminDashboard.css';

const AdminDashboard = () => {
  // State for booking management
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Helper function to get button class based on status
  const getStatusButtonClass = (status) => {
    switch(status) {
      case 'pending':
        return 'btn-warning';
      case 'confirmed':
        return 'btn-primary';
      case 'completed':
        return 'btn-success';
      case 'cancelled':
        return 'btn-error';
      default:
        return 'btn-outline';
    }
  };

  // Helper function to get display text for status
  const getStatusDisplay = (status) => {
    if (!status) return 'Update Status';
    return `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  };

  // Handle booking status update
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await db.update(`bookings/${bookingId}`, { status: newStatus });
      
      // Update local state
      setStats(prev => ({
        ...prev,
        recentBookings: prev.recentBookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      }));
      
      setSelectedBooking(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating booking status:', error);
      // Handle error (show error message to user)
    }
  };

  // Handle booking deletion
  const deleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await db.remove(`bookings/${bookingId}`);
        
        // Update local state
        setStats(prev => ({
          ...prev,
          recentBookings: prev.recentBookings.filter(booking => booking.id !== bookingId)
        }));
        
        setSelectedBooking(null);
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Error deleting booking:', error);
        // Handle error (show error message to user)
      }
    }
  };

  // Chart data and options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue',
        data: [6500, 5900, 8000, 8100, 8600, 8500, 9000],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const usersChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'New Users',
        data: [120, 190, 300, 500, 200, 300, 400],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBookings: 0,
    totalPackages: 0,
    revenue: 0,
    revenueChange: 12.5, // percentage
    recentBookings: [
      // Sample data to prevent errors
      {
        id: 'N/A',
        user: 'Unknown',
        package: 'No package',
        date: 'N/A',
        amount: '0',
        status: 'N/A'
      }
    ],
    loading: true,
    error: null,
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      revenue: [6500, 5900, 8000, 8100, 8600, 8500, 9000],
      users: [120, 190, 300, 500, 200, 300, 400]
    }
  });

  useEffect(() => {
    let isMounted = true;

    const initializeAndFetchData = async () => {
      try {
        // Ensure Firebase is initialized
        if (!isInitialized()) {
          console.log('Initializing Firebase...');
          await initFirebase();
        }

        if (!isInitialized()) {
          console.error('Failed to initialize Firebase');
          throw new Error('Failed to initialize Firebase');
        }

        await fetchDashboardData();
      } catch (error) {
        console.error('Initialization error:', error);
        if (isMounted) {
          setStats(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to initialize database. Please refresh the page.'
          }));
        }
      }
    };

    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...');
        
        // Fetch users
        const usersData = await db.get('users') || {};
        const usersCount = Object.keys(usersData).length;

        // Fetch bookings
        const bookingsData = await db.get('bookings') || {};
        const bookingsCount = Object.keys(bookingsData).length;
        
        // Get recent bookings (last 5)
        const recentBookings = Object.entries(bookingsData)
          .sort(([,a], [,b]) => (b.createdAt || 0) - (a.createdAt || 0)) // Sort by most recent first
          .slice(0, 5) // Get only the 5 most recent
          .map(([id, booking]) => ({
            id,
            user: booking.userName || 'Unknown User',
            package: booking.packageName || 'Unknown Package',
            date: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A',
            amount: booking.totalPrice || '0',
            status: booking.status || 'pending',
            ...booking
          }));

        // Fetch packages
        const packagesData = await db.get('packages') || {};
        const packagesCount = Object.keys(packagesData).length;

        // Calculate active users (last 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const activeUsers = Object.values(usersData).filter(
          user => user.lastLogin && user.lastLogin > thirtyDaysAgo
        ).length;

        if (isMounted) {
          setStats({
            totalUsers: usersCount,
            activeUsers,
            totalBookings: bookingsCount,
            totalPackages: packagesCount,
            recentBookings,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (isMounted) {
          setStats(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to load dashboard data. Please try again later.'
          }));
        }
      }
    };

    initializeAndFetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (stats.loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <div className="error-icon">!</div>
          <p>{stats.error}</p>
          <button className="btn btn-outline" onClick={fetchDashboardData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="welcome-text">Welcome back, Admin! Here's what's happening with your platform.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            <FaBoxOpen className="icon" /> New Package
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Users</h3>
            <div className="stat-trend positive">
              <FaArrowUp /> 12.5%
            </div>
          </div>
          <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-icon users">
            <FaUsers />
          </div>
          <div className="stat-footer">
            <span className="stat-description">+245 new users this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Active Users</h3>
            <div className="stat-trend positive">
              <FaArrowUp /> 8.3%
            </div>
          </div>
          <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
          <div className="stat-icon active-users">
            <FaUsers />
          </div>
          <div className="stat-footer">
            <span className="stat-description">Active in last 30 days</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Bookings</h3>
            <div className="stat-trend positive">
              <FaArrowUp /> 5.2%
            </div>
          </div>
          <div className="stat-value">{stats.totalBookings.toLocaleString()}</div>
          <div className="stat-icon bookings">
            <FaCalendarAlt />
          </div>
          <div className="stat-footer">
            <span className="stat-description">+42 from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Revenue</h3>
            <div className={`stat-trend ${stats.revenueChange >= 0 ? 'positive' : 'negative'}`}>
              {stats.revenueChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.abs(stats.revenueChange)}%
            </div>
          </div>
          <div className="stat-value">${(stats.revenue || 0).toLocaleString()}</div>
          <div className="stat-icon revenue">
            <FaDollarSign />
          </div>
          <div className="stat-footer">
            <span className="stat-description">+12.5% from last month</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Revenue Overview</h3>
            <div className="chart-actions">
              <button className="btn btn-sm btn-outline active">Month</button>
              <button className="btn btn-sm btn-outline">Quarter</button>
              <button className="btn btn-sm btn-outline">Year</button>
            </div>
          </div>
          <div className="chart-container">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>New Users</h3>
            <div className="chart-actions">
              <button className="btn btn-sm btn-outline active">Month</button>
              <button className="btn btn-sm btn-outline">Quarter</button>
              <button className="btn btn-sm btn-outline">Year</button>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={usersChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <div className="activity-header">
          <h3>Recent Bookings</h3>
          <div className="flex items-center gap-2">
            <select 
              className="select select-sm select-bordered"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button 
              className="btn btn-sm btn-outline"
              onClick={() => setStatusFilter('all')}
            >
              Reset
            </button>
          </div>
        </div>
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Package</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings
                .filter(booking => statusFilter === 'all' || booking.status === statusFilter)
                .map((booking, index) => {
                  const userName = booking?.user || 'Unknown';
                  const userInitial = userName?.charAt(0)?.toUpperCase() || 'U';
                  const bookingId = booking?.id || `N/A-${index}`;
                  const packageName = booking?.package || 'No package';
                  const bookingDate = booking?.date || 'N/A';
                  const bookingAmount = booking?.amount ? `$${booking.amount}` : '$0';
                  const bookingStatus = booking?.status || 'N/A';
                  
                  return (
                    <tr key={bookingId} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                      setSelectedBooking(booking);
                      setIsEditModalOpen(true);
                    }}>
                      <td className="booking-id">#{bookingId}</td>
                      <td className="user-info">
                        <div className="user-avatar">
                          {userInitial}
                        </div>
                        <span>{userName}</span>
                      </td>
                      <td className="package-name">{packageName}</td>
                      <td className="booking-date">{bookingDate}</td>
                      <td className="booking-amount">{bookingAmount}</td>
                      <td>
                        <span className={`status-badge ${(bookingStatus || '').toLowerCase()}`}>
                          {bookingStatus}
                        </span>
                      </td>
                      <td className="booking-actions">
                        <div className="dropdown dropdown-end">
                          <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle" onClick={(e) => e.stopPropagation()}>
                            <FaEllipsisH className="w-4 h-4" />
                          </label>
                          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52" onClick={(e) => e.stopPropagation()}>
                            <li><button onClick={() => updateBookingStatus(bookingId, 'confirmed')}>Mark as Confirmed</button></li>
                            <li><button onClick={() => updateBookingStatus(bookingId, 'completed')}>Mark as Completed</button></li>
                            <li><button onClick={() => updateBookingStatus(bookingId, 'cancelled')} className="text-error">Cancel Booking</button></li>
                            <li className="divider my-1"></li>
                            <li><button onClick={() => deleteBooking(bookingId)} className="text-error">Delete Booking</button></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {isEditModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Booking Details</h3>
                <button 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-medium text-gray-500">Booking ID</h4>
                  <p>#{selectedBooking.id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Status</h4>
                  <span className={`status-badge ${(selectedBooking.status || '').toLowerCase()}`}>
                    {selectedBooking.status || 'N/A'}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">User</h4>
                  <p>{selectedBooking.user || 'Unknown User'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Package</h4>
                  <p>{selectedBooking.package || 'Unknown Package'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Date</h4>
                  <p>{selectedBooking.date || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Amount</h4>
                  <p>{selectedBooking.amount ? `$${selectedBooking.amount}` : '$0'}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-500 mb-2">Update Status</h4>
                <div className="dropdown dropdown-bottom">
                  <div tabIndex={0} role="button" className={`btn btn-sm w-full md:w-auto ${getStatusButtonClass(selectedBooking.status)}`}>
                    {getStatusDisplay(selectedBooking.status)}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <button 
                        onClick={() => updateBookingStatus(selectedBooking.id, 'pending')}
                        className={selectedBooking.status === 'pending' ? 'active' : ''}
                      >
                        <span className={`status-badge pending`}></span>
                        Set as Pending
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                        className={selectedBooking.status === 'confirmed' ? 'active' : ''}
                      >
                        <span className={`status-badge confirmed`}></span>
                        Set as Confirmed
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                        className={selectedBooking.status === 'completed' ? 'active' : ''}
                      >
                        <span className={`status-badge completed`}></span>
                        Set as Completed
                      </button>
                    </li>
                    <li className="border-t border-gray-200 my-1"></li>
                    <li>
                      <button 
                        onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                        className={`text-error ${selectedBooking.status === 'cancelled' ? 'active' : ''}`}
                      >
                        <span className={`status-badge cancelled`}></span>
                        Cancel Booking
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button 
                  onClick={() => deleteBooking(selectedBooking.id)}
                  className="btn btn-error btn-outline btn-sm"
                >
                  Delete Booking
                </button>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-primary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

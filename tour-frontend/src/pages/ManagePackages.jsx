import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { rtdb } from '../config/firebase';
import { ref, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import './ManagePackages.css';

function ManagePackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userString = localStorage.getItem('user');

    if (!userString) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userString);
      setUserRole(user.role);
      
      // Only admin and vendor can access this page
      if (user.role !== 'admin' && user.role !== 'vendor') {
        navigate('/');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }

    fetchPackages();
  }, [navigate]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // Get packages from Firebase Realtime Database
      const packagesRef = ref(rtdb, 'packages');
      const packagesSnapshot = await get(packagesRef);
      
      if (packagesSnapshot.exists()) {
        // Convert the object of packages to an array with ID included
        let packagesData = Object.entries(packagesSnapshot.val()).map(([id, data]) => ({
          id,
          ...data,
          _id: id // Add _id for backward compatibility with existing code
        }));
        
        // Filter packages based on user role
        if (userRole !== 'admin') {
          // For vendors, only show their own packages
          packagesData = packagesData.filter(pkg => pkg.vendorId === user.id);
        }
        
        setPackages(packagesData);
      } else {
        setPackages([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to fetch packages. Please try again.');
      setLoading(false);
    }
  };

  const handleToggleStatus = async (packageId, currentStatus) => {
    try {
      setActionLoading(true);
      
      // Update package status in Firebase Realtime Database
      const packageRef = ref(rtdb, `packages/${packageId}`);
      await update(packageRef, { available: !currentStatus });

      // Update local state
      setPackages(packages.map(pkg => 
        pkg.id === packageId ? { ...pkg, available: !currentStatus } : pkg
      ));
      
      setSuccessMessage(`Package ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setActionLoading(false);
    } catch (err) {
      console.error('Error updating package status:', err);
      setActionLoading(false);
    }
  };

  const handleDelete = async (packageId) => {
    try {
      setActionLoading(true);
      
      // Delete package from Firebase Realtime Database
      const packageRef = ref(rtdb, `packages/${packageId}`);
      await remove(packageRef);

      // Update local state
      setPackages(packages.filter(pkg => pkg.id !== packageId));
      setSuccessMessage('Package deleted successfully');
      setActionLoading(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting package:', err);
      setError('Failed to delete package. Please try again.');
      setActionLoading(false);
      setDeleteId(null);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    // Add null checks for title and destination properties
    const title = pkg?.title || '';
    const destination = pkg?.destination || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentFilter === 'all') return matchesSearch;
    if (currentFilter === 'active') return matchesSearch && pkg.available;
    if (currentFilter === 'inactive') return matchesSearch && !pkg.available;
    if (currentFilter === 'pending') return matchesSearch && pkg.status === 'pending';
    if (currentFilter === 'rejected') return matchesSearch && pkg.status === 'rejected';
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Tour Packages</h1>
            <p className="mt-1 text-sm text-gray-600">
              {userRole === 'admin' ? 'View and manage all tour packages' : 'View, edit, or remove your tour packages'}
            </p>
          </div>
          {/* Vendor cannot add package as requested */}
          {false && userRole !== 'admin' && (
            <Link
              to="/vendor/packages/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Package
            </Link>
          )}
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search packages by title or destination"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label htmlFor="filter" className="sr-only">Filter</label>
                <select
                  id="filter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={currentFilter}
                  onChange={(e) => setCurrentFilter(e.target.value)}
                >
                  <option value="all">All Packages</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredPackages.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <p className="text-gray-500">No packages found matching your criteria.</p>
            {userRole !== 'admin' && (
              <Link
                to="/vendor/packages/add"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Your First Package
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    className="h-full w-full object-cover"
                    src={pkg.images && pkg.images.length > 0 
                      ? pkg.images[0]
                      : 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                    }
                    alt={pkg.title || 'Tour Package'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-0 right-0 mt-2 mr-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pkg.status === 'approved' 
                        ? pkg.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        : pkg.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {pkg.status === 'approved' 
                        ? pkg.available ? 'Active' : 'Inactive'
                        : pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)
                      }
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.title}</h3>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-500">
                        <span className="inline-block mr-3">
                          <svg className="h-4 w-4 text-gray-400 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {pkg.destination}
                        </span>
                        <span className="inline-block">
                          <svg className="h-4 w-4 text-gray-400 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {pkg.duration}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">₹{pkg.price}</div>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{pkg.description}</p>
                  </div>
                  
                  {deleteId === pkg.id ? (
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-red-600 font-semibold">Are you sure you want to delete this package?</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          disabled={actionLoading}
                          className="w-1/2 inline-flex justify-center items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="w-1/2 inline-flex justify-center items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Link
                        to={`/packages/${pkg.id}`}
                        className="w-1/3 inline-flex justify-center items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View
                      </Link>
                      {userRole !== 'admin' && (
                        <Link
                          to={`/vendor/packages/edit/${pkg.id}`}
                          className="w-1/3 inline-flex justify-center items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Edit
                        </Link>
                      )}
                      {pkg.status === 'approved' && (
                        <button
                          onClick={() => handleToggleStatus(pkg.id, pkg.available)}
                          disabled={actionLoading}
                          className={`w-1/3 inline-flex justify-center items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white ${
                            pkg.available ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {pkg.available ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(pkg.id)}
                        disabled={actionLoading}
                        className="w-1/3 inline-flex justify-center items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagePackages; 
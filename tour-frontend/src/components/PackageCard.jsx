import React from 'react';
import { Link } from 'react-router-dom';

function PackageCard({ pkg, userRole, onDelete, onToggleStatus, deleteId, setDeleteId, actionLoading }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          className="h-full w-full object-cover"
          src={pkg.images && pkg.images.length > 0 
            ? (pkg.images[0].startsWith('http') ? pkg.images[0] : 'https://source.unsplash.com/random/300x200/?travel')
            : 'https://source.unsplash.com/random/300x200/?travel'
          }
          alt={pkg.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://source.unsplash.com/random/300x200/?travel';
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
        
        {deleteId === pkg._id ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-medium mb-3">Are you sure you want to delete this package?</p>
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(pkg._id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              to={`/packages/${pkg._id}`}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center"
            >
              View
            </Link>
            {userRole !== 'admin' && (
              <Link
                to={`/vendor/packages/edit/${pkg._id}`}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
              >
                Edit
              </Link>
            )}
            {pkg.status === 'approved' && (
              <button
                onClick={() => onToggleStatus(pkg._id, pkg.available)}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2 text-white rounded-md text-center ${
                  pkg.available 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {pkg.available ? 'Deactivate' : 'Activate'}
              </button>
            )}
            <button
              onClick={() => setDeleteId(pkg._id)}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PackageCard;

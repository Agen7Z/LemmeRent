// src/Component/AdminPaymentHistory.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  FaMoneyBillWave, FaCalendarAlt, FaTag, FaCheck, FaTimes, FaSpinner, 
  FaTruck, FaHome, FaSearch, FaFilter, FaSortAmountDown, FaUser,
  FaChevronLeft, FaChevronRight, FaFileExport, FaFileInvoiceDollar, 
  FaExclamationTriangle
} from 'react-icons/fa';
import PaymentReceiptButton from './PaymentReceiptButton';

const AdminPaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = `/api/payments/all?page=${pagination.page}&limit=${pagination.limit}`;
        if (statusFilter !== 'all') url += `&status=${statusFilter}`;
        if (typeFilter !== 'all') url += `&bookingType=${typeFilter}`;
        if (searchTerm) url += `&search=${searchTerm}`;

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });

        if (res.data.success) {
          setPayments(res.data.payments);
          setPagination(res.data.pagination);
        } else {
          throw new Error(res.data.error || 'Failed to fetch payment history');
        }
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.isAdmin) {
      fetchPayments();
    }
  }, [currentUser, pagination.page, pagination.limit, statusFilter, typeFilter, searchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({...pagination, page: newPage});
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to page 1 when searching
    setPagination({...pagination, page: 1});
  };

  const exportToCSV = (payments) => {
    // Prepare CSV headers
    const headers = [
      'Transaction ID',
      'User Name',
      'User Email',
      'Amount (NPR)',
      'Payment Date',
      'Status',
      'Payment Method',
      'Booking Type',
      'Reference ID'
    ];

    // Prepare CSV data rows
    const rows = payments.map(payment => [
      payment.transactionId || 'N/A',
      payment.userId?.username || 'Unknown',
      payment.userId?.email || 'N/A',
      payment.amount?.toLocaleString() || '0',
      formatDate(payment.paymentDate || payment.createdAt),
      payment.status,
      payment.method === 'khalti' ? 'Khalti' : payment.method,
      payment.bookingType === 'shifting' ? 'Shifting Service' : 'Property Booking',
      payment.referenceId || 'N/A'
    ]);

    // Convert to CSV string
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all payments without pagination
      let url = `/api/payments/all?limit=0`; // limit=0 means get all records
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (typeFilter !== 'all') url += `&bookingType=${typeFilter}`;
      if (searchTerm) url += `&search=${searchTerm}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${currentUser?.access_token}`,
        },
      });

      if (res.data.success) {
        exportToCSV(res.data.payments);
      } else {
        throw new Error(res.data.error || 'Failed to fetch payments for export');
      }
    } catch (err) {
      console.error('Error exporting payments:', err);
      setError(err.response?.data?.error || err.message || 'Failed to export payments');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Helper function to render payment status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheck className="mr-1" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimes className="mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaSpinner className="mr-1 animate-spin" />
            Pending
          </span>
        );
    }
  };

  // Helper function to render booking type icon
  const renderBookingTypeIcon = (bookingType) => {
    return bookingType === 'shifting' ? (
      <FaTruck className="text-blue-500" />
    ) : (
      <FaHome className="text-indigo-500" />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header with filters */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FaFileInvoiceDollar className="mr-3" />
            Payment History
          </h2>
          
          <button 
            onClick={handleExportData}
            disabled={loading}
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                Preparing Export...
              </>
            ) : (
              <>
                <FaFileExport className="mr-2" />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <form onSubmit={handleSearch} className="flex-grow md:max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by transaction ID or user name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <button type="submit" className="absolute right-2 top-2 bg-blue-500 text-white p-1 rounded">
                <FaSearch className="w-4 h-4" />
              </button>
            </div>
          </form>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <FaFilter className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">All Payment Types</option>
                <option value="property">Property Bookings</option>
                <option value="shifting">Shifting Services</option>
              </select>
              <FaSortAmountDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading payment records...</p>
        </div>
      ) : error ? (
        <div className="p-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 mb-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
            <FaMoneyBillWave className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Payment Records Found</h3>
          <p className="text-gray-500">No payments match your current filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {renderBookingTypeIcon(payment.bookingType)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.transactionId || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.method === 'khalti' ? 'Khalti' : payment.method}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                        <FaUser className="w-4 h-4" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.userId?.username || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.userId?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      NPR {payment.amount?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FaCalendarAlt className="mr-1 text-gray-400" />
                      {formatDate(payment.paymentDate || payment.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FaTag className="mr-1 text-gray-400" />
                      {payment.bookingType === 'shifting' ? 'Shifting Service' : 'Property Booking'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {/* View details functionality */}}
                      >
                        View
                      </button>
                      
                      {/* Only show the receipt button for completed payments */}
                      {payment.status === 'completed' && (
                        <PaymentReceiptButton payment={payment} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && payments.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } border border-gray-300 flex items-center`}
              >
                <FaChevronLeft className="h-4 w-4" />
                <span className="ml-1">Previous</span>
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === pagination.pages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } border border-gray-300 flex items-center`}
              >
                <span className="mr-1">Next</span>
                <FaChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentHistory;

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FaMoneyBillWave, FaCalendarAlt, FaTag, FaCheck, FaTimes, FaSpinner,
  FaTruck, FaHome, FaReceipt, FaFileInvoiceDollar
} from 'react-icons/fa';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get('/api/payments/history', {
          headers: {
            Authorization: `Bearer ${currentUser?.access_token}`,
          },
        });

        if (res.data.success) {
          setPayments(res.data.payments || []);
        } else {
          throw new Error(res.data.error || 'Failed to fetch payment history');
        }
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError(err?.response?.data?.error || err?.message || 'Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchPaymentHistory();
    }
  }, [currentUser]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const downloadReceipt = (payment) => {
    try {
      const doc = new jsPDF();

      // Add header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(40, 53, 147);
      doc.text('RentPal Payment Receipt', 105, 20, { align: 'center' });

      // Add divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 25, 190, 25);

      // Add customer information
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Receipt No: ${payment.transactionId || payment._id || 'N/A'}`, 20, 35);
      doc.text(`Date: ${formatDate(payment.paymentDate || payment.createdAt)}`, 20, 45);
      doc.text(`Customer: ${currentUser?.username || 'N/A'}`, 20, 55);
      doc.text(`Email: ${currentUser?.email || 'N/A'}`, 20, 65);

      // Add payment details table
      autoTable(doc, {
        startY: 75,
        head: [['Description', 'Details']],
        body: [
          ['Service Type', payment.bookingType === 'shifting' ? 'Shifting Service' : 'Property Booking'],
          ['Amount', `NPR ${payment.amount?.toLocaleString() || '0'}`],
          ['Payment Method', payment.method || 'N/A'],
          ['Status', payment.status || 'N/A'],
          ['Reference ID', payment.referenceId || 'N/A']
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [40, 53, 147],
          textColor: 255,
          fontStyle: 'bold'
        },
      });

      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const pageHeight = doc.internal.pageSize.height || 297;
      doc.text('Thank you for using RentPal!', 105, pageHeight - 20, { align: 'center' });
      doc.text('For any questions, contact support@rentpal.com', 105, pageHeight - 15, { align: 'center' });

      // Save the PDF
      doc.save(`RentPal_Receipt_${payment.transactionId || payment._id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate receipt. Please try again.');
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><FaCheck className="mr-1" />Completed</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FaTimes className="mr-1" />Failed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FaSpinner className="mr-1 animate-spin" />Pending</span>;
    }
  };

  const renderBookingTypeIcon = (type) => {
    return type === 'shifting' ? <FaTruck className="text-blue-500" /> : <FaHome className="text-indigo-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Loading payment history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaTimes className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center">
          <FaFileInvoiceDollar className="mr-3" />
          Payment History
        </h2>
      </div>

      {payments.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 mb-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
            <FaMoneyBillWave className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Payment Records Found</h3>
          <p className="text-gray-500">You haven't made any payments yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
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
                        <div className="text-sm font-medium text-gray-900">{payment.transactionId || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{payment.method || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">NPR {payment.amount?.toLocaleString() || 0}</div>
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
                    {payment.status === 'completed' && (
                      <button 
                        onClick={() => downloadReceipt(payment)} 
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <FaReceipt className="mr-1" />
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

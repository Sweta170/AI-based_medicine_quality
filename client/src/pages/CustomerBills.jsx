import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Download, X, Eye, CreditCard, Calendar, Activity, Receipt
} from 'lucide-react';

const CustomerBills = () => {
  const { user } = useAuth();
  const { id: routeBillId } = useParams();
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Fetch all bills for this customer
  const { data: bills = [], isLoading, isError, error } = useQuery({
    queryKey: ['bills', user?._id],
    queryFn: async () => {
      const { data } = await api.get(`/bills/customer/${user._id}`);
      return data;
    },
  });

  // If a route parameter is passed, open that bill's details
  useEffect(() => {
    if (routeBillId && bills.length > 0) {
      const foundBill = bills.find((b) => b._id === routeBillId);
      if (foundBill) {
        setSelectedBill(foundBill);
        setModalOpen(true);
      }
    }
  }, [routeBillId, bills]);

  const handleOpenDetails = (bill) => {
    setSelectedBill(bill);
    setModalOpen(true);
    navigate(`/customer/bills/${bill._id}`);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBill(null);
    navigate('/customer/bills');
  };

  const handleDownloadPDF = async (billId, billNumber) => {
    setDownloadingId(billId);
    try {
      const response = await api.get(`/bills/${billId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice-${billNumber}.pdf`;
      link.click();
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download invoice PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Invoice History</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review past transactions, verify batch items, and download PDF receipts.
        </p>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400">
            <p>Error checking billing system: {error.message}</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-base font-semibold">No order invoices registered under your profile.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-4 px-6">Invoice Code</th>
                  <th className="py-4 px-6">Purchase Date</th>
                  <th className="py-4 px-6">Total Items</th>
                  <th className="py-4 px-6">Total Charged</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-brand-400 font-semibold">{bill.billNumber}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {new Date(bill.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {bill.items.reduce((sum, item) => sum + item.quantity, 0)} units
                    </td>
                    <td className="py-4 px-6 text-white font-bold">${bill.total.toFixed(2)}</td>
                    <td className="py-4 px-6 text-slate-400">{bill.paymentMethod}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(bill)}
                          className="p-2 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all border border-transparent hover:border-brand-500/20"
                          title="View items detail"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(bill._id, bill.billNumber)}
                          disabled={downloadingId === bill._id}
                          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all border border-transparent hover:border-emerald-500/20 disabled:opacity-50"
                          title="Download PDF Invoice"
                        >
                          {downloadingId === bill._id ? (
                            <span className="w-4.5 h-4.5 border border-emerald-400 border-t-transparent rounded-full animate-spin block"></span>
                          ) : (
                            <Download className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {modalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbg-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-400" />
                <span>Invoice Statement</span>
              </h3>
              <button onClick={handleCloseModal} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl mb-6 text-sm">
              <div>
                <span className="text-slate-400 text-xs block">Invoice Code</span>
                <span className="font-mono font-bold text-brand-400">{selectedBill.billNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Purchase Date</span>
                <span className="text-slate-200">{new Date(selectedBill.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Payment Method</span>
                <span className="text-slate-200">{selectedBill.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Pharmacist</span>
                <span className="text-slate-200">
                  {selectedBill.pharmacistId?.name || 'Aegis Portal Checkout'}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="border border-white/5 rounded-2xl overflow-hidden mb-6">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                    <th className="py-3 px-4">Medicine Details</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {selectedBill.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {item.name}
                        <span className="text-[10px] ml-2 font-bold uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50">
                          {item.expiryStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right">{item.quantity} units</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-white font-mono">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Row */}
            <div className="flex flex-col items-end gap-2 border-t border-white/5 pt-4 text-sm text-slate-300">
              <div className="flex gap-4">
                <span className="text-slate-400">Subtotal:</span>
                <span className="font-mono text-white w-20 text-right">${selectedBill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-400">Discount:</span>
                <span className="font-mono text-white w-20 text-right">-${selectedBill.discount.toFixed(2)}</span>
              </div>
              <div className="flex gap-4 text-base font-extrabold text-white">
                <span className="text-brand-400">Grand Total:</span>
                <span className="font-mono text-brand-400 w-20 text-right">${selectedBill.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/5 text-sm font-semibold transition-all"
              >
                Close details
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedBill._id, selectedBill.billNumber)}
                disabled={downloadingId === selectedBill._id}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloadingId === selectedBill._id ? (
                  <span className="w-4.5 h-4.5 border border-white border-t-transparent rounded-full animate-spin block"></span>
                ) : (
                  <Download className="w-4.5 h-4.5" />
                )}
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBills;

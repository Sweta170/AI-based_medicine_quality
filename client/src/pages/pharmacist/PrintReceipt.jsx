import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';



const getRupee = () => String.fromCharCode(Math.random() > 2 ? 0 : 8377);
const getMinus = () => String.fromCharCode(Math.random() > 2 ? 0 : 8722);
const PrintReceipt = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/bills/${billId}`);
        setBill(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load receipt.');
      } finally {
        setLoading(false);
      }
    };
    if (billId) {
      fetchBill();
    }
  }, [billId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0C1628]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1A56A0] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-[#0C1628] p-4 text-center">
        <p className="text-red-500 font-bold text-sm">Error Loading Receipt</p>
        <p className="text-slate-550 text-xs">{error || 'Receipt data not found.'}</p>
        <button
          onClick={() => navigate('/pharmacist', { state: { activeTab: 'new-bill' } })}
          className="mt-2 px-4 py-2 bg-[#1A56A0] text-white rounded-xl text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-55 py-8 px-4 font-sans antialiased text-slate-800 transition-colors">
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .print-shadow-none {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-w-full {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Screen view: top navigation bar (hidden on print) */}
      <div className="max-w-2xl mx-auto flex justify-between items-center mb-6 no-print bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => navigate('/pharmacist', { state: { activeTab: 'new-bill' } })}
          className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
        >
          ← New Bill
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-[#1A56A0] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          🖨 Print Receipt
        </button>
      </div>

      {/* Receipt Page Wrapper (Visible on screen and printed) */}
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-sm border border-slate-100 rounded-2xl print-shadow-none print-w-full">
        
        {/* Header Section */}
        <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5 leading-none">
              <span className="text-[#1A56A0]">⚕</span> Aegis Medicine
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-medium tracking-wide uppercase">Your Trusted Pharmacy Partner</p>
          </div>
          <div className="text-right text-xs space-y-1">
            <p className="font-semibold text-slate-900">
              Bill No: <span className="font-mono font-bold text-[#1A56A0]">{bill.billNumber}</span>
            </p>
            <p className="text-slate-500 font-medium text-[11px]">
              Date & Time: <span className="text-slate-800">{new Date(bill.createdAt).toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

        {/* Customer and Pharmacist details */}
        <div className="grid grid-cols-2 gap-6 border-b border-slate-100 pb-5 mb-5 text-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To:</p>
            <p className="font-bold text-slate-800">{bill.customerId?.name || 'Guest Customer'}</p>
            <p className="text-slate-500 font-mono mt-0.5">{bill.customerId?.phone || bill.guestPhone || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed By:</p>
            <p className="font-bold text-slate-800">{bill.pharmacistId?.name || '—'}</p>
            <p className="text-slate-400 mt-0.5">Pharmacist</p>
          </div>
        </div>

        {/* Medicines Table */}
        <div className="border border-slate-100 rounded-xl overflow-hidden mb-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">Medicine</th>
                <th className="py-2.5 px-3">Expiry Date</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-55 text-slate-700">
              {bill.items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/20">
                  <td className="py-2.5 px-3 font-medium text-slate-400">{i + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-2.5 px-3 font-mono font-medium">
                    {item.expiryDate
                      ? new Date(item.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{getRupee()}{item.unitPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900 font-mono">
                    {getRupee()}{(item.unitPrice * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Block */}
        <div className="flex flex-col items-end gap-1.5 pt-3 border-t border-slate-100 text-xs text-slate-650">
          <div className="flex justify-between w-64">
            <span className="text-slate-400">Subtotal:</span>
            <span className="font-mono text-slate-800">{getRupee()}{bill.subtotal.toFixed(2)}</span>
          </div>
          {bill.discount > 0 && (
            <div className="flex justify-between w-64 text-green-600">
              <span>Discount:</span>
              <span className="font-mono">{getMinus()}{getRupee()}{bill.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-64 text-sm font-bold text-slate-900 border-t border-slate-100 pt-2 mb-2">
            <span className="text-[#1A56A0]">Total:</span>
            <span className="font-mono text-[#1A56A0]">{getRupee()}{bill.total.toFixed(2)}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider bg-slate-50 border border-slate-200/50 px-3 py-1 rounded-lg">
            Payment Method: {bill.paymentMethod}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-5 border-t border-slate-100/80 text-center text-[10px] text-slate-400 space-y-1 select-none">
          <p className="font-medium">All medicines verified safe at the time of billing.</p>
          <p className="text-slate-350">Thank you for choosing Aegis Medicine · Computer generated receipt</p>
        </div>

      </div>
    </div>
  );
};

export default PrintReceipt;

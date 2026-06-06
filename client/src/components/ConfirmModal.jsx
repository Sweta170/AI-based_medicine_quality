import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ title = "Are you sure?", message, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-bold text-base text-textDark flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orangeAccent shrink-0" />
            <span>{title}</span>
          </h3>
          <button onClick={onCancel} className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4.5 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md text-xs"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

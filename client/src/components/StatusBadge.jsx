import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'EXPIRED':
        return 'bg-red-50 text-redAccent border-red-200 border';
      case 'CRITICAL':
        return 'bg-rose-50 text-redAccent border-rose-200 border';
      case 'WARNING':
        return 'bg-orange-50 text-orangeAccent border-orange-200 border';
      case 'CAUTION':
        return 'bg-yellow-50 text-amber-700 border-yellow-200 border';
      case 'SAFE':
        return 'bg-emerald-50 text-greenAccent border-emerald-200 border';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 border';
    }
  };

  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${getStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

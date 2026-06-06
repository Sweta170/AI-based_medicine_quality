import React from 'react';

const StatCard = ({ title, icon: Icon, value, color = 'blue' }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 dark:bg-white/5 text-[#1A56A0] dark:text-sky-400';
      case 'red':
        return 'bg-red-50 dark:bg-white/5 text-red-650 dark:text-red-405';
      case 'orange':
        return 'bg-orange-50 dark:bg-white/5 text-orange-600 dark:text-orange-400';
      case 'green':
        return 'bg-emerald-50 dark:bg-white/5 text-emerald-600 dark:text-emerald-450';
      default:
        return 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400';
    }
  };

  const colorClasses = getColorStyles();

  return (
    <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden flex items-center justify-between transition-colors duration-200">
      <div>
        <span className="text-slate-400 dark:text-slate-505 text-[10px] font-bold uppercase tracking-wider block">{title}</span>
        <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">{value}</span>
      </div>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colorClasses}`}>
        {Icon && <Icon className="w-4 h-4" />}
      </div>
    </div>
  );
};

export default StatCard;

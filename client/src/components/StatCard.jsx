import React from 'react';

const StatCard = ({ title, icon: Icon, value, color = 'blue' }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-primary',
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          text: 'text-redAccent',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          text: 'text-orangeAccent',
        };
      case 'green':
        return {
          bg: 'bg-emerald-50',
          text: 'text-greenAccent',
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-600',
        };
    }
  };

  const styles = getColorStyles();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-between">
      <div>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">{title}</span>
        <span className="text-3xl font-extrabold text-textDark mt-2 block">{value}</span>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.bg} ${styles.text}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
    </div>
  );
};

export default StatCard;

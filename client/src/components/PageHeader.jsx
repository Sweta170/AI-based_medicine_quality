import React from 'react';

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="pb-2 border-b border-slate-100 dark:border-slate-700/50 mb-4 transition-colors duration-200">
      <h1 className="text-lg font-bold text-slate-805 dark:text-slate-200 tracking-tight">{title}</h1>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
};

export default PageHeader;

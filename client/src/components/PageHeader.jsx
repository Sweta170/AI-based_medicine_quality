import React from 'react';

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="pb-4 border-b border-slate-100 mb-6">
      <h1 className="text-2xl font-bold text-textDark tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default PageHeader;

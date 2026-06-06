import React from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ placeholder = "Search...", onChange, value }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-700 bg-white"
      />
    </div>
  );
};

export default SearchInput;

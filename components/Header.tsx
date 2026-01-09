import React from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddVisit: () => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onAddVisit, onExport }) => {
  return (
    <div className="flex-1 flex items-center justify-between ml-2">
      <div className="flex-1 max-w-md relative">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm"></i>
        <input
          type="text"
          placeholder="Search name or phone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-4 py-1.5 sm:py-2 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 rounded-lg text-xs sm:text-sm outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        <button 
          onClick={onExport}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          title="Export to CSV"
        >
          <i className="fas fa-file-export sm:mr-1"></i>
          <span className="hidden sm:inline text-xs font-semibold">Export</span>
        </button>
        <div className="hidden sm:block h-8 w-[1px] bg-gray-200 mx-1"></div>
        <button 
          onClick={onAddVisit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95 whitespace-nowrap"
        >
          <i className="fas fa-plus"></i>
          <span className="hidden sm:inline">New Visit</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
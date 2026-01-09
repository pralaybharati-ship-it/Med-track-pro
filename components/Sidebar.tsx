
import React, { useState, useEffect } from 'react';
import { Hospital } from '../types';

interface SidebarProps {
  hospitals: Hospital[];
  selectedId: string | 'all';
  onSelect: (id: string | 'all') => void;
  onAddClick: () => void;
  canInstall: boolean;
  onInstall: () => void;
  isOnline: boolean;
  patientCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  hospitals, 
  selectedId, 
  onSelect, 
  onAddClick, 
  canInstall, 
  onInstall,
  isOnline,
  patientCount
}) => {
  const [isStandalone, setIsStandalone] = useState(false);
  
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <i className="fas fa-hospital-user text-xl"></i>
          </div>
          <h1 className="font-bold text-xl tracking-tight">MedTrack <span className="text-indigo-600">Pro</span></h1>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => onSelect('all')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              selectedId === 'all' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-layer-group w-5"></i>
            All Patients
          </button>
        </nav>
      </div>

      <div className="flex-1 px-6 overflow-y-auto">
        <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Local Database</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">{patientCount}</span>
            <span className="text-xs font-medium opacity-90">Records Found</span>
          </div>
          <p className="text-[9px] mt-3 leading-relaxed opacity-70">Saved locally on your phone for offline access.</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Clinics</h3>
          <button 
            onClick={onAddClick}
            className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
          >
            <i className="fas fa-plus-circle text-lg"></i>
          </button>
        </div>
        
        <div className="space-y-1 mb-8">
          {hospitals.map(hospital => (
            <button
              key={hospital.id}
              onClick={() => onSelect(hospital.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors group ${
                selectedId === hospital.id 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-hospital w-5 opacity-70"></i>
              <span className="truncate">{hospital.name}</span>
            </button>
          ))}
        </div>

        {!isStandalone && (
          <div className="pt-6 border-t border-gray-100 mb-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Mobile App</h3>
            <button
              onClick={onInstall}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 active:scale-95 transition-all mb-3"
            >
              <i className="fas fa-download"></i>
              Add to Home Screen
            </button>
            <p className="text-[9px] text-gray-400 text-center px-2">Install for a faster experience and full offline support.</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100">
        <div className={`${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} rounded-xl p-4 transition-all border ${isOnline ? 'border-emerald-100' : 'border-amber-100'}`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest">Status</p>
            <div className={`w-2 h-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full ${isOnline ? 'animate-pulse' : ''}`}></div>
          </div>
          <p className="text-sm font-black mt-1">{isOnline ? 'Cloud Active' : 'Offline Ready'}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

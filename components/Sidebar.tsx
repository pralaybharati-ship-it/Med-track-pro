
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
  const [copied, setCopied] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }
  }, []);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  /**
   * Generates a GitHub ZIP download link.
   * Since the repo name is dynamic based on where the user hosts it, 
   * we try to infer it or provide a generic placeholder that the user can update.
   */
  const githubZipUrl = "https://github.com/user/medtrack-pro/archive/refs/heads/main.zip";

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
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              selectedId === 'all' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-layer-group w-5"></i>
            All Hospitals
          </button>
        </nav>
      </div>

      <div className="flex-1 px-6 overflow-y-auto">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Database Stats</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{patientCount}</span>
            <span className="text-xs text-gray-500 font-medium">Patients Managed</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hospitals</h3>
          <button 
            onClick={onAddClick}
            className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors"
          >
            <i className="fas fa-plus-circle text-lg"></i>
          </button>
        </div>
        
        <div className="space-y-1 mb-8">
          {hospitals.map(hospital => (
            <button
              key={hospital.id}
              onClick={() => onSelect(hospital.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors group ${
                selectedId === hospital.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-hospital w-5 opacity-70 group-hover:scale-110 transition-transform"></i>
              <span className="truncate">{hospital.name}</span>
            </button>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-100 mb-6">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Resources</h3>
          
          {canInstall && !isStandalone && (
            <button
              onClick={onInstall}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all mb-3"
            >
              <i className="fas fa-cloud-download-alt"></i>
              Install App
            </button>
          )}

          <a
            href={githubZipUrl}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-black active:scale-95 transition-all mb-3"
          >
            <i className="fab fa-github"></i>
            Download Source Code
          </a>
          
          <button
            onClick={handleCopyLink}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all mb-4 border ${
              copied 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-share-alt'}`}></i>
            {copied ? 'Link Copied!' : 'Copy App Link'}
          </button>
          
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-[10px] font-bold text-blue-700 mb-2">
              <i className="fas fa-code mr-1.5"></i>
              Run Locally:
            </p>
            <div className="bg-white p-2 rounded border border-blue-100 text-[9px] font-mono text-blue-600 mb-1">
              npm run dev
            </div>
            <p className="text-[9px] text-blue-500 italic">
              Access: http://localhost:3000
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100">
        <div className={`${isOnline ? 'bg-emerald-600' : 'bg-amber-500'} rounded-xl p-4 text-white transition-all shadow-md`}>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Live Connection</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{isOnline ? 'Online & Syncing' : 'Offline Mode'}</p>
            <div className={`w-2.5 h-2.5 ${isOnline ? 'bg-green-300' : 'bg-white'} rounded-full ${isOnline ? 'animate-pulse' : ''}`}></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

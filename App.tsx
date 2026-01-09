
import React, { useState, useEffect, useMemo } from 'react';
import { Hospital, PatientVisit, SortField, SortDirection } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import VisitTable from './components/VisitTable';
import VisitModal from './components/VisitModal';
import HospitalModal from './components/HospitalModal';

const STORAGE_KEY_HOSPITALS = 'medtrack_hospitals';
const STORAGE_KEY_VISITS = 'medtrack_visits';

const App: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<PatientVisit | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  
  const [sortField, setSortField] = useState<SortField>('visitDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sync Online Status & Detect PWA Mode
  useEffect(() => {
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!checkStandalone);

    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // Load Data from Mobile Storage (Local)
  useEffect(() => {
    const storedHospitals = localStorage.getItem(STORAGE_KEY_HOSPITALS);
    const storedVisits = localStorage.getItem(STORAGE_KEY_VISITS);
    
    if (storedHospitals) {
      setHospitals(JSON.parse(storedHospitals));
    } else {
      // Default initial state
      setHospitals([
        { id: '1', name: 'My First Clinic', location: 'Main Branch', createdAt: new Date().toISOString() }
      ]);
    }
    
    if (storedVisits) {
      setVisits(JSON.parse(storedVisits));
    }
  }, []);

  // Save Data to Mobile Storage whenever it changes
  useEffect(() => {
    if (hospitals.length > 0 || visits.length > 0) {
      localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(hospitals));
      localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(visits));
    }
  }, [hospitals, visits]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIos) setShowIosTip(true);
      else alert("To download: Tap the 3-dots in Chrome and select 'Install app' or 'Add to Home Screen'.");
    }
  };

  const handleSaveVisit = (visit: PatientVisit) => {
    if (editingVisit) {
      setVisits(prev => prev.map(v => v.id === visit.id ? visit : v));
    } else {
      setVisits(prev => [visit, ...prev]);
    }
    setIsVisitModalOpen(false);
    setEditingVisit(null);
  };

  const filteredVisits = useMemo(() => {
    return visits
      .filter(v => {
        const matchesHospital = selectedHospitalId === 'all' || v.hospitalId === selectedHospitalId;
        const matchesSearch = v.phoneNumber.includes(searchQuery) || 
                             v.patientName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesHospital && matchesSearch;
      })
      .sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];
        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [visits, selectedHospitalId, searchQuery, sortField, sortDirection]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative font-sans">
      {/* High-Visibility Install Banner (Visible in mobile browser only) */}
      {!isStandalone && (
        <div className="fixed top-0 inset-x-0 z-[70] bg-indigo-600 p-4 flex items-center justify-between text-white shadow-xl lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <i className="fas fa-mobile-screen-button text-lg"></i>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80">MedTrack Pro</p>
              <p className="text-sm font-bold">Install as Mobile App</p>
            </div>
          </div>
          <button 
            onClick={handleInstallApp}
            className="bg-white text-indigo-600 px-6 py-2 rounded-full text-xs font-black shadow-lg active:scale-90 transition-transform"
          >
            INSTALL NOW
          </button>
        </div>
      )}

      {/* iOS Instruction Dialog */}
      {showIosTip && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowIosTip(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm mb-4 animate-bounce-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-share-from-square text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Install on iPhone</h3>
              <p className="text-sm text-gray-500 mb-6">Tap the <strong>Share</strong> icon in Safari and select <br/><span className="font-bold text-indigo-600">"Add to Home Screen"</span>.</p>
              <button onClick={() => setShowIosTip(false)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <div className={`lg:block fixed lg:relative h-full z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar 
          hospitals={hospitals} 
          selectedId={selectedHospitalId} 
          onSelect={(id) => { setSelectedHospitalId(id); setIsSidebarOpen(false); }}
          onAddClick={() => setIsHospitalModalOpen(true)}
          canInstall={!isStandalone}
          onInstall={handleInstallApp}
          isOnline={isOnline}
          patientCount={new Set(visits.map(v => v.phoneNumber)).size}
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between shrink-0 ${!isStandalone ? 'mt-[72px] lg:mt-0' : ''}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <i className="fas fa-bars"></i>
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-800 lg:hidden text-sm truncate">
                {selectedHospitalId === 'all' ? 'MedTrack Pro' : hospitals.find(h => h.id === selectedHospitalId)?.name}
              </h1>
              {!isOnline && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded-full">Offline</span>
              )}
            </div>
          </div>
          <Header 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            onAddVisit={() => { setEditingVisit(null); setIsVisitModalOpen(true); }} 
            onExport={() => alert("Data saved to local storage.")}
          />
        </header>
        
        <main className="flex-1 p-3 lg:p-6 overflow-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <VisitTable 
              visits={filteredVisits} 
              hospitals={hospitals} 
              onEdit={(v) => { setEditingVisit(v); setIsVisitModalOpen(true); }} 
              onDelete={(id) => setVisits(v => v.filter(x => x.id !== id))} 
              sortField={sortField} 
              sortDirection={sortDirection} 
              onSort={(field) => {
                if (field === sortField) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                else { setSortField(field); setSortDirection('desc'); }
              }} 
            />
          </div>
        </main>
      </div>

      <VisitModal 
        isOpen={isVisitModalOpen} 
        onClose={() => setIsVisitModalOpen(false)} 
        onSave={handleSaveVisit} 
        hospitals={hospitals} 
        initialData={editingVisit} 
        defaultHospitalId={selectedHospitalId !== 'all' ? selectedHospitalId : hospitals[0]?.id} 
        isOnline={isOnline} 
        allVisits={visits}
      />
      <HospitalModal isOpen={isHospitalModalOpen} onClose={() => setIsHospitalModalOpen(false)} onSave={(h) => setHospitals(p => [...p, h])} />

      {/* Mobile Floating Action Button */}
      <button 
        onClick={() => { setEditingVisit(null); setIsVisitModalOpen(true); }} 
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center text-xl z-30 active:scale-90 transition-transform"
      >
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
};

export default App;

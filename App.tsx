
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
  const [isSaving, setIsSaving] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  
  const [sortField, setSortField] = useState<SortField>('visitDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!checkStandalone);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const data = await response.json();
          if (data.hospitals?.length > 0) setHospitals(data.hospitals);
          if (data.visits?.length > 0) setVisits(data.visits);
          setIsSynced(true);
          return;
        }
      } catch (err) {
        console.warn('Backend offline, using local storage.');
      }

      const storedHospitals = localStorage.getItem(STORAGE_KEY_HOSPITALS);
      const storedVisits = localStorage.getItem(STORAGE_KEY_VISITS);
      
      if (storedHospitals) setHospitals(JSON.parse(storedHospitals));
      else {
        setHospitals([
          { id: '1', name: 'City Central Hospital', location: 'Main Street', createdAt: new Date().toISOString() },
          { id: '2', name: 'West Side Clinic', location: 'Business District', createdAt: new Date().toISOString() }
        ]);
      }
      if (storedVisits) setVisits(JSON.parse(storedVisits));
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (hospitals.length === 0 && visits.length === 0) return;
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(hospitals));
    localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(visits));

    const syncWithBackend = async () => {
      if (!isOnline) {
        setIsSaving(false);
        setIsSynced(false);
        return;
      }
      try {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hospitals, visits })
        });
        if (response.ok) setIsSynced(true);
      } catch (err) {
        setIsSynced(false);
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(syncWithBackend, 1500);
    return () => clearTimeout(timer);
  }, [hospitals, visits, isOnline]);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      // Logic for iOS or desktop where beforeinstallprompt isn't available
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIos) {
        setShowIosTip(true);
      } else {
        alert("To install, use your browser menu and select 'Install' or 'Add to Home Screen'.");
      }
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
      {/* Mobile Download Prompt */}
      {!isStandalone && (
        <div className="lg:hidden fixed top-0 inset-x-0 z-[60] bg-gradient-to-r from-indigo-600 to-indigo-700 p-3.5 flex items-center justify-between text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
              <i className="fas fa-hospital-user"></i>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">MedTrack Pro</p>
              <p className="text-xs font-bold">Download for Offline Use</p>
            </div>
          </div>
          <button 
            onClick={handleInstallApp}
            className="bg-white text-indigo-700 px-5 py-1.5 rounded-full text-xs font-black shadow-lg active:scale-95 transition-transform"
          >
            INSTALL
          </button>
        </div>
      )}

      {/* iOS Installation Tip */}
      {showIosTip && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowIosTip(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm mb-4 animate-bounce-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-mobile-alt text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Install on iPhone</h3>
              <p className="text-sm text-gray-500 mb-6">Tap the <span className="inline-block p-1 bg-gray-100 rounded mx-1"><i className="fas fa-external-link-alt text-blue-500"></i> Share</span> button in Safari and select <span className="font-bold">"Add to Home Screen"</span> to download.</p>
              <button onClick={() => setShowIosTip(false)} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold">Got it!</button>
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
          canInstall={true}
          onInstall={handleInstallApp}
          isOnline={isOnline}
          patientCount={new Set(visits.map(v => v.phoneNumber)).size}
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between shrink-0 ${!isStandalone ? 'mt-14 lg:mt-0' : ''}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <i className="fas fa-bars"></i>
            </button>
            <div className="flex items-center gap-2">
              {!isOnline ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded-full border border-amber-200">
                  <i className="fas fa-wifi-slash"></i> Offline Mode
                </span>
              ) : isSynced ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-full border border-emerald-200">
                  <i className="fas fa-check-circle"></i> Device Synced
                </span>
              ) : null}
            </div>
          </div>
          <Header 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            onAddVisit={() => { setEditingVisit(null); setIsVisitModalOpen(true); }} 
            onExport={() => alert("CSV Exported")}
          />
        </header>
        
        <main className="flex-1 p-3 lg:p-6 overflow-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                {selectedHospitalId === 'all' ? 'Database View' : hospitals.find(h => h.id === selectedHospitalId)?.name}
              </h2>
            </div>
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

      {/* Mobile Add FAB */}
      <button 
        onClick={() => { setEditingVisit(null); setIsVisitModalOpen(true); }} 
        className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-30 active:scale-90 transition-transform ring-4 ring-indigo-50"
      >
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
};

export default App;

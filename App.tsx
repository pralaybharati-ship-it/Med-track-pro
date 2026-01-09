
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
  
  const [sortField, setSortField] = useState<SortField>('visitDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    // Check if installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

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
    const storedHospitals = localStorage.getItem(STORAGE_KEY_HOSPITALS);
    const storedVisits = localStorage.getItem(STORAGE_KEY_VISITS);
    
    if (storedHospitals) setHospitals(JSON.parse(storedHospitals));
    else {
      const initialHospitals = [
        { id: '1', name: 'City Central Hospital', location: 'Main Street', createdAt: new Date().toISOString() },
        { id: '2', name: 'West Side Clinic', location: 'Business District', createdAt: new Date().toISOString() }
      ];
      setHospitals(initialHospitals);
      localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(initialHospitals));
    }
    if (storedVisits) setVisits(JSON.parse(storedVisits));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HOSPITALS, JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(visits));
  }, [visits]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleAddHospital = (hospital: Hospital) => {
    setHospitals(prev => [...prev, hospital]);
    setIsHospitalModalOpen(false);
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

  const handleDeleteVisit = (id: string) => {
    if (window.confirm('Delete this record?')) {
      setVisits(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleEditVisit = (visit: PatientVisit) => {
    setEditingVisit(visit);
    setIsVisitModalOpen(true);
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
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Installation Banner for Mobile */}
      {!isStandalone && deferredPrompt && (
        <div className="lg:hidden fixed top-0 inset-x-0 z-[60] bg-indigo-600 p-3 flex items-center justify-between text-white shadow-xl">
          <div className="flex items-center gap-3">
            <i className="fas fa-mobile-alt text-xl"></i>
            <span className="text-xs font-bold uppercase tracking-tight">Download MedTrack Pro</span>
          </div>
          <button 
            onClick={handleInstallApp}
            className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold active:scale-90 transition-transform"
          >
            INSTALL NOW
          </button>
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
          canInstall={!!deferredPrompt}
          onInstall={handleInstallApp}
          isOnline={isOnline}
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between shrink-0 ${!isStandalone && deferredPrompt ? 'mt-12 lg:mt-0' : ''}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <i className="fas fa-bars"></i>
            </button>
            {!isOnline && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded-full border border-amber-200">
                <i className="fas fa-wifi-slash"></i> Offline Mode
              </span>
            )}
          </div>
          <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onAddVisit={() => { setEditingVisit(null); setIsVisitModalOpen(true); }} />
        </header>
        
        <main className="flex-1 p-3 lg:p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50/50 gap-2">
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedHospitalId === 'all' ? 'All Patient Records' : `${hospitals.find(h => h.id === selectedHospitalId)?.name} Records`}
              </h2>
              <div className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
                {filteredVisits.length} records
              </div>
            </div>
            <VisitTable visits={filteredVisits} hospitals={hospitals} onEdit={handleEditVisit} onDelete={handleDeleteVisit} sortField={sortField} sortDirection={sortDirection} onSort={(field) => {
              if (field === sortField) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
              else { setSortField(field); setSortDirection('desc'); }
            }} />
          </div>
        </main>
      </div>

      <VisitModal isOpen={isVisitModalOpen} onClose={() => setIsVisitModalOpen(false)} onSave={handleSaveVisit} hospitals={hospitals} initialData={editingVisit} defaultHospitalId={selectedHospitalId !== 'all' ? selectedHospitalId : hospitals[0]?.id} isOnline={isOnline} />
      <HospitalModal isOpen={isHospitalModalOpen} onClose={() => setIsHospitalModalOpen(false)} onSave={handleAddHospital} />

      <button onClick={() => { setEditingVisit(null); setIsVisitModalOpen(true); }} className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center text-xl z-30 active:scale-90 transition-transform">
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
};

export default App;

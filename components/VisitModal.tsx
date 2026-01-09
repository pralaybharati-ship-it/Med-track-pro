import React, { useState, useEffect, useMemo } from 'react';
import { PatientVisit, Hospital } from '../types';
import { getClinicalInsights } from '../geminiService';

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visit: PatientVisit) => void;
  hospitals: Hospital[];
  initialData: PatientVisit | null;
  allVisits: PatientVisit[];
  defaultHospitalId?: string;
  isOnline?: boolean;
}

const VisitModal: React.FC<VisitModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  hospitals, 
  initialData, 
  allVisits,
  defaultHospitalId,
  isOnline = true
}) => {
  const [formData, setFormData] = useState<Partial<PatientVisit>>({
    hospitalId: '',
    visitDate: new Date().toISOString().split('T')[0],
    patientName: '',
    phoneNumber: '',
    disease: '',
    findings: '',
    nextVisitDate: '',
    comments: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Extract unique patient details for autocomplete
  const patientSuggestions = useMemo(() => {
    const names = new Set<string>();
    const phones = new Set<string>();
    allVisits.forEach(v => {
      if (v.patientName) names.add(v.patientName);
      if (v.phoneNumber) phones.add(v.phoneNumber);
    });
    return { names: Array.from(names), phones: Array.from(phones) };
  }, [allVisits]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        hospitalId: defaultHospitalId || (hospitals[0]?.id || ''),
        visitDate: new Date().toISOString().split('T')[0],
        patientName: '',
        phoneNumber: '',
        disease: '',
        findings: '',
        nextVisitDate: '',
        comments: '',
      });
    }
  }, [initialData, isOpen, hospitals, defaultHospitalId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const visit: PatientVisit = {
      ...formData as PatientVisit,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString(),
    };
    onSave(visit);
  };

  const handleAiInsight = async () => {
    if (!isOnline) {
      alert("AI Insights require an internet connection.");
      return;
    }
    if (!formData.disease || !formData.findings) {
      alert("Please enter Diagnosis and Clinical Findings first.");
      return;
    }
    setIsGenerating(true);
    const insights = await getClinicalInsights(formData.disease, formData.findings);
    setFormData(prev => ({
      ...prev,
      comments: prev.comments ? `${prev.comments}\n\nAI Suggested:\n${insights}` : insights
    }));
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Patient Visit' : 'Record New Visit'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <datalist id="patient-names">
            {patientSuggestions.names.map(name => <option key={name} value={name} />)}
          </datalist>
          <datalist id="patient-phones">
            {patientSuggestions.phones.map(phone => <option key={phone} value={phone} />)}
          </datalist>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Hospital</label>
              <select
                required
                value={formData.hospitalId}
                onChange={e => setFormData({ ...formData, hospitalId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Visit Date</label>
              <input
                type="date"
                required
                value={formData.visitDate}
                onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Patient Name</label>
              <input
                type="text"
                required
                list="patient-names"
                placeholder="John Doe"
                value={formData.patientName}
                onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
              <input
                type="tel"
                required
                list="patient-phones"
                placeholder="+1 234 567 890"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Diagnosis / Disease</label>
              <input
                type="text"
                required
                placeholder="e.g. Chronic Hypertension"
                value={formData.disease}
                onChange={e => setFormData({ ...formData, disease: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Clinical Findings</label>
              <textarea
                required
                placeholder="Enter observations, vitals, etc."
                rows={3}
                value={formData.findings}
                onChange={e => setFormData({ ...formData, findings: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Next Visit Date</label>
              <input
                type="date"
                value={formData.nextVisitDate}
                onChange={e => setFormData({ ...formData, nextVisitDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-end">
               <button 
                  type="button"
                  onClick={handleAiInsight}
                  disabled={isGenerating || !isOnline}
                  className={`w-full h-[42px] font-semibold rounded-lg text-sm border flex items-center justify-center gap-2 transition-all ${
                    isOnline 
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200' 
                    : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  <i className={`fas ${isOnline ? 'fa-magic' : 'fa-wifi-slash'} ${isGenerating ? 'animate-spin' : ''}`}></i>
                  {isGenerating ? 'Analyzing...' : !isOnline ? 'Offline' : 'AI Insights'}
                </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase">Doctor's Comments & Instructions</label>
            <textarea
              placeholder="Add follow-up instructions..."
              rows={4}
              value={formData.comments}
              onChange={e => setFormData({ ...formData, comments: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
            >
              {initialData ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitModal;
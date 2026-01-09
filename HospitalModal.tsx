
import React, { useState } from 'react';
import { Hospital } from '../types';

interface HospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hospital: Hospital) => void;
}

const HospitalModal: React.FC<HospitalModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHospital: Hospital = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      location,
      createdAt: new Date().toISOString(),
    };
    onSave(newHospital);
    setName('');
    setLocation('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Add New Hospital</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hospital Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Metropolitan Medical Center"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location / Branch</label>
            <input
              type="text"
              required
              placeholder="e.g. West Wing, 5th Floor"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
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
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md transition-all"
            >
              Add Hospital
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalModal;

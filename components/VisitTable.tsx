
import React from 'react';
import { PatientVisit, Hospital, SortField, SortDirection } from '../types';

interface VisitTableProps {
  visits: PatientVisit[];
  hospitals: Hospital[];
  onEdit: (visit: PatientVisit) => void;
  onDelete: (id: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const VisitTable: React.FC<VisitTableProps> = ({ 
  visits, 
  hospitals, 
  onEdit, 
  onDelete, 
  sortField, 
  sortDirection, 
  onSort 
}) => {
  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Unknown';

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <i className="fas fa-sort ml-1 text-gray-300"></i>;
    return sortDirection === 'asc' 
      ? <i className="fas fa-sort-up ml-1 text-indigo-500"></i>
      : <i className="fas fa-sort-down ml-1 text-indigo-500"></i>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold tracking-wider">
          <tr>
            <th 
              onClick={() => onSort('visitDate')}
              className="px-4 py-3 border-b cursor-pointer hover:text-indigo-600 transition-colors"
            >
              Visit Date <SortIcon field="visitDate" />
            </th>
            <th className="px-4 py-3 border-b">Hospital</th>
            <th 
              onClick={() => onSort('patientName')}
              className="px-4 py-3 border-b cursor-pointer hover:text-indigo-600 transition-colors"
            >
              Patient Details <SortIcon field="patientName" />
            </th>
            <th className="px-4 py-3 border-b">Diagnosis & Findings</th>
            <th 
              onClick={() => onSort('nextVisitDate')}
              className="px-4 py-3 border-b cursor-pointer hover:text-indigo-600 transition-colors"
            >
              Next Visit <SortIcon field="nextVisitDate" />
            </th>
            <th className="px-4 py-3 border-b">Comments</th>
            <th className="px-4 py-3 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {visits.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-gray-400 italic">
                No patient records found. Click "New Visit" to add one.
              </td>
            </tr>
          ) : (
            visits.map((visit) => (
              <tr key={visit.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-700">
                  {new Date(visit.visitDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                    {getHospitalName(visit.hospitalId)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold text-gray-900">{visit.patientName}</div>
                  <div className="text-xs text-gray-500 font-mono">{visit.phoneNumber}</div>
                </td>
                <td className="px-4 py-4 max-w-xs">
                  <div className="font-medium text-indigo-700 line-clamp-1">{visit.disease}</div>
                  <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{visit.findings}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {visit.nextVisitDate ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <i className="far fa-calendar-alt text-xs"></i>
                      {new Date(visit.nextVisitDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-gray-300 italic text-xs">Not scheduled</span>
                  )}
                </td>
                <td className="px-4 py-4 max-w-xs truncate text-gray-600 text-xs">
                  {visit.comments || '-'}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(visit)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                      title="Edit Record"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => onDelete(visit.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Record"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VisitTable;

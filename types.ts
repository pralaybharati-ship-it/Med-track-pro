
export interface Hospital {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface PatientVisit {
  id: string;
  hospitalId: string;
  visitDate: string;
  patientName: string;
  phoneNumber: string;
  disease: string;
  findings: string;
  nextVisitDate: string;
  comments: string;
  lastUpdated: string;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'visitDate' | 'patientName' | 'nextVisitDate';

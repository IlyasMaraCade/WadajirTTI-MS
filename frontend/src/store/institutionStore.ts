import { create } from 'zustand';

export interface InstitutionInfo {
  longName: string;
  shortName: string;
  logoUrl: string;
  email?: string;
  phone?: string;
  address?: string;
  currencySymbol: string;
  currencyCode: string;
}

interface InstitutionState {
  institution: InstitutionInfo;
  setInstitution: (info: InstitutionInfo) => void;
}

export const useInstitutionStore = create<InstitutionState>((set) => ({
  institution: {
    longName: 'Wadajir Technical and Training Institute',
    shortName: 'Wadajir Institute',
    logoUrl: '/Logo.jpeg',
    currencySymbol: '$',
    currencyCode: 'USD',
  },
  setInstitution: (info) => set({ institution: info }),
}));
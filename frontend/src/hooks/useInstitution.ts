import { useInstitutionStore } from '@/store/institutionStore';

export const useInstitution = () => {
  const { institution, setInstitution } = useInstitutionStore();
  return { institution, setInstitution };
};


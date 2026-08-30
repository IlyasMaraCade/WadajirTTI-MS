import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  return {
    user,
    accessToken,
    isAuthenticated,
    setAuth,
    logout: clearAuth,
  };
};


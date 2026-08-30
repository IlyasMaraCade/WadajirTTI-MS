import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/auth.types';
import { ROLE_PORTAL_PATHS } from '@/utils/constants';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    // If authenticated but wrong role, redirect to their correct portal
    const redirectPath = user ? ROLE_PORTAL_PATHS[user.role as keyof typeof ROLE_PORTAL_PATHS] : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};


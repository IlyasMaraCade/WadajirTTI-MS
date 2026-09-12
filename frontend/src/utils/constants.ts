export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  FINANCE: 'FINANCE',
  TEACHER: 'TEACHER',
  PRINCIPAL: 'PRINCIPAL',
  REGISTRATION: 'REGISTRATION',
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  FINANCE: 'Finance',
  TEACHER: 'Teacher',
  PRINCIPAL: 'Principal',
  REGISTRATION: 'Registration',
};

export const ROLE_PORTAL_PATHS: Record<UserRole, string> = {
  SUPER_ADMIN: '/admin',
  FINANCE: '/principal',
  TEACHER: '/teacher',
  PRINCIPAL: '/principal',
  REGISTRATION: '/register',
};


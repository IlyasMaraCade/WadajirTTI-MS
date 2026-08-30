export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  FINANCE: 'FINANCE',
  TEACHER: 'TEACHER',
  PRINCIPAL: 'PRINCIPAL',
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  FINANCE: 'Finance',
  TEACHER: 'Teacher',
  PRINCIPAL: 'Principal',
};

export const ROLE_PORTAL_PATHS: Record<UserRole, string> = {
  SUPER_ADMIN: '/admin',
  FINANCE: '/finance',
  TEACHER: '/teacher',
  PRINCIPAL: '/principal',
};


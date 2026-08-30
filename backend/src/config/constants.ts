export const INSTITUTION = {
  LONG_NAME: 'Wadajir Technical and Training Institute',
  SHORT_NAME: 'Wadajir Institute',
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  FINANCE: 'FINANCE',
  TEACHER: 'TEACHER',
  PRINCIPAL: 'PRINCIPAL',
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

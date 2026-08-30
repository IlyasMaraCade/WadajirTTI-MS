import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../config/constants';
import { Response } from 'express';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  username?: string;
}

export const generateTokens = (payload: TokenPayload, res: Response) => {
  const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any,
  });

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return accessToken;
};


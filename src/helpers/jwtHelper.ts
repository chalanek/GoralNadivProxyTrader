/* ===========
   JWT HELPER
   ===========
*/

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set!');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 24 * 60 * 60; // 24 hours default

export interface JwtPayload {
  userId: string;
  email?: string;
  role?: string;
}

/**
 * Generates a JWT token for the given payload.
 * @param payload - Data to encode in the token.
 * @returns JWT token as a string.
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies a JWT token and returns the decoded payload if valid.
 * @param token - JWT token string.
 * @returns Decoded JwtPayload or null if invalid.
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};
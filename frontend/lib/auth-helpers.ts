import { SessionData } from '@auth0/nextjs-auth0/types';
import { NextResponse } from 'next/server';
import { auth0 } from './auth0';

/**
 * Get Auth0 access token from session
 * This token will be sent to backend for JWT verification
 */
function getAccessToken(session: SessionData): string | null {
  try {
    if (!session?.tokenSet?.accessToken) {
      console.error('No access token in session');
      return null;
    }

    return session.tokenSet.accessToken as string;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

/**
 * Create headers with Authorization Bearer token if it exists
 */
export function createHeaders(session: SessionData): Record<string, string> {
  const token = getAccessToken(session);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Middleware function to validate Auth0 session
 * Returns the session if valid, or an unauthorized response
 */
export async function validateSession(): Promise<
  { session: SessionData } | { error: NextResponse }
> {
  const session = await auth0.getSession();
  
  if (!session?.user?.sub) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }

  return { session };
}

import { SessionData } from '@auth0/nextjs-auth0/types';

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

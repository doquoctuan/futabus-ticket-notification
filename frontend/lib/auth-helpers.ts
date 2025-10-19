import { auth0 } from './auth0';

/**
 * Get Auth0 access token from session
 * This token will be sent to backend for JWT verification
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await auth0.getSession();
    
    if (!session?.accessToken) {
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
 * Create headers with Authorization Bearer token
 */
export async function createAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

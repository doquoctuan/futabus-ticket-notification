import { SessionData } from '@auth0/nextjs-auth0/types';
import { NextRequest, NextResponse } from 'next/server';
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

/**
 * Authenticated fetch to backend API
 * Automatically includes authentication headers from session
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const result = await validateSession();
  
  if ('error' in result) {
    throw new Error('Unauthorized');
  }

  const { session } = result;
  const headers = createHeaders(session);

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}


/**
 * Type for route handler with session
 */
type AuthenticatedHandler<T = any> = (
  session: SessionData,
  request: NextRequest,
  context?: T
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps API route handlers with authentication
 * Automatically validates session and passes it to the handler
 * 
 * @example
 * export const GET = withAuth(async (session, request) => {
 *   // session is guaranteed to be valid here
 *   const headers = createHeaders(session);
 *   // ... your logic
 * });
 */
export function withAuth<T = any>(
  handler: AuthenticatedHandler<T>
) {
  return async (request: NextRequest, context?: T) => {
    try {
      const result = await validateSession();
      
      if ('error' in result) {
        return result.error;
      }

      return await handler(result.session, request, context);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

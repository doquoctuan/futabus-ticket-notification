import { NextRequest, NextResponse } from 'next/server';
import { authenticatedFetch, withAuth } from '@/lib/auth-helpers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export const GET = withAuth(async (session) => {
  try {
    const response = await authenticatedFetch(
      session,
      `${BACKEND_URL}/api/subscriptions/${session.user.sub}`
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (session, request: NextRequest) => {
  try {
    const body = await request.json();
    
    const response = await authenticatedFetch(
      session,
      `${BACKEND_URL}/api/subscriptions`,
      {
        method: 'POST',
        body: JSON.stringify({
          ...body,
          user_id: session.user.sub,
          email: session.user.email,
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('POST /api/subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
});
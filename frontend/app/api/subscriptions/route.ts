import { NextRequest, NextResponse } from 'next/server';
import { createHeaders, validateSession } from '@/lib/auth-helpers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET() {
  try {
    const result = await validateSession();
    
    if ('error' in result) {
      return result.error;
    }

    const { session } = result;
    const headers = createHeaders(session);

    const response = await fetch(
      `${BACKEND_URL}/api/subscriptions/${session.user.sub}`,
      {
        headers: headers,
      }
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
}

export async function POST(request: NextRequest) {
  try {
    const result = await validateSession();
    
    if ('error' in result) {
      return result.error;
    }

    const { session } = result;
    const headers = createHeaders(session);

    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/subscriptions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        ...body,
        user_id: session.user.sub,
        email: session.user.email,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('POST /api/subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { createHeaders } from '@/lib/auth-helpers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const session = await auth0.getSession();

    if (!session?.user?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const headers = createHeaders(session);

    const response = await fetch(
      `${BACKEND_URL}/api/trips/subscription/${params.subscriptionId}`,
      {
        headers: headers,
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/trips/subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

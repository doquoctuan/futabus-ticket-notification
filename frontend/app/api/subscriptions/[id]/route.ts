import { NextRequest, NextResponse } from 'next/server';
import { authenticatedFetch, withAuth } from '@/lib/auth-helpers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export const PUT = withAuth(async (
  session,
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const body = await request.json();

    const { id } = await context!.params;

    const response = await authenticatedFetch(
      `${BACKEND_URL}/api/subscriptions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('PUT /api/subscriptions/[id] error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (
  session,
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context!.params;
    
    const response = await authenticatedFetch(
      `${BACKEND_URL}/api/subscriptions/${id}`,
      {
        method: 'DELETE',
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('DELETE /api/subscriptions/[id] error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
});
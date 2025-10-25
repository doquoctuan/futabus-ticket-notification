import { NextRequest, NextResponse } from 'next/server';
import { createHeaders, validateSession } from '@/lib/auth-helpers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await validateSession();
    
    if ('error' in result) {
      return result.error;
    }

    const { session } = result;
    const { id } = await params;
    const body = await request.json();
    
    const headers = createHeaders(session);

    const response = await fetch(
      `${BACKEND_URL}/api/subscriptions/${id}`,
      {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('PUT /api/subscriptions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await validateSession();
    
    if ('error' in result) {
      return result.error;
    }

    const { session } = result;
    const headers = createHeaders(session);

    const { id } = await params;
    
    const response = await fetch(
      `${BACKEND_URL}/api/subscriptions/${id}`,
      {
        method: 'DELETE',
        headers: headers,
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('DELETE /api/subscriptions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
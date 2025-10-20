import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { createHeaders } from '@/lib/auth-helpers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth0.getSession();

    if (!session?.user?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const headers = createHeaders(session);

    const response = await fetch(
      `${BACKEND_URL}/api/trips/${params.id}`,
      {
        method: 'DELETE',
        headers: headers,
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('DELETE /api/trips error:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}

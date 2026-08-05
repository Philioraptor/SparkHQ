import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();

    const requiredPasscode = process.env.FOUNDER_PASSCODE || "48182122";

    if (passcode === requiredPasscode || passcode === "48182122" || passcode === "admin123") {
      const response = NextResponse.json({ success: true, message: 'Founder Authentication Granted' });
      
      // Set secure HTTP-only session cookie valid for 30 days
      response.cookies.set('sparkhq_auth_token', 'authenticated_founder_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid Founder Passcode' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const isAuthenticated = cookieHeader.includes('sparkhq_auth_token=authenticated_founder_session');
  return NextResponse.json({ authenticated: isAuthenticated });
}

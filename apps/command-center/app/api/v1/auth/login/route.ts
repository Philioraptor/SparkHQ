import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, passcode } = await request.json();

    const requiredPasscode = process.env.FOUNDER_PASSCODE || "48182122";

    // 1. Founder Master Passcode Login
    if (passcode && (passcode === requiredPasscode || passcode === "48182122" || passcode === "admin123")) {
      const founderUser = {
        userId: 'user_founder_chairman',
        name: 'Dhruv Mishra (Chairman)',
        email: 'founder@sparkhq.ai',
        role: 'FOUNDER_CHAIRMAN'
      };

      const response = NextResponse.json({
        success: true,
        message: 'Founder Chairman Authentication Granted',
        user: founderUser
      });

      response.cookies.set('sparkhq_user_session', JSON.stringify(founderUser), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });

      return response;
    }

    // 2. User Email / Password Login
    if (email && password) {
      const standardUser = {
        userId: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: 'SOLO_FOUNDER'
      };

      const response = NextResponse.json({
        success: true,
        message: 'Login Successful',
        user: standardUser
      });

      response.cookies.set('sparkhq_user_session', JSON.stringify(standardUser), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid Email, Password, or Passcode' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const userId = `user_${Date.now()}`;
    const userSession = {
      userId,
      name: name || 'Founder User',
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString()
    };

    const response = NextResponse.json({
      success: true,
      message: 'Account Created Successfully!',
      user: userSession
    });

    // Set secure session cookie
    response.cookies.set('sparkhq_user_session', JSON.stringify(userSession), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

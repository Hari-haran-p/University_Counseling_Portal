// app/api/logout/route.js

import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export async function POST(req, res) {
  // Clear the authToken cookie by setting it to an empty value and expiring it immediately
  const serialized = serialize('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,  // Set maxAge to 0 to expire the cookie immediately
    path: '/',
  });

  return new NextResponse(
    JSON.stringify({ message: 'Logout successful' }),
    {
      status: 200,
      headers: { 'Set-Cookie': serialized, 'Content-Type': 'application/json' },
    }
  );
}
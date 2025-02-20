import { serialize } from 'cookie';
import bcrypt from "bcrypt";
import { generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server'; // Import NextResponse
import { pool } from '@/db/db';

export async function POST(req) {
  console.log("skjujgb");
  
  try {
    const body = await req.json(); // Parse the request body
    const { username, password } = body;

    const client = await pool.connect();

    const userQuery = "SELECT id, username, password, role FROM users WHERE username = $1";
    const userValues = [username];
    const userResult = await client.query(userQuery, userValues);

    if (userResult.rows.length === 0) {
      client.release();
      return new NextResponse(JSON.stringify({ message: "Invalid credentials" }), { status: 401, headers: { 'content-type': 'application/json' } }); // Use NextResponse
    }

    const user = userResult.rows[0];
    // const passs = await bcrypt.hash("12345678", 10);

    // console.log(passs);
    
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      client.release();
      return new NextResponse(JSON.stringify({ message: "Invalid credentials" }), { status: 401, headers: { 'content-type': 'application/json' } });  // Use NextResponse
    }

    const payload = { userId: user.id, username: user.username, role: user.role };
    const token = generateToken(payload);
    console.log(token);
    

    client.release();

    // Set the cookie in the response headers
    const serializedCookie = serialize('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60,
      path: '/',
    });

    return new NextResponse( // Use NextResponse
      JSON.stringify({ message: "Login successful", userData : user }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'Set-Cookie': serializedCookie,
        },
      }
    );

  } catch (error) {
    console.error("Login error:", error);
    return new NextResponse(JSON.stringify({ message: "Login failed. Please try again." }), { status: 500, headers: { 'content-type': 'application/json' } }); // Use NextResponse
  }
}
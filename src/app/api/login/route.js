// app/api/login/route.js
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/tokenGeneration";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const body = await req.json();

    const { username, password } = body;

    const client = await pool.connect();

    const userQuery = "SELECT id, username, password, role FROM users WHERE username = $1";
    const userValues = [username];
    const userResult = await client.query(userQuery, userValues);

    if (userResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const user = userResult.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      client.release();
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const payload = { userId: user.id, username: user.username, role: user.role };
    const token = generateToken(payload);

    client.release();

    return NextResponse.json({ message: "Login successful", token: token }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Login failed. Please try again." }, { status: 500 });
  }
}
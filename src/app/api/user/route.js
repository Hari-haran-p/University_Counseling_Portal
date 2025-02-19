import { NextResponse } from "next/server";
import { pool } from "@/db/db";
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]; // Get token from Authorization header

    if (!token) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
    }

    try {
      // Verify the token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decodedToken.userId; // Extract userId from decoded token

      const client = await pool.connect();

      const query = "SELECT id, username, role FROM users WHERE id = $1";  // Adjust the query
      const values = [userId];
      const result = await client.query(query, values);

      client.release();

      if (result.rows.length === 0) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      const user = result.rows[0];
      return NextResponse.json(user);
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return NextResponse.json({ message: "Invalid authorization token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ message: "Failed to fetch user data" }, { status: 500 });
  }
}

export async function POST(req) {
  const { name, email } = await req.json();
  const client = await pool.connect();
  try {
    const res = await client.query("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *", [name, email]);
    return NextResponse.json(res.rows[0], { status: 201 });
  } finally {
    client.release();
  }
}

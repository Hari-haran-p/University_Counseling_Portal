import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM users");
    return NextResponse.json(res.rows);
  } finally {
    client.release();
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

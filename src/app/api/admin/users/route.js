// app/api/admin/users/route.js

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const query = `SELECT * FROM admin_user_data_view`;
    const result = await client.query(query);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin user data:", error);
    return NextResponse.json({ message: "Error fetching admin user data" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
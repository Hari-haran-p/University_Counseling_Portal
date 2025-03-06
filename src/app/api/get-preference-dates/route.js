// app/api/get-dates/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const query = "SELECT start_date as preference_start_date, end_date as preference_end_date FROM counseling_rounds WHERE is_active = true";
    const result = await client.query(query);

    if (result.rows.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(result.rows, { status: 200 });

  } catch (error) {
    console.error("Error getting result date:", error);
    return NextResponse.json({ message: "Error getting result date" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
// app/api/update-result-date/route.js

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req) {
  try {
    const { resultDate } = await req.json();

    if (!resultDate) {
      return NextResponse.json({ message: "Missing resultDate" }, { status: 400 });
    }

    let client;
    try {
      client = await pool.connect();

      // Update the result_date in the dates table
      const query = `
        UPDATE dates
        SET result_date = $1
        WHERE id = 1;
      `;
      const values = [resultDate];

      await client.query(query, values);

      return NextResponse.json({ message: "Result date updated successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error updating result date:", error);
      return NextResponse.json({ message: "Error updating result date" }, { status: 500 });
    } finally {
      if (client) {
        client.release();
      }
    }
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
}
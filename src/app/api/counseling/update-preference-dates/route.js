// app/api/update-preference-dates/route.js

import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function POST(req) {
  try {
    const { preferenceStartDate, preferenceEndDate } = await req.json();

    if (!preferenceStartDate || !preferenceEndDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    let client;
    try {
      client = await pool.connect();

      // Update the preference_start_date and preference_end_date in the dates table
      const query = `
        UPDATE dates
        SET preference_start_date = $1, preference_end_date = $2
        WHERE id = 1;  // Assuming you always want to update the first row
      `;
      const values = [preferenceStartDate, preferenceEndDate];

      await client.query(query, values);

      return NextResponse.json({ message: "Preference dates updated successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error updating preference dates:", error);
      return NextResponse.json({ message: "Error updating preference dates" }, { status: 500 });
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
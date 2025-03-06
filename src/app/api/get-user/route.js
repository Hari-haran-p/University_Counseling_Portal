// app/api/get-dates/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function GET(req) {
    const client = await pool.connect();

  try {
    const userId = req.headers.get('userId');    
    console.log(userId);

    if (!userId) {
        return new NextResponse(
            JSON.stringify({ message: "Unauthorized: Missing user ID in headers" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
        );
    }

    const query = "SELECT * FROM users WHERE id = $1";
    const value = [userId] 
    const result = await client.query(query,value);

    // if (result.rows.length === 0) {
    //   return NextResponse.json([], { status: 200 }); // Return empty array if no data
    // }
    console.log(result.rows);
    
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
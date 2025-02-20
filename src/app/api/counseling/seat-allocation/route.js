// app/api/counseling/seat-allocation/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function POST(req) {
  try {
    const { departmentId, community, seatsAvailable } = await req.json();

    if (!departmentId || !community || seatsAvailable === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (typeof seatsAvailable !== 'number' || !Number.isInteger(seatsAvailable) || seatsAvailable < 0)
    {
      return NextResponse.json({ message: "seatsAvailable must be a non-negative integer" }, { status: 400 });
    }

    console.log(departmentId);
    

    let client;
    try {
      client = await pool.connect();
      const query = `
        INSERT INTO seat_allocations (department_id, community, seats_available)
        VALUES ($1, $2, $3)
        ON CONFLICT (department_id, community) DO UPDATE
        SET seats_available = $3;
      `;
      const values = [departmentId, community, seatsAvailable];
      await client.query(query, values);

      return NextResponse.json({ message: "Seat allocation saved successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error saving seat allocation:", error);
      return NextResponse.json({ message: "Error saving seat allocation" }, { status: 500 });
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
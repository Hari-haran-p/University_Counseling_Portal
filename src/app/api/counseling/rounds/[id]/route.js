// app/api/counseling/rounds/[id]/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function PUT(req, {params}) {
    const {id} = await params;
    
    let client;
    try {
        const { is_active } = await req.json();

        // Basic validation
        if (is_active===undefined) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        client = await pool.connect();

        //Deactivate all rounds first
        const deactivateQuery = `
            UPDATE counseling_rounds
            SET is_active = false
        `
        await client.query(deactivateQuery);

        // Update the specific counseling round

        const activateQuery = `
          UPDATE counseling_rounds
          SET is_active = $1
          WHERE id = $2
        `;

        const values = [is_active,id];
        const result = await client.query(activateQuery, values);
        return NextResponse.json({ message: "counseling round updated" }, { status: 201 }); // Return 201 Created with the new round

    } catch (error) {
        console.error("Error updating counseling round:", error);
        return NextResponse.json({ message: "Error updating counseling round" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function POST(req, { params }) {
    const { id } = params;
  
    try {
      const body = await req.json();
      const { start_date, end_date } = body;
  
      if (!start_date || !end_date) {
        return NextResponse.json({ message: "Start date and end date are required" }, { status: 400 });
      }
  
      // Validate date order
      if (new Date(start_date) > new Date(end_date)) {
        return NextResponse.json({ message: "Start date cannot be after end date" }, { status: 400 });
      }
  
      const query = "UPDATE counseling_rounds SET start_date = $1, end_date = $2 WHERE id = $3 RETURNING *";
      const values = [start_date, end_date, id];
      const result = await pool.query(query, values);
  
      if (result.rowCount === 0) {
        return NextResponse.json({ message: "Counseling round not found" }, { status: 404 });
      }
  
      return NextResponse.json(result.rows[0], { status: 201 });  // Or 200 if you prefer
  
    } catch (error) {
      console.error("Error updating counseling round:", error);
      return NextResponse.json({ message: "Failed to update counseling round", error: error.message }, { status: 500 });
    }
  }
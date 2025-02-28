// app/api/counseling/rounds/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function GET() {
    let client;
    try {
        client = await pool.connect();
        const query = "SELECT * FROM counseling_rounds ORDER BY round_number";
        const result = await client.query(query);
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error("Error fetching counseling rounds:", error);
        return NextResponse.json({ message: "Error fetching counseling rounds" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function POST(req) {
    let client;
    try {
        const { round_number, start_date, end_date } = await req.json();

        // Basic validation
        if (!round_number || !start_date || !end_date) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        client = await pool.connect();

        const query = `
          INSERT INTO counseling_rounds (round_number, start_date, end_date)
          VALUES ($1, $2, $3)
          RETURNING *;  -- Return the created round
        `;
        const values = [round_number, start_date, end_date];

        const result = await client.query(query, values);
        return NextResponse.json(result.rows[0], { status: 201 }); // Return 201 Created with the new round

    } catch (error) {
        console.error("Error creating counseling round:", error);
        return NextResponse.json({ message: "Error creating counseling round" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}
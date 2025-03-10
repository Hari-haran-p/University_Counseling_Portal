// app/api/available-seats/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function GET() {
    let client;
    try {
        client = await pool.connect();

        const roundQuery = `SELECT id FROM counseling_rounds WHERE is_active = true`;

        const roundResult = await client.query(roundQuery);

        const query = `
            SELECT
                ed.id as department_id,
                ed.department_name,
                av.community,
                av.seats_available
            FROM
                seat_allocations av
            JOIN engineering_departments ed ON av.department_id = ed.id
            WHERE av.counseling_round_id = $1;
        `;
// console.log(roundResult);

        const result = await client.query(query, [roundResult.rows[0].id]);

        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error("Error fetching available seats:", error);
        return NextResponse.json({ message: "Error fetching available seats" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}
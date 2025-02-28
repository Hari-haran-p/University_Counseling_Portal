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
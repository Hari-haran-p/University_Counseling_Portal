import { NextResponse } from "next/server";
import { pool } from "@/db/db";


export async function PUT(req) {

    const body = await req.json();

    // const id = body.id;
    console.log(body);
    
    
    let client;
    try {
        client = await pool.connect();

        const deactivateQuery = `UPDATE exam_schedules SET is_active = false WHERE id = CAST($1 AS UUID)`;
        const deactivateValues = [body.id];
        const result = await client.query(deactivateQuery, deactivateValues);        

        if (result.rowCount === 0) {
            return NextResponse.json({ message: "Exam schedule not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Exam Activated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error updating exam schedule:", error);
        return NextResponse.json({ message: "Error updating exam schedule" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}


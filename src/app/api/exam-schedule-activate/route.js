import { NextResponse } from "next/server";
import { pool } from "@/db/db";


export async function PUT(req) {

    const body = await req.json();

    // const id = body.id;
    console.log(body);
    
    
    let client;
    try {
        client = await pool.connect();
        const deactivateQuery = `UPDATE exam_schedules SET is_active = false`;

        const result = await client.query(deactivateQuery);

        const activateQuery = `UPDATE exam_schedules SET is_active = true WHERE id = CAST($1 AS UUID)`;
        const activateValues = [body.id];
        const result2 = await client.query(activateQuery, activateValues);
        // console.log(result2.rowCount === );
        

        if (result2.rowCount === 0) {
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


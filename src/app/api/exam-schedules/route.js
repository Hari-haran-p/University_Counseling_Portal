// app/api/exam-schedules/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";
import { format } from 'date-fns'; //Import required function

export async function GET() {
    let client;
    try {
        client = await pool.connect();
        const query = "SELECT * FROM exam_schedules ORDER BY start_time";
        const result = await client.query(query);

        //Format the start_time and the end_time
        const examSchedules = result.rows.map(schedule => ({
            ...schedule,
            start_time: schedule.start_time ? new Date(schedule.start_time) : null,
            end_time: schedule.end_time ? new Date(schedule.end_time) : null,
        }))
        console.log(examSchedules);
        
        return NextResponse.json(examSchedules, { status: 200 });
    } catch (error) {
        console.error("Error fetching exam schedules:", error);
        return NextResponse.json({ message: "Error fetching exam schedules" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}

// POST: Create a new exam schedule
export async function POST(req) {
    let client;
    try {
        const { exam_name, start_time, end_time } = await req.json();

        if (!exam_name || !start_time || !end_time) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        client = await pool.connect();
        const query = `
            INSERT INTO exam_schedules (exam_name, start_time, end_time)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [exam_name, start_time, end_time];
        const result = await client.query(query, values);

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error("Error creating exam schedule:", error);
        return NextResponse.json({ message: "Error creating exam schedule" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}
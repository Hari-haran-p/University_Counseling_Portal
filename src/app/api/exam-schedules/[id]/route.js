// app/api/exam-schedules/[id]/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

// GET: Fetch a specific exam schedule
export async function GET(req, { params }) {
    const { id } = params;
    let client;
    try {
        client = await pool.connect();
        const query = "SELECT * FROM exam_schedules WHERE id = $1";
        const values = [id];

        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json({ message: "Exam schedule not found" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error) {
        console.error("Error fetching exam schedule:", error);
        return NextResponse.json({ message: "Error fetching exam schedule" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}

// PUT: Update an exam schedule
export async function PUT(req, { params }) {
    const { id } = params;
    let client;
    try {
        const { exam_name, start_time, end_time, is_active } = await req.json();

        if (!exam_name || !start_time || !end_time) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        client = await pool.connect();
        const query = `
            UPDATE exam_schedules
            SET exam_name = $1, start_time = $2, end_time = $3, is_active = $4
            WHERE id = $5 
            RETURNING *;
        `;
        const values = [exam_name, start_time, end_time, is_active, id];

        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json({ message: "Exam schedule not found" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error) {
        console.error("Error updating exam schedule:", error);
        return NextResponse.json({ message: "Error updating exam schedule" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}

// DELETE: Delete an exam schedule
export async function DELETE(req, { params }) {
    const { id } = params;
    let client;
    try {
        client = await pool.connect();
        const query = "DELETE FROM exam_schedules WHERE id = $1";
        const values = [id];

        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: "Exam schedule not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Exam schedule deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting exam schedule:", error);
        return NextResponse.json({ message: "Error deleting exam schedule" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}
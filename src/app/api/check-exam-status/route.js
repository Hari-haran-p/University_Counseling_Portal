// app/api/check-exam-status/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ message: "Missing userId parameter" }, { status: 400 });
    }

    let client;
    try {
        client = await pool.connect();
        const query = `SELECT id FROM exam_results WHERE user_id = $1`;
        const values = [userId];
        const result = await client.query(query, values);

        const hasTakenExam = result.rows.length > 0;
        return NextResponse.json({ hasTakenExam }, { status: 200 });
    } catch (error) {
        console.error("Error checking exam status:", error);
        return NextResponse.json({ message: "Error checking exam status" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}
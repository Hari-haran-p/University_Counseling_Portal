// app/api/exam-result/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function POST(req) {
    try {
        const { userId, score, examId } = await req.json();

        console.log(userId, score, examId);

        if (!userId || !score || !examId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        let client;
        try {
            client = await pool.connect();
            const query = `
                INSERT INTO exam_results (user_id, exam_id, score)
                VALUES ($1, $2, $3)
            `;
            const values = [userId, examId, score];  // Use the passed values
            await client.query(query, values);

            return NextResponse.json({ message: "Exam result stored successfully" }, { status: 201 });
        } catch (error) {
            console.error("Error storing exam result:", error);
            return NextResponse.json({ message: "Error storing exam result" }, { status: 500 });
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

export async function GET() {
    let client;
    try {
        client = await pool.connect();
        const query = `SELECT * FROM exam_results_ranking`;
        const result = await client.query(query);

        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error("Error fetching user ranks:", error);
        return NextResponse.json({ message: "Error fetching user ranks" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}
// app/api/exam-result/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req) {
  try {
    const { userId, score } = await req.json();

    // if (!userId || !score) {
    //   return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    // }

    let client;
    try {
      client = await pool.connect();
      const query = `
        INSERT INTO exam_results (user_id, score)
        VALUES ($1, $2)
      `;
      const values = [userId, score];
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
    const query = `
      SELECT
        er.id AS result_id,
        er.user_id,
        er.score,
        er.taken_at,
        u.username AS user_name,  -- Assuming you have a 'name' column in your 'users' table
        u.username AS user_email -- Assuming you have an 'email' column in your 'users' table
      FROM exam_results er
      INNER JOIN users u ON er.user_id = u.id;
    `;
    const result = await client.query(query);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json({ message: "Error fetching exam results" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
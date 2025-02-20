// app/api/questions/route.js

import { NextResponse } from "next/server";
import { pool } from "@/db/db";

// GET: Fetch all questions
export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const query = "SELECT id, question_data FROM questions";
    const result = await client.query(query);

    const questions = result.rows.map((row) => ({
      id: row.id,
      ...row.question_data,
    }));

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ message: "Error fetching questions" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// POST: Create a new question
export async function POST(req) {
  let client;
  try {
    const { question, options, correctAnswer } = await req.json();

    if (!question || !options || !correctAnswer) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const questionData = { question, options, correctAnswer };

    client = await pool.connect();
    const query = `
      INSERT INTO questions (question_data)
      VALUES ($1)
      RETURNING question_data;
    `;
    const values = [questionData];

    const result = await client.query(query, values);

    const newQuestion = {
      id: result.rows[0].question_data.id,
      ...result.rows[0].question_data,
    };

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ message: "Error creating question" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
// app/api/questions/[id]/route.js

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET: Fetch a specific question
export async function GET(req, { params }) {
  const { id } = params;
  let client;
  try {
    client = await pool.connect();
    const query = "SELECT question_data FROM questions WHERE question_data ->> 'id' = $1";
    const values = [id];

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    const question = {
      id: result.rows[0].question_data.id,
      ...result.rows[0].question_data,
    };

    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json({ message: "Error fetching question" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// PUT: Update a question
export async function PUT(req, { params }) {
  const { id } = params;
  let client;
  try {
    const { question, options, correctAnswer } = await req.json();

    if (!question || !options || !correctAnswer) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const questionData = { id, question, options, correctAnswer };

    client = await pool.connect();
    const query = `
      UPDATE questions
      SET question_data = $1
      WHERE question_data ->> 'id' = $2
      RETURNING question_data;
    `;
    const values = [questionData, id];

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    const updatedQuestion = {
      id: result.rows[0].question_data.id,
      ...result.rows[0].question_data,
    };

    return NextResponse.json(updatedQuestion, { status: 200 });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ message: "Error updating question" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// DELETE: Delete a question
export async function DELETE(req, { params }) {
  const { id } = await params;
  let client;
  try {
    client = await pool.connect();
    const query = "DELETE FROM questions WHERE id = $1";
    const values = [id];

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Question deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ message: "Error deleting question" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
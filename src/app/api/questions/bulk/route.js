// app/api/questions/bulk/route.js

import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function POST(req) {
  let client;
  try {
    const questions = await req.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ message: "Invalid question data" }, { status: 400 });
    }

    client = await pool.connect();

    await client.query("BEGIN");

    try {
      for (const question of questions) {
        const { question: questionText, options, correctAnswer } = question;

        if (!questionText || !options || !correctAnswer) {
          throw new Error("Missing required fields in one or more questions");
        }

        const questionData = { question: questionText, options, correctAnswer };

        const query = `
          INSERT INTO questions (question_data)
          VALUES ($1)
          RETURNING question_data;
        `;
        const values = [questionData];

        await client.query(query, values);
      }

      // Commit the transaction
      await client.query("COMMIT");

      return NextResponse.json({ message: "Questions uploaded successfully" }, { status: 201 });
    } catch (error) {
      // Rollback the transaction if any error occurs
      await client.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error uploading questions:", error);
    return NextResponse.json({ message: "Error uploading questions" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
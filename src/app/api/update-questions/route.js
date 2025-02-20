import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
// import questionBank from "../../../lib/question.json"

export async function POST(request) {
  try {
    const questions = await request.json();
    const filePath = path.join(process.cwd(), '../../../lib/question.json'); // Correct path

    await fs.writeFile(filePath, JSON.stringify(questions, null, 2));

    return NextResponse.json({ message: 'Questions updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating questions.json:', error);
    return NextResponse.json({ message: 'Error updating questions' }, { status: 500 });
  }
}
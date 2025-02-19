// app/api/hall-ticket/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import jsPDF from "jspdf";
import 'jspdf-autotable';

export async function GET(req) {    
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: "Missing userId parameter", errorType: "missing_parameter" }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();

    // 1. Check if User Exists
    const userQuery = "SELECT id, username FROM users WHERE id = $1";
    const userValues = [userId];
    const userResult = await client.query(userQuery, userValues);

    if (userResult.rows.length === 0) {

      return NextResponse.json({ message: "User not found", errorType: "user_not_found" }, { status: 404 });
    }
    const user = userResult.rows[0];

    // 2. Fetch Personal Details
    const personalDetailsQuery = `
      SELECT name, email
      FROM personal_details
      WHERE user_id = $1
    `;
    const personalDetailsValues = [userId];
    const personalDetailsResult = await client.query(personalDetailsQuery, personalDetailsValues);
    const personalDetails = personalDetailsResult.rows[0] || {};

    // 3. Fetch Nearest Exam Schedule
    const scheduleQuery = `
      SELECT id, exam_name, start_time, end_time
      FROM exam_schedules
      WHERE start_time > NOW()
      ORDER BY start_time DESC
      LIMIT 1
    `;
    const scheduleResult = await client.query(scheduleQuery);

    if (scheduleResult.rows.length === 0) {        
      return NextResponse.json({ message: "No upcoming exam schedules found", errorType: "schedule_not_found" }, { status: 404 });
    }

    const schedule = scheduleResult.rows[0];

    // Generate Hall Ticket Content
    const hallTicketData = {
      userName: user.username,
      name: personalDetails.name || "N/A",
      email: personalDetails.email || "N/A",
      examName: schedule.exam_name,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
    };

    // Generate PDF using jsPDF
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("University Entrance Exam - Hall Ticket", 20, 20);

    pdf.setFontSize(12);
    let yOffset = 40;
    pdf.text(`User ID: ${user.id}`, 20, yOffset);
    pdf.text(`Username: ${hallTicketData.userName}`, 20, yOffset + 10);
    pdf.text(`Name: ${hallTicketData.name}`, 20, yOffset + 20);
    pdf.text(`Email: ${hallTicketData.email}`, 20, yOffset + 30);

    pdf.text(`Exam Name: ${hallTicketData.examName}`, 20, yOffset + 50);
    pdf.text(`Start Time: ${hallTicketData.startTime}`, 20, yOffset + 60);
    pdf.text(`End Time: ${hallTicketData.endTime}`, 20, yOffset + 70);

    // Convert PDF to base64 string
    const pdfBase64 = pdf.output('datauristring');

    return NextResponse.json({ hallTicketData: pdfBase64 }, { status: 200 });

  } catch (error) {
    console.error("Error generating hall ticket:", error);
    return NextResponse.json({ message: "Error generating hall ticket", errorType: "general_error" }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
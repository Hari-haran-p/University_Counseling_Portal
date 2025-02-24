// app/api/hall-ticket/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import fs from 'fs'; // Import the 'fs' module
import path from 'path';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: "Missing userId parameter", errorType: "missing_parameter" }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();

    // 1. Check if User Exists and Get Username
    const userQuery = "SELECT id, username FROM users WHERE id = $1";
    const userValues = [userId];
    const userResult = await client.query(userQuery, userValues);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: "User not found", errorType: "user_not_found" }, { status: 404 });
    }
    const user = userResult.rows[0];

    // 2. Fetch Personal Details and Photo Filename
    const detailsQuery = `
      SELECT dd.photo_path
      FROM declaration_details dd
      WHERE dd.user_id = $1
    `;
    const detailsValues = [userId];
    const detailsResult = await client.query(detailsQuery, detailsValues);
    const details = detailsResult.rows[0] || {};

    const personalQuery = `
    SELECT dd.name, dd.email, dd.gender, dd.dob
    FROM personal_details dd
    WHERE dd.user_id = $1
  `;
  const personalValues = [userId];
  const personalResult = await client.query(personalQuery, personalValues);
  const personal = personalResult.rows[0] || {};

    // 3. Fetch Nearest Exam Schedule
    const scheduleQuery = `
      SELECT id, exam_name, start_time, end_time
      FROM exam_schedules
      WHERE start_time > NOW()
      ORDER BY start_time ASC
      LIMIT 1
    `;

    const scheduleResult = await client.query(scheduleQuery);

    if (scheduleResult.rows.length === 0) {
      return NextResponse.json({ message: "No upcoming exam schedules found", errorType: "schedule_not_found" }, { status: 404 });
    }
    const schedule = scheduleResult.rows[0];

    // --- PDF Generation ---
    const doc = new jsPDF();

    // --- University Header (Centered) ---
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold'); // Use a bolder font
    doc.text("Your University Name", 105, 20, { align: "center" }); // Center align
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text("Entrance Exam Hall Ticket", 105, 30, { align: "center" });
    doc.line(20, 35, 190, 35);  // Horizontal line after header

    // --- User Photo ---
    if (details.photo_path) {
      try {
        const imagePath = path.join(process.cwd(), 'public', 'uploads', details.photo_path); // Correct path
        const imgData = fs.readFileSync(imagePath, 'base64'); // Read as base64
        doc.addImage(`data:image/jpeg;base64,${imgData}`, "JPEG", 150, 45, 40, 40); // Add image, adjust position/size
      } catch (imageError) {
        console.error("Error loading image:", imageError);
        // Optionally, add a placeholder image or text if the image fails to load
      }
    }


    // --- User Details ---
    doc.setFontSize(12);
    let yOffset = 50;

    // doc.text(`User ID: ${user.id}`, 20, yOffset);
    // yOffset += 10;
    // doc.text(`Username: ${user.username}`, 20, yOffset);
    // yOffset += 10;
    doc.text(`Name: ${personal.name || "N/A"}`, 20, yOffset);
    yOffset += 10;
    doc.text(`Email: ${personal.email || "N/A"}`, 20, yOffset);
    yOffset += 15;

    // --- Exam Details ---
    doc.setFont('helvetica', 'bold');
    doc.text("Exam Details", 20, yOffset);
    doc.setFont('helvetica', 'normal');
    yOffset += 10;
    doc.text(`Exam Name: ${schedule.exam_name}`, 20, yOffset);
    yOffset += 10;
    //Use toLocalString() to format date
    doc.text(`Start Time: ${schedule?.start_time?.toISOString().split("T")[0]}, ${schedule?.start_time?.toISOString().split("T")[1].slice(0, 8)}`, 20, yOffset);
    yOffset += 10;
    doc.text(`End Time: ${schedule?.end_time?.toISOString().split("T")[0]}, ${schedule?.end_time?.toISOString().split("T")[1].slice(0, 8)}`, 20, yOffset);
    yOffset += 15;

    // --- Instructions (Example) ---
    doc.setFont('helvetica', 'bold');
    doc.text("Instructions:", 20, yOffset);
    doc.setFont('helvetica', 'normal');
    yOffset += 10;

    const instructions = [
      "1. Please arrive at the examination hall at least 30 minutes before the start time.",
      "2. Bring a valid photo ID (e.g., driver's license, passport) for verification.",
      "3. No electronic devices (phones, calculators, smartwatches) are allowed.",
      "4. Follow the invigilator's instructions carefully.",
    ];
    //Use the loop for instructions
    instructions.forEach((instruction) => {
      doc.text(instruction, 20, yOffset, { maxWidth: 170 }); // Wrap long text
      yOffset += 10;
    });

    // --- Footer (Optional) ---
    doc.setFontSize(10);
    doc.text("Generated on: " + new Date().toLocaleString(), 20, 280); 

    // Convert PDF to data URL
    const pdfBase64 = doc.output('datauristring');
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
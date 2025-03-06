// app/api/hall-ticket/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import fs from 'fs';
import path from 'path';
import { format } from "date-fns";

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
          SELECT pd.name, pd.email, dd.photo_filename
          FROM personal_details pd
          LEFT JOIN declaration_details dd ON pd.user_id = dd.user_id
          WHERE pd.user_id = $1
        `;
    const detailsValues = [userId];
    const detailsResult = await client.query(detailsQuery, detailsValues);
    const details = detailsResult.rows[0] || {};

    // 3. Fetch Nearest *ACTIVE* Exam Schedule
    const scheduleQuery = `
          SELECT id, exam_name, start_time, end_time
          FROM exam_schedules
          WHERE is_active = true  -- Only get the active schedule
          AND start_time > NOW()  -- Only future or currently running exams
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
    doc.setFont('helvetica', 'bold');
    doc.text("Panimalar University", 105, 20, { align: "center" });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text("Entrance Exam Hall Ticket", 105, 30, { align: "center" });
    doc.line(20, 35, 190, 35);

    // --- User Photo ---
    if (details.photo_filename) {
      try {
        const imagePath = path.join(process.cwd(), 'public', 'uploads', details.photo_filename); // Correct path
        // console.log("Image Path:", imagePath); // Debugging line
        const imgData = fs.readFileSync(imagePath, 'base64'); // Read as base64
        //Helper function to getMimeType
        const mimeType = getMimeType(details.photo_filename);
        if (!mimeType) {
          throw new Error('Unsupported image format');
        }

        doc.addImage(`data:${mimeType};base64,${imgData}`, 30, 40, 40, 40); // Add image, adjust position/size
      } catch (imageError) {
        console.error("Error loading image:", imageError);
        // Optionally, add a placeholder image or text if the image fails to load
        doc.text("Image not available", 150, 55); // Placeholder text.
      }
    }

    // --- User Details ---
    doc.setFontSize(12);
    let yOffset = 50;

    doc.text(`User ID: ${user.id}`, 20, yOffset);
    yOffset += 10;
    doc.text(`Username: ${user.username}`, 20, yOffset);
    yOffset += 10;
    doc.text(`Name: ${details.name || "N/A"}`, 20, yOffset);
    yOffset += 10;
    doc.text(`Email: ${details.email || "N/A"}`, 20, yOffset);
    yOffset += 15;

    // --- Exam Details ---
    doc.setFont('helvetica', 'bold');
    doc.text("Exam Details", 20, yOffset);
    doc.setFont('helvetica', 'normal');
    yOffset += 10;
    doc.text(`Exam Name: ${schedule.exam_name}`, 20, yOffset);
    yOffset += 10;
    // Use toLocaleString() to format date
    doc.text(`Start Time: ${new Date(schedule.start_time).toLocaleString()}`, 20, yOffset);
    yOffset += 10;
    doc.text(`End Time: ${new Date(schedule.end_time).toLocaleString()}`, 20, yOffset);
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
    instructions.forEach((instruction, index) => {
      doc.text(instruction, 20, yOffset);
      yOffset += 5; // Increment yOffset for each line of instruction
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

// Helper function to get MIME type based on file extension
function getMimeType(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    // Add more image types as needed
    default:
      return null; // Unknown or unsupported type
  }
}
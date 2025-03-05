// app/api/counseling/departments/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const query = "SELECT * FROM engineering_departments";
    const result = await client.query(query);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { message: "Error fetching departments" },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(req) {
  try {
    const body = await req.json(); // Parse the request body
    const { departmentName, departmentDesc } = body;
    console.log(departmentDesc); // Log the description

    if (!departmentName || !departmentDesc) {
      return NextResponse.json(
        { message: "Department name and description are required." },
        { status: 400 }
      );
    }

    const query =
      "INSERT INTO engineering_departments (department_name, description) VALUES ($1, $2) RETURNING *";
    const values = [departmentName, departmentDesc];
    const result = await pool.query(query, values);

    return NextResponse.json({ department: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error inserting department:", error);
    return NextResponse.json(
      { message: "Failed to insert department", error: error.message },
      { status: 500 }
    );
  }
}


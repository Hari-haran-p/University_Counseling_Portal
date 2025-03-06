import { NextResponse } from "next/server";
import { pool } from "@/db/db"; // Your database connection

export async function GET(req) {
  try {
      const userId = req.headers.get('userId');
      console.log(userId);
      

      if (!userId) {
          return new NextResponse(
              JSON.stringify({ message: "Unauthorized: Missing user ID in headers" }),
              { status: 403, headers: { "Content-Type": "application/json" } }
          );
      }

      const client = await pool.connect();
      
      const query = "SELECT step, data FROM form_data WHERE user_id = $1";
      const values = [userId];
      const result = await client.query(query, values);

      client.release();

      const formData = {};
      result.rows.forEach((row) => {
          formData[row.step] = JSON.parse(row.data);
      });

      return NextResponse.json(formData);
  } catch (error) {
      console.error("Error retrieving form data:", error);
      return new NextResponse(
          JSON.stringify({ message: "Failed to retrieve form data" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
      );
  }
}

export async function POST(req) {
  try {
      const userId = req.headers.get('userId');

      if (!userId) {
          return new NextResponse(
              JSON.stringify({ message: "Unauthorized: Missing user ID in headers" }),
              { status: 403, headers: { "Content-Type": "application/json" } }
          );
      }

      const { step, data } = await req.json();  // Step and form data

      const client = await pool.connect();

      // Check if data already exists for the user and step
      const checkQuery = "SELECT 1 FROM form_data WHERE user_id = $1 AND step = $2";
      const checkValues = [userId, step];
      const checkResult = await client.query(checkQuery, checkValues);

      let query;
      let values;

      if (checkResult.rows.length > 0) {
          // Update existing data
          query = "UPDATE form_data SET data = $3 WHERE user_id = $1 AND step = $2";
          values = [userId, step, JSON.stringify(data)];
      } else {
          // Insert new data
          query = "INSERT INTO form_data (user_id, step, data) VALUES ($1, $2, $3)";
          values = [userId, step, JSON.stringify(data)];
      }

      await client.query(query, values);

      client.release();

      return new NextResponse(JSON.stringify({ message: "Data saved successfully" }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (error) {
      console.error("Error saving form data:", error);
      return new NextResponse(
          JSON.stringify({ message: "Failed to save data" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
      );
  }
}
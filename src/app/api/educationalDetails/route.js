import { NextResponse } from "next/server";
import { pool } from "@/db/db"; // Replace with your actual database connection

export async function GET(req) {
  const client = await pool.connect();

  try {
    const userId = req.headers.get("userid"); // Get user ID from headers

    const query = `
      SELECT board_name, school_name, medium, pincode, state, district, address, city, month_passout, year_passout
      FROM educational_info
      WHERE id = $1;
    `;

    const values = [userId];
    const result = await client.query(query, values);

    if (result.rows.length > 0) {
      // Data found, return it
      return NextResponse.json(result.rows[0]);
    } else {
      // No data found, return a message or perhaps a default object
      return NextResponse.json({ message: "No Data Found" });
    }
  } catch (error) {
    console.error("Error fetching educational details:", error);
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(req) {
  const client = await pool.connect();

  try {
    const body = await req.json();
    const {
      board_name,
      school_name,
      medium,
      pincode,
      state,
      district,
      address,
      city,
      month_passout,
      year_passout,
    } = body; // Destructure all necessary keys

    const userId = req.headers.get("userid");

    // Check if a record already exists for the user
    const checkQuery = `
        SELECT id FROM educational_info WHERE id = $1
      `;
    const checkValues = [userId];
    const checkResult = await client.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      // Update the existing record
      const updateQuery = `
          UPDATE educational_info
          SET board_name = $2, school_name = $3, medium = $4, pincode = $5, state = $6,
              district = $7, address = $8, city = $9, month_passout = $10, year_passout = $11
          WHERE id = $1
        `;
      const updateValues = [
        userId,
        board_name,
        school_name,
        medium,
        pincode,
        state,
        district,
        address,
        city,
        month_passout,
        year_passout,
      ];

      await client.query(updateQuery, updateValues);
      console.log("Educational details successfully updated in the database.");
      return NextResponse.json({ message: "Data updated successfully" , status : 200});
    } else {
      // Insert a new record
      const insertQuery = `
          INSERT INTO educational_info (id, board_name, school_name, medium, pincode, state, district, address, city, month_passout, year_passout)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;

      const insertValues = [
        userId,
        board_name,
        school_name,
        medium,
        pincode,
        state,
        district,
        address,
        city,
        month_passout,
        year_passout,
      ];

      await client.query(insertQuery, insertValues);
      console.log(
        "Educational details successfully inserted into the database."
      );
      return NextResponse.json({ message: "Data saved successfully" });
    }
  } catch (error) {
    console.error("Error inserting/updating data:", error);
    return NextResponse.json(
      { message: "Failed to save data." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
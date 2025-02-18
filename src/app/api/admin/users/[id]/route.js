// app/api/admin/users/[id]/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const { username, role, name, mobno, email, dob, gender, religion, community, mother_tongue, native_state, parent_name, parent_mobno, pincode, state, district, address1, address2, city, board_name, school_name, medium, educational_pincode, educational_state, educational_district, educational_address, educational_city, month_passout, year_passout } = await req.json();

    let client;
    try {
      client = await pool.connect();

      // Start a transaction
      await client.query('BEGIN');

      // Update users table
      const updateUserQuery = `
        UPDATE users
        SET username = $1, role = $2
        WHERE id = $3
      `;
      const updateUserValues = [username, role, id];
      await client.query(updateUserQuery, updateUserValues);

      // Update personal_details table
      const updatePersonalDetailsQuery = `
        UPDATE personal_details
        SET name = $1, mobno = $2, email = $3, dob = $4, gender = $5, religion = $6, community = $7, mother_tongue = $8, native_state = $9, parent_name = $10, parent_mobno = $11, pincode = $12, state = $13, district = $14, address1 = $15, address2 = $16, city = $17
        WHERE user_id = $18
      `;
      const updatePersonalDetailsValues = [name, mobno, email, dob, gender, religion, community, mother_tongue, native_state, parent_name, parent_mobno, pincode, state, district, address1, address2, city, id];
      await client.query(updatePersonalDetailsQuery, updatePersonalDetailsValues);

      const updateEducationalInfoQuery = `
      UPDATE educational_info
      SET board_name = $1, school_name = $2, medium = $3, pincode = $4, state = $5, district = $6, address = $7, city = $8, month_passout = $9, year_passout = $10
      WHERE user_id = $11
    `;
      const updateEducationalInfoValues = [board_name, school_name, medium, educational_pincode, educational_state, educational_district, educational_address, educational_city, month_passout, year_passout, id];
      await client.query(updateEducationalInfoQuery, updateEducationalInfoValues);

      // Commit the transaction
      await client.query('COMMIT');

      return NextResponse.json({ message: "User data updated successfully" }, { status: 200 });
    } catch (error) {
      // Rollback the transaction if any error occurs
      await client.query('ROLLBACK');
      console.error("Error updating admin user data:", error);
      return NextResponse.json({ message: "Error updating admin user data" }, { status: 500 });
    } finally {
      if (client) {
        client.release();
      }
    }
  } catch (error) {
    console.error("Error parsing request:", error);
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
}
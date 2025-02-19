// src/app/api/personal-details/route.js
import { pool } from "@/db/db";
import { NextResponse } from "next/server";
// Replace with your actual database connection

export async function GET(req) {
  const client = await pool.connect();

  try {
    // Assuming you have a way to identify the user (e.g., from a session or token)
    // and that the user's ID is passed as a query parameter
    const userId = req.headers.get("userid");
    console.log(userId);

    const query = `
            SELECT name, email, mobno, dob, gender, religion, parent_name, parent_mobno,
                   address1, address2, pincode, state, city, community, mother_tongue,
                   native_state, district
            FROM personal_details
            WHERE user_id = $1
        `;

    const values = [userId];

    const result = await client.query(query, values);

    if (result.rows.length > 0) {
      // Data found, return it
      return NextResponse.json(result.rows[0]);
    } else {
      // No data found, return dummy data
      return NextResponse.json({ message: "No Data Found" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
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
      name,
      email,
      mobno,
      dob,
      gender,
      religion,
      parent_name,
      parent_mobno,
      address1,
      address2,
      pincode,
      state,
      city,
      community,
      mother_tongue,
      native_state,
      district,
    } = body;
    // console.log(
    //   name,
    //   email,
    //   mobno,
    //   dob,
    //   gender,
    //   religion,
    //   parent_name,
    //   parent_mobno,
    //   address1,
    //   address2,
    //   pincode,
    //   state,
    //   city,
    //   community,
    //   mother_tongue,
    //   native_state,
    //   district
    // );

    // Assuming you have a way to identify the user (e.g., from a session or token)
    const userId = req.headers.get("userid");

    // 1. Check if a record already exists for the user
    const checkQuery = `
            SELECT user_id FROM personal_details WHERE user_id = $1
        `;
    const checkValues = [userId];
    const checkResult = await client.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      // 2. Update the existing record
      const updateQuery = `
                UPDATE personal_details
                SET name = $2, email = $3, mobno = $4, dob = $5, gender = $6, religion = $7,
                    parent_name = $8, parent_mobno = $9, address1 = $10, address2 = $11,
                    pincode = $12, state = $13, city = $14, community = $15,
                    mother_tongue = $16, native_state = $17, district = $18
                WHERE user_id = $1
            `;
      const updateValues = [
        userId,
        name,
        email,
        mobno,
        dob,
        gender,
        religion,
        parent_name,
        parent_mobno,
        address1,
        address2,
        pincode,
        state,
        city,
        community,
        mother_tongue,
        native_state,
        district,
      ];

      await client.query(updateQuery, updateValues);
      console.log("Data successfully updated in the database.");
      return NextResponse.json({ message: "Data updated successfully" , status : 200});
    } else {
      // 3. Insert a new record
      const insertQuery = `
                INSERT INTO personal_details (user_id, name, mobno, email, dob, gender, religion, parent_name, parent_mobno,
                                            address1, address2, pincode, state, city, community, mother_tongue,
                                            native_state, district)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            `;
      const insertValues = [
        userId,
        name,
        mobno,
        email,
        dob,
        gender,
        religion,
        parent_name,
        parent_mobno,
        address1,
        address2,
        pincode,
        state,
        city,
        community,
        mother_tongue,
        native_state,
        district,
      ];

      await client.query(insertQuery, insertValues);
      console.log("Data successfully inserted into the database.");
      return NextResponse.json({ message: "Data saved successfully" });
    }
  } catch (error) {
    console.error("Error inserting/updating data:", error);
    return NextResponse.json({ message: "Failed to save data." });
  } finally {
    client.release();
  }
}

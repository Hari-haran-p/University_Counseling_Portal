import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function GET(req, res) {
  try {
    const query = "SELECT * FROM notification LIMIT 1"; //Assuming that data is not much
    const result = await pool.query(query);

    if (result.rows.length > 0) {
      return NextResponse.json(result.rows[0], { status: 200 });
    } else {
      return NextResponse.json(null, { status: 200 }); // No data found
    }
  } catch (error) {
    console.error("Error fetching notification data:", error);
    return NextResponse.json(
      { message: "Failed to fetch notification data", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req, res) {
  try {
    const body = await req.json();
    let {
      exam,
      preference,
      result,
      application,
      application_deadline,
      seat_allocation,
      exam_start_date,
      exam_end_date,
      preference_start_date,
      
      preference_end_date,
      preference_round,
    } = body;

    // If exam is true, fetch start and end date from exam_schedules
    if (exam) {
      const examScheduleQuery = "SELECT start_time, end_time FROM exam_schedules WHERE is_active = true LIMIT 1";
      const examScheduleResult = await pool.query(examScheduleQuery);
       if (examScheduleResult.rows.length > 0) {
         exam_start_date = examScheduleResult.rows[0].start_time
         exam_end_date = examScheduleResult.rows[0].end_time
       }
    } else {
        exam_start_date = null
        exam_end_date = null
    }

    // If preference is true, fetch start, end date and round number from counseling_rounds
    if (preference) {
      const counselingRoundQuery = "SELECT start_date, end_date, round_number FROM counseling_rounds WHERE is_active = true LIMIT 1";
      const counselingRoundResult = await pool.query(counselingRoundQuery);
      if (counselingRoundResult.rows.length > 0) {
        preference_start_date = counselingRoundResult.rows[0].start_date
        preference_end_date = counselingRoundResult.rows[0].end_date
        preference_round = counselingRoundResult.rows[0].round_number
      }
    } else {
      preference_start_date = null
      preference_end_date = null
      preference_round = null
    }

    // Construct the update values. Only include values that are actually in the request.
    const updateValues = [];
    const values = [];
    let valueIndex = 1;

    if (exam !== undefined) {
      updateValues.push(`exam = $${valueIndex++}`);
      values.push(exam);
    }
    if (preference !== undefined) {
      updateValues.push(`preference = $${valueIndex++}`);
      values.push(preference);
    }
    if (result !== undefined) {
      updateValues.push(`result = $${valueIndex++}`);
      values.push(result);
    }
    if (application !== undefined) {
      updateValues.push(`application = $${valueIndex++}`);
      values.push(application);
    }
    if (application_deadline !== undefined) {
      updateValues.push(`application_deadline = $${valueIndex++}`);
      values.push(application_deadline);
    }
    if (seat_allocation !== undefined) {
      updateValues.push(`seat_allocation = $${valueIndex++}`);
      values.push(seat_allocation);
    }
     if (exam_start_date !== undefined) {
       updateValues.push(`exam_start_date = $${valueIndex++}`);
       values.push(exam_start_date);
     }
     if (exam_end_date !== undefined) {
       updateValues.push(`exam_end_date = $${valueIndex++}`);
       values.push(exam_end_date);
     }
     if (preference_start_date !== undefined) {
       updateValues.push(`preference_start_date = $${valueIndex++}`);
       values.push(preference_start_date);
     }
     if (preference_end_date !== undefined) {
       updateValues.push(`preference_end_date = $${valueIndex++}`);
       values.push(preference_end_date);
     }
     if (preference_round !== undefined) {
       updateValues.push(`preference_round = $${valueIndex++}`);
       values.push(preference_round);
     }

    const checkQuery = "SELECT id FROM notification LIMIT 1";
    const checkResult = await pool.query(checkQuery);

    let query = "";
    let queryValues = [];
    if (checkResult.rows.length > 0) {
      // A row exists, so perform an UPDATE
      query = `
                    UPDATE notification
                    SET exam = $1, preference = $2, result = $3, application = $4, application_deadline = $5, seat_allocation = $6, exam_start_date = $7, exam_end_date = $8, preference_start_date = $9, preference_end_date = $10, preference_round = $11
                    WHERE id = (SELECT id FROM notification LIMIT 1)
                    RETURNING *;
                `;
      queryValues = [
        exam,
        preference,
        result,
        application,
        application_deadline,
        seat_allocation,
        exam_start_date,
        exam_end_date,
        preference_start_date,
        preference_end_date,
        preference_round,
      ];
    } else {
      // No row exists, so perform an INSERT
      query = `
                    INSERT INTO notification (exam, preference, result, application, application_deadline, seat_allocation, exam_start_date, exam_end_date, preference_start_date, preference_end_date, preference_round)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING *;
                `;
      queryValues = [
        exam,
        preference,
        result,
        application,
        application_deadline,
        seat_allocation,
        exam_start_date,
        exam_end_date,
        preference_start_date,
        preference_end_date,
        preference_round,
      ];
    }

    const results = await pool.query(query, queryValues);
    return NextResponse.json(results.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error inserting/updating notification settings:", error);
    return NextResponse.json(
      {
        message: "Failed to update notification settings",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
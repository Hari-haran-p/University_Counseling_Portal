// app/api/counseling/student-preferences/route.js

import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function POST(req) {
    try {
        const { preferences } = await req.json();

        const userId = req.headers.get("userid");

        if (!userId || !Array.isArray(preferences) || preferences.length === 0) {
            return NextResponse.json({ message: "Missing required fields or invalid preferences" }, { status: 400 });
        }

        let client;
        try {
            client = await pool.connect();

            // 1. Get the active counseling round ID
            const activeRoundQuery = `SELECT id FROM counseling_rounds WHERE is_active = true`;
            const activeRoundResult = await client.query(activeRoundQuery);

            if (activeRoundResult.rows.length === 0) {
                return NextResponse.json({ message: "No active counseling round found." }, { status: 400 });
            }
            const activeRoundId = activeRoundResult.rows[0].id;

            // 2. Get preference start and end dates from the dates table
            const dateQuery = "SELECT start_date as preference_start_date, end_date as preference_end_date FROM counseling_rounds WHERE is_active = true";
            const dateResult = await client.query(dateQuery);

            if (dateResult.rows.length === 0) {
                return NextResponse.json({ message: "Preference start and end dates not set. Contact admin" }, { status: 403 });
            }

            const { preference_start_date, preference_end_date } = dateResult.rows[0];

            // 3. Check if current date is within the preference period
            const now = new Date();
            const startDate = preference_start_date ? new Date(preference_start_date) : null;
            const endDate = preference_end_date ? new Date(preference_end_date) : null;

            if (!startDate || !endDate || now < startDate || now > endDate) {
                return NextResponse.json({ message: "Preference selection is currently locked. Please try again during the allowed period." }, { status: 403 });
            }

            // Pad the preferences array with nulls to ensure it has 5 elements.  Crucial for correct DB insertion
            const paddedPreferences = preferences.concat(Array(5 - preferences.length).fill(null));
            const intPreferences = paddedPreferences.map(value => {
                const parsedValue = parseInt(value, 10);
                return isNaN(parsedValue) ? null : parsedValue;
            });
            // 4. Save/Update Preferences - using ON CONFLICT
            const query = `
                INSERT INTO student_preferences (user_id, counseling_round_id, preference_1, preference_2, preference_3, preference_4, preference_5)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (user_id, counseling_round_id) DO UPDATE
                SET preference_1 = $3, preference_2 = $4, preference_3 = $5, preference_4 = $6, preference_5 = $7;
            `;
            const values = [parseInt(userId) || null, parseInt(activeRoundId) || null, ...intPreferences];
            console.log(values);

            await client.query(query, values);

            return NextResponse.json({ message: "Student preferences saved successfully" }, { status: 200 });
        } catch (error) {
            console.error("Error saving student preferences:", error);
            return NextResponse.json({ message: "Error saving student preferences" }, { status: 500 });
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

export async function GET(req) {

    const userId = req.headers.get("userid");

    if (!userId) {
        return NextResponse.json({ message: "Missing userId parameter" }, { status: 400 });
    }

    let client;
    try {
        client = await pool.connect();

        // Get the active counseling round ID.
        const activeRoundQuery = `SELECT id FROM counseling_rounds WHERE is_active = true`;
        const activeRoundResult = await client.query(activeRoundQuery);

        if (activeRoundResult.rows.length === 0) {
            return NextResponse.json({ message: "No active counseling round found." }, { status: 404 }); // Or return an empty array, depending on your needs.
        }
        const activeRoundId = activeRoundResult.rows[0].id;


        // Fetch the student's preferences for the active round.
        const preferencesQuery = `
      SELECT
        preference_1,
        preference_2,
        preference_3,
        preference_4,
        preference_5
      FROM
        student_preferences
      WHERE
        user_id = $1 AND counseling_round_id = $2
    `;
        const preferencesValues = [userId, activeRoundId];
        const preferencesResult = await client.query(preferencesQuery, preferencesValues);

        if (preferencesResult.rows.length === 0) {
            // Return an empty preferences object if no preferences found
            return NextResponse.json({
                preference_1: null,
                preference_2: null,
                preference_3: null,
                preference_4: null,
                preference_5: null,
            }, { status: 200 });
        }

        //Returns the user preferences from database
        return NextResponse.json(preferencesResult.rows[0], { status: 200 });

    } catch (error) {
        console.error("Error fetching student preferences:", error);
        return NextResponse.json({ message: "Error fetching student preferences" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}
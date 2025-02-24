// app/api/counseling/student-preferences/route.js

import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function POST(req) {
    try {
        const { userId, preferences } = await req.json();

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
            const dateQuery = "SELECT preference_start_date, preference_end_date FROM dates WHERE id = 1";
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

            // 4. Save/Update Preferences - using ON CONFLICT
            const query = `
                INSERT INTO student_applications (user_id, counseling_round_id, preference_1, preference_2, preference_3, preference_4, preference_5)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (user_id, counseling_round_id) DO UPDATE
                SET preference_1 = $3, preference_2 = $4, preference_3 = $5, preference_4 = $6, preference_5 = $7;
            `;
            const values = [userId, activeRoundId, ...paddedPreferences]; // Use activeRoundId
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
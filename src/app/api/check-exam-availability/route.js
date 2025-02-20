import { NextResponse } from "next/server";
import { pool } from "@/db/db";
import { format, parseISO } from "date-fns"; // Date formatting
import { toZonedTime } from "date-fns-tz"; // Corrected import

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ message: "Missing userId parameter" }, { status: 400 });
    }

    let client;
    try {
        client = await pool.connect();

        // 1️⃣ Check Declaration
        const declarationQuery = `
            SELECT EXISTS (
                SELECT 1 FROM declaration_details WHERE user_id = $1 AND declaration = TRUE
            )
        `;
        const declarationResult = await client.query(declarationQuery, [userId]);
        if (!declarationResult.rows[0].exists) {
            return NextResponse.json({ isExamAvailable: false, message: "Declaration Required" }, { status: 200 });
        }

        // 2️⃣ Check if Exam Already Taken
        const examStatusQuery = `
            SELECT EXISTS (
                SELECT 1 FROM exam_results WHERE user_id = $1
            )
        `;
        const examStatusResult = await client.query(examStatusQuery, [userId]);
        if (examStatusResult.rows[0].exists) {
            return NextResponse.json({ isExamAvailable: false, message: "Exam Already Taken" }, { status: 200 });
        }

        // 3️⃣ Fetch Exam Schedules
        const scheduleQuery = "SELECT * FROM exam_schedules";
        const scheduleResult = await client.query(scheduleQuery);
        const examSchedules = scheduleResult.rows;

        if (examSchedules.length === 0) {
            return NextResponse.json({ isExamAvailable: false, message: "No Exam Schedules Found" }, { status: 200 });
        }

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const now = toZonedTime(new Date(), timezone);
        console.log("Current User Timezone:", timezone);
        console.log("Current Time in User's Timezone:", now);

        let closestSchedule = null;
        let timeDiff = Infinity;

        for (const schedule of examSchedules) {
            const start = toZonedTime((schedule.start_time), timezone);
            const end = toZonedTime((schedule.end_time), timezone);

            console.log("Exam Start:", start);
            console.log("Exam End:", end);

            const diff = start.getTime() - now.getTime();
            if (diff > 0 && diff < timeDiff) {
                timeDiff = diff;
                closestSchedule = schedule;
            }
        }

        if (!closestSchedule) {
            return NextResponse.json(
                { isExamAvailable: false, message: "No Upcoming Exam Schedules Found" },
                { status: 200 }
            );
        }

        const start = toZonedTime((closestSchedule.start_time), timezone);
        const end = toZonedTime((closestSchedule.end_time), timezone);

        if (now < start) {
            return NextResponse.json(
                {
                    isExamAvailable: false,
                    message: `Exam Scheduled to Start at ${format(start, "MMM dd, yyyy hh:mm a")}`,
                },
                { status: 200 }
            );
        }

        if (now > end) {
            return NextResponse.json(
                {
                    isExamAvailable: false,
                    message: `Exam Was Scheduled to End at ${format(end, "MMM dd, yyyy hh:mm a")}`,
                },
                { status: 200 }
            );
        }

        // 🎯 Exam is Available
        return NextResponse.json(
            {
                isExamAvailable: true,
                examScheduleId: closestSchedule.id,
                message: "Exam is Available",
                examEndTime: closestSchedule.end_time,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error checking exam availability:", error);
        return NextResponse.json(
            { message: "Error checking exam availability" },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}

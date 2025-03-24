
// app/api/counseling/seats-view/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function GET(req, { params }) {
    const userId = req.headers.get("userid"); 

    try {
        let client;
        try {
            client = await pool.connect();

            // Define a query to fetch student's department preferences and department details.
            const viewQuery = `
                SELECT 
                asg.user_id,
                u.username,
                e.department_name,
                e.description,
                pd.mobno,
                pd.community
             FROM 
                assigned_seats asg
             JOIN users u ON u.id = asg.user_id
             JOIN engineering_departments e ON e.id = asg.department_id
                JOIN personal_details pd ON pd.user_id = asg.user_id
                WHERE asg.user_id = $1;
               `;
            const viewResults = await client.query(viewQuery, [userId]);

            // Return the preferences.
            return NextResponse.json(viewResults.rows, { status: 200 });
        } catch (error) {
            console.error("Error to process request", error);
            return NextResponse.json({ message: "error view preference" }, { status: 500 });
        } finally {
            client.release();
        }
    } catch (err) {
        console.log(err);
        return new Response("failed", { status: 400 })
    }
}
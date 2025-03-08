import { NextResponse } from "next/server";
import { pool } from "@/db/db";


export async function GET(req) {

    const userId = req.headers.get("userid");

    try {
        const result = await pool.query("SELECT * FROM assigned_seats WHERE user_id = $1", [userId]);

        if (result.rows.length > 0) {
            return NextResponse.json({ messge: "Seat alloted", status: true });
        }
        return NextResponse.json({ messge: "Seat alloted", status: false });

    } catch (error) {
        console.log(error);
        
        return NextResponse.json({ messge: "Some Error" });
    }
}
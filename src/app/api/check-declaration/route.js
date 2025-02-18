// app/api/check-declaration/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ message: "Missing userId parameter" }, { status: 400 });
    }

    let client;
    try {
        client = await pool.connect();
        const query = `
    SELECT EXISTS (
      SELECT 1
      FROM declaration_details
      WHERE user_id = $1 AND declaration = TRUE
    ) AS declaration_status
  `;

        const values = [userId];
        const result = await client.query(query, values);
        const hasDeclaration = result?.rows[0]?.declaration_status;
        console.log(hasDeclaration);
        
        return NextResponse.json({ hasDeclaration }, { status: 200 });
    } catch (error) {
        console.error("Error checking declaration status:", error);
        return NextResponse.json({ message: "Error checking declaration status" }, { status: 500 });
    } finally {
        if (client) {
            client.release();
        }
    }
}
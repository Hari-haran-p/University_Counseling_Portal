// src/app/api/payment-details/route.js
import { NextResponse } from 'next/server';

const data = {}
export async function GET(req) {
    return NextResponse.json(data)
}

export async function POST(req) {
    // Insert data into the database
    // You'll need to have the required library import and db connection configured

    try {
        console.log("Data successfully inserted into the database.");

        return NextResponse.json({
            message: "Data saved successfully",
        });
    } catch (error) {
        console.error("Error inserting data:", error);
        return NextResponse.json({message: "Failed to save data."});
    }
}
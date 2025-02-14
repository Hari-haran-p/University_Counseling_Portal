import { registrationSchema } from "@/lib/validators/registration";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import { sendEmail } from "@/lib/email";

function generateRandomPassword(length = 12) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}

export async function POST(req) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const body = await req.json();
        registrationSchema.parse(body);

        const randomPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const userQuery = `
         INSERT INTO users (username, password)
         VALUES ($1, $2)
         RETURNING id;
       `;

        const userValues = [body.email, hashedPassword];
        const userResult = await client.query(userQuery, userValues);
        const userId = userResult.rows[0].id;  
 
        const detailsQuery = `
      INSERT INTO personal_details (name, mobno, email, dob, gender, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
        const detailsValues = [
            body.name,
            body.mobile,
            body.email,
            body.dob,
            body.gender,
            userId, 
        ];
        await client.query(detailsQuery, detailsValues);

        await sendEmail(body.email, randomPassword);

        await client.query('COMMIT');

        console.log("Success");
        return NextResponse.json({
            message:
                "Registration successful! A temporary password has been sent to your email address. Please check your inbox.",
        });
    } catch (error) {
        console.error("Registration error:", error);
        await client.query('ROLLBACK');
        return NextResponse.json(
            { message: error.message || "Registration failed. Please try again." },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
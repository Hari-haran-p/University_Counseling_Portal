// pages/api/login.js

import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import { loginSchema } from "@/lib/validators/login"; // Import login validator
import { generateToken } from "@/lib/token-utils"; // Import token generator

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Validate the request body
      loginSchema.parse(req.body);  // Validate input
      const { username, password } = req.body; // Extract after validation

      const client = await pool.connect();

      // 1. Find the user by username
      const userQuery = "SELECT id, username, password FROM users WHERE username = $1";
      const userValues = [username];
      const userResult = await client.query(userQuery, userValues);

      if (userResult.rows.length === 0) {
        client.release();
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = userResult.rows[0];

      // 2. Compare the password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        client.release();
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // 3. Generate a JWT token
      const payload = { userId: user.id, username: user.username };
      const token = generateToken(payload);

      client.release();

      // 4. Send the token in the response
      res.status(200).json({ message: "Login successful", token: token });
    } catch (error) {
        if (error.name === "ZodError") {
            // Handle Zod validation errors specifically
            const errorMessages = error.errors.map((err) => err.message);
            return res.status(400).json({ message: "Validation error", errors: errorMessages });
        }

      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function DELETE(req, { params }) {
    const { id } = await params;  // Extract the 'id' from the route parameters
  
    if (!id) {
      return NextResponse.json({ message: "Department ID is required" }, { status: 400 });
    }
  
    try {
      const query = "DELETE FROM engineering_departments WHERE id = $1 RETURNING *";
      const values = [id];
      const result = await pool.query(query, values);
  
      if (result.rows.length === 0) {
        return NextResponse.json({ message: "Department not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "Department deleted successfully" }, { status: 200 });
  
    } catch (error) {
      console.error("Error deleting department:", error);
      return NextResponse.json({ message: "Failed to delete department", error: error.message }, { status: 500 });
    }
  }
  
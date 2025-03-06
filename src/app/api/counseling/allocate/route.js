// app/api/counseling/allocate/route.js
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function POST(req) {
    try {
        // const { allocationRound } = await req.json(); // No longer needed, we use the active round.

        let client;
        try {
            client = await pool.connect();

            // Get the active counseling round ID.  Critical for correct allocations.
            const activeRoundQuery = `SELECT id FROM counseling_rounds WHERE is_active = true`;
            const activeRoundResult = await client.query(activeRoundQuery);
            if (activeRoundResult.rows.length === 0) {
                return NextResponse.json({ message: "No active counseling round found." }, { status: 400 });
            }
            const activeRoundId = activeRoundResult.rows[0].id;


            // 1. Fetch all departments
            const departmentQuery = "SELECT id FROM engineering_departments";
            const departmentResult = await client.query(departmentQuery);
            const departments = departmentResult.rows;

            // 2. Fetch all seat allocations (community-wise for each department)
            const seatAllocationQuery = "SELECT department_id, community, seats_available FROM seat_allocations WHERE counseling_round_id = $1"; // Get seats by counseling round
            const seatAllocationResult = await client.query(seatAllocationQuery, [activeRoundId]);
            const seatAllocations = seatAllocationResult.rows;

            // 3. Fetch all student preferences and associated user data, ranking
            const studentDataQuery = `
        SELECT
          sp.user_id,
          sp.preference_1,
          sp.preference_2,
          sp.preference_3,
          sp.preference_4,
          sp.preference_5,
          urv.community,
          urv.overall_rank,
          urv.community_rank
        FROM
          student_preferences sp
        JOIN exam_results_ranking urv ON sp.user_id = urv.user_id
        WHERE sp.counseling_round_id = $1  
        ORDER BY urv.community, urv.community_rank ASC, urv.overall_rank ASC;
      `;
            const studentDataResult = await client.query(studentDataQuery, [activeRoundId]); // Add activeRoundId
            const studentData = studentDataResult.rows;

            // Data Structures for Tracking Allocations
            const allocatedSeats = {}; // Track allocated seats per department and community
            departments.forEach(dept => {
                allocatedSeats[dept.id] = {};
            });

            // Begin Transaction - Very Important for data consistency
            await client.query('BEGIN');

            try {
                // Allocation Logic - Go through students and assign seats according to preference
                for (const student of studentData) {
                    const preferences = [
                        student.preference_1,
                        student.preference_2,
                        student.preference_3,
                        student.preference_4,
                        student.preference_5
                    ].filter(pref => pref !== null);

                    let seatAssigned = false;

                    for (const preferredDepartmentId of preferences) {
                        // Check if this department has been fully allocated for this student's community
                        const seatAllocationForCommunity = seatAllocations.find(
                            seat => seat.department_id === preferredDepartmentId && seat.community === student.community
                        );

                        //Check to see the seat exits in tables
                        if (!seatAllocationForCommunity) continue;

                        const seatsAvailable = seatAllocationForCommunity?.seats_available || 0;
                        const seatsAllocatedSoFar = allocatedSeats[preferredDepartmentId]?.[student.community] || 0;

                        if (seatsAvailable > seatsAllocatedSoFar) {
                            // Assign the seat
                            const assignSeatQuery = `
                                INSERT INTO assigned_seats (user_id, counseling_round_id, department_id)
                                VALUES ($1, $2, $3)
                            `;
                            const assignSeatValues = [student.user_id, activeRoundId, preferredDepartmentId];

                            try {
                                await client.query(assignSeatQuery, assignSeatValues);
                                console.log(`Assigned seat to user ${student.user_id} in department ${preferredDepartmentId}`);
                                seatAssigned = true;

                                // *** CRITICAL: Decrement available seats ***
                                const decrementQuery = `
                                    UPDATE seat_allocations
                                    SET seats_available = seats_available - 1
                                    WHERE department_id = $1 AND community = $2 AND counseling_round_id = $3;
                                `;
                                const decrementValues = [preferredDepartmentId, student.community, activeRoundId];
                                await client.query(decrementQuery, decrementValues);


                                // Update allocated seats count (using nested object approach for safety)
                                if (!allocatedSeats[preferredDepartmentId]) {
                                    allocatedSeats[preferredDepartmentId] = {};
                                }
                                allocatedSeats[preferredDepartmentId][student.community] = seatsAllocatedSoFar + 1;
                            } catch (assignError) {
                                console.error(`Failed to assign seat to user ${student.user_id} in department ${preferredDepartmentId}:`, assignError);
                                // Consider throwing the error here to trigger the rollback, or log it and continue.
                                // throw assignError; // Uncomment to rollback on error
                            }

                            break; // Move to the next student
                        }
                    }

                    if (!seatAssigned) {
                        console.log(`No seat available for user ${student.user_id} in any preferred department.`);
                    }
                }

                // Commit the transaction
                await client.query('COMMIT');

                console.log("Seat allocation completed.");
                return NextResponse.json({ message: "Seat allocation completed successfully" }, { status: 200 });

            } catch (error) {
                // Rollback the transaction if any error occurs
                await client.query('ROLLBACK');
                console.error("Error processing seat allocation:", error);
                return NextResponse.json({ message: "Error processing seat allocation" }, { status: 500 });
            } finally {
                if (client) {
                    client.release();
                }
            }
        } catch (error) {
            console.error("Error parsing request:", error);
            return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error parsing request:", error);
        return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    } 
}

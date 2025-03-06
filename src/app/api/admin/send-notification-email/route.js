import { NextResponse } from "next/server";
import { pool } from "@/db/db";  // Adjust the path to your database connection
import { transporter } from "@/lib/email"; // Import transporter

const getUserEmails = async () => {
    try {
        const query = 'SELECT username FROM users'; // Assuming 'username' column stores email addresses
        const result = await pool.query(query);
        const emails = result.rows.map(row => row.username);
        return emails;
    } catch (error) {
        console.error('Error fetching user emails from database:', error);
        throw new Error('Failed to fetch user emails');
    }
};

const sendNotificationEmail = async (email, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Replace with your email
            to: email,
            subject: subject,
            text: text,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Notification email sent successfully to ${email}`);
    } catch (error) {
        console.error(`Failed to send notification email to ${email}:`, error);
        throw new Error(`Failed to send notification email to ${email}`);
    }
};
export async function POST(req, res) {
    try {
        const body = await req.json();
        const { type } = body;

        let subject = '';
        let text = '';
        let examStartDate = null;
        let examEndDate = null;
        let preferenceStartDate = null;
        let preferenceEndDate = null;
        let preferenceRound = null;
         let applicationDeadline = null

        const fetchExamScheduleData = async () => {
            try {
                const examScheduleQuery = "SELECT start_time, end_time FROM exam_schedules WHERE is_active = true LIMIT 1";
                const examScheduleResult = await pool.query(examScheduleQuery);
                if (examScheduleResult.rows.length > 0) {
                    return {
                        start_time: examScheduleResult.rows[0].start_time,
                        end_time: examScheduleResult.rows[0].end_time
                    };
                }
                return null;
            } catch (error) {
                console.error("Error fetching exam schedule:", error);
                throw new Error("Failed to fetch exam schedule");
            }
        };
        const fetchCounselingRoundData = async () => {
            try {
                const query = 'SELECT start_date, end_date, round_number FROM counseling_rounds WHERE is_active = TRUE LIMIT 1';
                const result = await pool.query(query);
                return result.rows.length > 0 ? result.rows[0] : null;
            } catch (error) {
                console.error("Error fetching counseling round:", error);
                throw new Error("Failed to fetch counseling rounds");
            }
        };
  
        // Helper function to fetch the application deadline from the notification table
        const fetchApplicationDeadline = async () => {
          try {
            const query = "SELECT application_deadline FROM notification LIMIT 1";
            const result = await pool.query(query);
            if (result.rows.length > 0 && result.rows[0].application_deadline) {
              return result.rows[0].application_deadline;
            }
            return null;
          } catch (error) {
            console.error("Error fetching application deadline:", error);
            throw new Error("Failed to fetch application deadline from notification table");
          }
        };
        // 3. Build Email Content Based on Notification Type
        switch (type) {
            case "Exam":
                const examData = await fetchExamScheduleData();
                if (examData) {
                    examStartDate = examData.start_time;
                    examEndDate = examData.end_time;

                    subject = "Upcoming Exam Schedule";
                    text = `Your exam is scheduled from ${examStartDate} to ${examEndDate}.  Don't forget to attend!`;
                } else {
                    return NextResponse.json({ message: 'No active exam schedule found' }, { status: 400 });
                }
                break;
            case "Preference":
                const preferenceData = await fetchCounselingRoundData();
                if (preferenceData) {
                    preferenceStartDate = preferenceData.start_date;
                    preferenceEndDate = preferenceData.end_date;
                    preferenceRound = preferenceData.round_number;

                    subject = "Counseling Preference Selection";
                    text = `Counseling preference selection is open from ${preferenceStartDate} to ${preferenceEndDate}. Round Number: ${preferenceRound}. Make your selections now!`;
                } else {
                    return NextResponse.json({ message: 'No active counseling round found' }, { status: 400 });
                }
                break;
            case "Result":
                subject = "Exam Results Published";
                text = "Your exam results have been published. Please check your portal.";
                break;
            case "Application Deadline":
             applicationDeadline = await fetchApplicationDeadline();  // Fetch from notification table
              if (applicationDeadline) {
                subject = "Application Deadline Reminder";
                text = `The application deadline is approaching on ${applicationDeadline}. Complete your application now!`;
              } else {
                  return NextResponse.json({ message: 'No Application Deadline found, Update in notification module'}, { status: 400 });
              }
              break;
          case "Seat Allotment":
            subject = "Seat Allotment Result";
            text = "Your seat has been allotted. Please check the application in the portal to view your results.";
            break;
        default:
          return NextResponse.json({ message: `Unknown notification type: ${type}` }, { status: 400 });
      }
  
          if (!subject || !text) {
              return NextResponse.json({ message: "Could not get information about the notification" }, { status: 500 });
          }
  
  
        // 4. Get List of Emails from the users table
        const emails = await getUserEmails();
        if (!emails || emails.length === 0) {
            return NextResponse.json({ message: 'No users to send emails to' }, { status: 400 });
        }
  
        // 4. Send Email to Each User
        const emailPromises = emails.map(async (email) => {
            try {
                await sendNotificationEmail(email, subject, text); // Call sendNotificationEmail function
            } catch (error) {
                console.error(`Failed to send email to ${email}:`, error);
                // Optionally, keep track of failed emails
                return {email, error: error.message};
            }
        });
  
        const emailResults = await Promise.all(emailPromises);
  
        const failedEmails = emailResults.filter(result => result);  // Filter out successful sends
        if (failedEmails.length > 0) {
            console.warn("Some emails failed to send:", failedEmails);
            // Optionally, return a list of failed emails in the response
        }
  
        return NextResponse.json({message: "Notification emails sent successfully"}, {status: 200});
  
      } catch (error) {
          console.error("Error sending notification emails:", error);
          return NextResponse.json({message: "Failed to send notification emails", error: error.message}, {status: 500});
      }
  }
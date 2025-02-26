// lib/email-utils.js
import nodemailer from 'nodemailer';

export async function sendEmail(email, password) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Replace with your SMTP server
      port: 587,
      secure: false, // `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS, // Replace with your password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Replace with your email
      to: email,
      subject: "Your Registration Details",
      text: `Thank you for registering! Your Login password is: ${password}.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');  // Re-throw to be caught in the main try-catch
  }
}
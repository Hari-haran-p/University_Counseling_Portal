// app/api/declarationDetails/route.js

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { pool } from "@/db/db";

export async function POST(req) {
  const client = await pool.connect();
  try {
    const body = await req.json();
    const { photo, signature, declaration} = body;
    const userId = req.headers.get("userid");

    if (!userId) {
      console.error("No user ID found");
      return new NextResponse(
        JSON.stringify({ message: "No user ID found" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let newPhotoUploaded = false;
    let newSignatureUploaded = false;
    let photoFilename = null;
    let signatureFilename = null;
    let photoBuffer = null;
    let signatureBuffer = null;

    if (photo && photo.startsWith("data:image")) {
      photoBuffer = decodeBase64Image(photo);
      photoFilename = `${Date.now()}-photo.png`;
      newPhotoUploaded = true;
    }else{
      photoFilename = photo.replace("/uploads/", "");
    }

    if (signature && signature.startsWith("data:image")) {
      signatureBuffer = decodeBase64Image(signature);
      signatureFilename = `${Date.now()}-signature.png`;
      newSignatureUploaded = true;
    }else{
      signatureFilename = signature.replace("/uploads/", "");
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    await client.query("BEGIN");

    const checkQuery = `SELECT photo_path, signature_path FROM declaration_details WHERE user_id = $1`;
    const checkValues = [userId];
    const existingFilesResult = await client.query(checkQuery, checkValues);

    let existingPhotoPath = null;
    let existingSignaturePath = null;

    if (existingFilesResult.rows.length > 0) {
      existingPhotoPath = existingFilesResult.rows[0].photo_path;
      existingSignaturePath = existingFilesResult.rows[0].signature_path;
    }

    // Delete existing files
    if (newPhotoUploaded && existingPhotoPath) {
      try {
        const fullExistingPhotoPath = path.join(uploadDir, existingPhotoPath);
        await fs.unlink(fullExistingPhotoPath);
        console.log("Successfully deleted existing photo file.");
      } catch (unlinkError) {
        console.error("Error deleting existing photo file:", unlinkError);
      }
    }

    if (newSignatureUploaded && existingSignaturePath) {
      try {
        const fullExistingSignaturePath = path.join(
          uploadDir,
          existingSignaturePath
        );
        await fs.unlink(fullExistingSignaturePath);
        console.log("Successfully deleted existing signature file.");
      } catch (unlinkError) {
        console.error(
          "Error deleting existing signature file:",
          unlinkError
        );
      }
    }

    // Write new files to the file system
    if (photoBuffer) {
      const photoPath = path.join(uploadDir, photoFilename);
      await fs.writeFile(photoPath, photoBuffer.data);
    }

    if (signatureBuffer) {
      const signaturePath = path.join(uploadDir, signatureFilename);
      await fs.writeFile(signaturePath, signatureBuffer.data);
    }

    try {
      const upsertQuery = `
          INSERT INTO declaration_details (user_id, photo_path, signature_path, declaration)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id) DO UPDATE SET 
            photo_path = $2,
            signature_path = $3,
            declaration = $4;
          `;
      const upsertValues = [userId, photoFilename, signatureFilename, declaration];
      await client.query(upsertQuery, upsertValues);
      await client.query("COMMIT");
    } catch (upsertError) {
      await client.query("ROLLBACK");
      console.error("Upsert Error:", upsertError);
      throw upsertError; // Re-throw for global catch
    }
    client.release();

    return NextResponse.json({
      message: "Files uploaded successfully!",
      photoPath: photoFilename,
      signaturePath: signatureFilename,
      status: 200,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Upload failed. Please try again." },
      { status: 500 }
    );
  } finally {

  }
}

export async function GET(req) {
  const client = await pool.connect();
  try {
    const userId = req.headers.get("userid");
    const query = `SELECT photo_path, signature_path , declaration FROM declaration_details WHERE user_id = $1`;
    const values = [userId];
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      console.log("No images found for this user");
      return NextResponse.json({ message: "No images found for this user" });
    }

    const { photo_path, signature_path, declaration } = result.rows[0];
    const baseUrl = "/uploads/";
    return NextResponse.json(
      {
        photoUrl: baseUrl + photo_path,
        signatureUrl: baseUrl + signature_path,
        declaration: declaration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { message: "Failed to fetch images." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

function decodeBase64Image(dataString) {
  const matches = dataString.match(/^data:image\/(png|jpeg|jpg);base64,(.*)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid input string");
  }
  return {
    type: matches[1],
    data: Buffer.from(matches[2], "base64"),
  };
}
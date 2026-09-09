import cloudinary from "@/cloudinary";
import {
  addDocument,
  getMonthlyUploadCount,
  recordMonthlyUpload,
} from "@/lib/firebaseops";
import { uploadLimiter, applyRateLimit } from "@/lib/rateLimit";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 5 uploads per 10 minutes
    const blocked = await applyRateLimit(uploadLimiter, userId);
    if (blocked) return blocked;

    const MONTHLY_UPLOAD_LIMIT = 10; // Max 10 uploads per user per calendar month
    const uploadsThisMonth = await getMonthlyUploadCount(userId);
    if (uploadsThisMonth >= MONTHLY_UPLOAD_LIMIT) {
      return NextResponse.json(
        {
          error: "Monthly upload limit reached",
          message: `Free accounts can upload up to ${MONTHLY_UPLOAD_LIMIT} PDFs per month. Your quota resets at the start of next month.`,
        },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = file?.name || "Untitled Document";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.subarray(0, 4).toString("ascii") !== "%PDF") {
      return NextResponse.json(
        { error: "The uploaded file is not a valid PDF" },
        { status: 400 }
      );
    }

    let cloudinaryResult: UploadApiResponse;
    try {
      cloudinaryResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: process.env.CLOUDINARY_UPLOAD_FOLDER,
            public_id: `pdf_${Date.now()}`,
            use_filename: true,
            unique_filename: false,
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
            } else if (!uploadResult) {
              reject(new Error("Cloudinary upload returned no result"));
            } else {
              resolve(uploadResult);
            }
          },
        );
        uploadStream.end(buffer);
      });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to upload PDF to Cloudinary" },
        { status: 500 }
      );
    }

    let documentId;
    try {
      documentId = await addDocument({
        title,
        originalFilename: file.name,
        cloudinaryPublicId: cloudinaryResult.public_id,
        cloudinaryUrl: cloudinaryResult.secure_url,
        fileSize: file.size,
        userId,
        mimeType: file.type,
        status: "ready",
        chatEnabled: false,
        totalChats: 0,
      })
    } catch (error) {
      console.error("Error saving document to Firestore:", error);
      
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, {
          resource_type: "image",
        });
      } catch (error) {
        console.error("Error cleaning up Cloudinary upload:", error);
      }

      return NextResponse.json(
        { error: "Failed to save document data" },
        { status: 500 }
      );
    }

    // Count this upload against the user's monthly quota. Best-effort: the
    // document is already stored, so a counter write failure must not fail the
    // request (it only risks a small undercount, which favors the user).
    try {
      await recordMonthlyUpload(userId);
    } catch (error) {
      console.error("Error recording monthly upload usage:", error);
    }

    return NextResponse.json({
      success: true,
      documentId,
      cloudinaryPublicId: cloudinaryResult.public_id,
      cloudinarySecure_url: cloudinaryResult.secure_url,
      title,
      originalFilename: file.name,
      fileSize: file.size,
      status: "ready",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

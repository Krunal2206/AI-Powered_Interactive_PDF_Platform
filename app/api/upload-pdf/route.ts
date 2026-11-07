import cloudinary from "@/cloudinary";
import {
  addDocument,
  confirmUploadSlot,
  releaseUploadSlot,
  reserveUploadSlot,
} from "@/lib/firebaseops";
import { uploadLimiter, applyRateLimit } from "@/lib/rateLimit";
import { serverEnv } from "@/lib/env";
import { requireAuth } from "@/lib/errorHandling";
import { NextRequest, NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import { randomUUID } from "node:crypto";
import { MONTHLY_UPLOAD_LIMIT } from "@/constants/upload";

async function releaseQuietly(userId: string, reservationId: string) {
  try {
    await releaseUploadSlot(userId, reservationId);
  } catch (error) {
    console.error("Error releasing upload slot:", error);
  }
}

async function validatePdfUpload(
  formData: FormData,
): Promise<{ file: File; buffer: Buffer } | { response: NextResponse }> {
  const file = formData.get("file") as File | null;

  if (!file) {
    return {
      response: NextResponse.json({ error: "No file provided" }, { status: 400 }),
    };
  }

  if (file.type !== "application/pdf") {
    return {
      response: NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      ),
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      response: NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 },
      ),
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 4).toString("ascii") !== "%PDF") {
    return {
      response: NextResponse.json(
        { error: "The uploaded file is not a valid PDF" },
        { status: 400 },
      ),
    };
  }

  return { file, buffer };
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult.error) {
      return authResult.error;
    }
    const { userId } = authResult;

    // Rate limit: 5 uploads per 10 minutes
    const blocked = await applyRateLimit(uploadLimiter, userId);
    if (blocked) return blocked;

    const formData = await request.formData();
    const validatedUpload = await validatePdfUpload(formData);
    if ("response" in validatedUpload) return validatedUpload.response;

    const { file, buffer } = validatedUpload;
    const title = file?.name || "Untitled Document";

    // Check the monthly limit and claim a slot in one transaction, so concurrent uploads can't all pass the check.
    const reservationId = randomUUID();
    const reservation = await reserveUploadSlot(
      userId,
      reservationId,
      MONTHLY_UPLOAD_LIMIT,
    );
    if (!reservation.ok) {
      return NextResponse.json(
        {
          error: "Monthly upload limit reached",
          message: `Free accounts can upload up to ${MONTHLY_UPLOAD_LIMIT} PDFs per month. Your quota resets on the 1st of next month (00:00 UTC).`,
        },
        { status: 403 },
      );
    }

    let cloudinaryResult: UploadApiResponse;
    try {
      cloudinaryResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: serverEnv.CLOUDINARY_UPLOAD_FOLDER,
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
      await releaseQuietly(userId, reservationId);
      return NextResponse.json(
        { error: "Failed to upload PDF to Cloudinary" },
        { status: 500 },
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
        status: "ready",
        totalChats: 0,
        ...(cloudinaryResult.pages
          ? { pageCount: cloudinaryResult.pages }
          : {}),
      });
    } catch (error) {
      console.error("Error saving document to Firestore:", error);

      // Cleanup Cloudinary upload
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, {
          resource_type: "image",
        });
      } catch (error) {
        console.error("Error cleaning up Cloudinary upload:", error);
      }

      await releaseQuietly(userId, reservationId);

      return NextResponse.json(
        { error: "Failed to save document data" },
        { status: 500 },
      );
    }

    try {
      await confirmUploadSlot(userId, reservationId, documentId);
    } catch (error) {
      console.error("Error confirming upload slot:", error);
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
      { status: 500 },
    );
  }
}

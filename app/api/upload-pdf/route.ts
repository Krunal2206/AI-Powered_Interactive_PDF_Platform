import cloudinary from "@/cloudinary";
import { addDocument } from "@/lib/firebaseops";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let cloudinaryResult: any;
    try {
      cloudinaryResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            public_id: `pdf_${Date.now()}`,
            use_filename: true,
            unique_filename: false,
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
            } else {
              resolve(uploadResult);
            }
          }
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
          resource_type: "raw",
        });
      } catch (error) {
        console.error("Error cleaning up Cloudinary upload:", error);
      }

      return NextResponse.json(
        { error: "Failed to save document data" },
        { status: 500 }
      );
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

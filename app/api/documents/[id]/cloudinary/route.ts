import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDocument } from "@/lib/firebaseops";
import cloudinary from "@/cloudinary";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;

    const document = await getDocument(documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    if (document.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await cloudinary.uploader.destroy(
      document.cloudinaryPublicId,
      { resource_type: "raw" },
    );

    if (result.result !== "ok" && result.result !== "not found") {
      console.error("Cloudinary destroy result:", result);
      return NextResponse.json(
        { error: "Cloudinary deletion failed", details: result.result },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cloudinary asset deleted",
      result: result.result,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete from Cloudinary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

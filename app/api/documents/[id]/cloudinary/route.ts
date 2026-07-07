import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/cloudinary";
import { authorizeDocumentAccess, handleChatError } from "@/lib/errorHandling";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id: documentId } = await params;
    const auth = await authorizeDocumentAccess(documentId);
    if (auth.error) return auth.error;
    const { document } = auth;

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
    return handleChatError(error);
  }
}

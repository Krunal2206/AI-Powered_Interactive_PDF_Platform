import type { Metadata } from "next";
import { getDocument } from "@/lib/firebaseops";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const doc = await getDocument(id);
    return {
      title: doc ? `Chat | ${doc.title}` : "Chat | Chat with your PDF",
    };
  } catch {
    return {
      title: "Chat | Chat with your PDF",
    };
  }
}

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

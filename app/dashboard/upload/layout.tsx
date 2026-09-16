import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Documents | Chat with PDF",
  description: "Upload PDF documents to chat and analyze with AI.",
};

export default function UploadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

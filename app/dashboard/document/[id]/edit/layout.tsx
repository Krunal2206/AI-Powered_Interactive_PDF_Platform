import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Document | Chat with your PDF",
};

export default function EditDocumentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

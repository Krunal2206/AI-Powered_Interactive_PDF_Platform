import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings | Chat with PDF",
  description: "Manage your Chat with PDF account and profile details.",
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

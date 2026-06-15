import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/hooks/useToast";

export const metadata: Metadata = {
  title: "Chat with PDF — AI-Powered Interactive PDF Platform",
  description:
    "Upload PDFs and chat with them using AI. Ask questions, get summaries, and extract insights from your documents instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
          <ToastProvider>
            <ErrorBoundary section="Application">{children}</ErrorBoundary>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

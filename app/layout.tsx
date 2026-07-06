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
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Chat with PDF — AI-Powered Interactive PDF Platform",
    description: "Upload your PDFs and have real-time AI conversations with them.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
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
            <ErrorBoundary section="Application">
              {children}
            </ErrorBoundary>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

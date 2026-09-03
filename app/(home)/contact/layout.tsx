import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Chat with PDF",
  description:
    "Get in touch with the Chat with PDF team for questions, feedback, or support.",
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

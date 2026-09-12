import CTASection from "@/components/HomePage/CTASection";
import FeaturesSection from "@/components/HomePage/FeaturesSection";
import HeroSection from "@/components/HomePage/HeroSection";
import HowItWorksSection from "@/components/HomePage/HowItWorksSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat with PDF | AI-Powered Interactive PDF Platform",
  description:
    "Upload PDFs and chat with them using AI. Ask questions, get summaries, and extract insights from your documents instantly.",
};

export default function Home() {
  return (
    <>
      <HeroSection />

      <FeaturesSection />

      <HowItWorksSection />

      <CTASection />
    </>
  );
}

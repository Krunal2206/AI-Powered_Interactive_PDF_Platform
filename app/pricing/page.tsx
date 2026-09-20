import FeatureComparison from "@/components/PricingPage/FeatureComparison";
import Faq from "@/components/PricingPage/Faq";
import Banner from "@/components/PricingPage/Banner";
import SubscriptionPlans from "@/components/PricingPage/SubscriptionPlans";
import { faqs } from "@/components/PricingPage/PricingData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Chat with PDF",
  description:
    "Choose the plan that fits your needs. Unlock unlimited PDF uploads, advanced AI models, and priority support.",
  openGraph: {
    title: "Pricing | Chat with PDF",
    description:
      "Choose the plan that fits your needs. Unlock unlimited PDF uploads, advanced AI models, and priority support.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const Page = () => {
  return (
    <div className="min-h-screen text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Unlock the full potential of your PDF documents with our
            intelligent chat system. Choose the plan that fits your needs and
            start chatting with your documents today.
          </p>
        </div>

        <SubscriptionPlans />

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <FeatureComparison />
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <Faq />
        </div>

        <Banner />
      </div>
    </div>
  );
};

export default Page;
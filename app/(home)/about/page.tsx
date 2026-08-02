import type { Metadata } from "next";
import { MessageCircle, Sparkles, Shield, Zap, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — Chat with PDF",
  description:
    "Learn about Chat with PDF — an AI-powered platform that transforms your PDFs into interactive conversations.",
};

const values = [
  {
    icon: Sparkles,
    title: "AI-First Approach",
    description:
      "We leverage cutting-edge AI models to deliver accurate, context-aware answers from your documents.",
  },
  {
    icon: Shield,
    title: "Privacy Focused",
    description:
      "Your documents are processed securely. We never share your data with third parties or use it for training.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Our vector search technology ensures instant retrieval from even the largest PDFs.",
  },
  {
    icon: Heart,
    title: "Built with Care",
    description:
      "Every feature is thoughtfully designed to save you time and make document interaction effortless.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <MessageCircle className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">
              About Us
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Making PDFs{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Conversational
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Chat with PDF was built to eliminate the frustration of searching
            through long documents. Upload any PDF and get instant, AI-powered
            answers to your questions.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Our Mission
            </h2>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                We believe that the knowledge locked inside PDFs should be
                instantly accessible. Whether you&apos;re a student studying
                textbooks, a professional reviewing contracts, or a researcher
                analyzing papers — you shouldn&apos;t have to read every page to
                find what you need.
              </p>
              <p>
                Chat with PDF uses advanced AI to understand your documents and
                answer your questions in natural language. Simply upload a PDF,
                ask a question, and get accurate answers with context — in
                seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="group bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors duration-300">
                  <value.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/10 p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Built with Modern Technology
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Chat with PDF is powered by a carefully chosen stack to deliver
              the best possible experience:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "Next.js", desc: "Full-stack React framework" },
                { name: "Google Gemini", desc: "Advanced AI language model" },
                { name: "Pinecone", desc: "Vector database for semantic search" },
                { name: "Firebase", desc: "Real-time database & storage" },
                { name: "Clerk", desc: "Secure authentication" },
                { name: "Cloudinary", desc: "PDF storage & delivery" },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                  <div>
                    <span className="text-white font-medium">{tech.name}</span>
                    <span className="text-slate-400 text-sm ml-2">
                      — {tech.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

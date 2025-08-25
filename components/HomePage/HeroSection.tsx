import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowRight, Search } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge
            variant="outline"
            className="mb-8 bg-purple-500/10 text-purple-300 border-purple-500/30 px-4 py-2 whitespace-normal break-words"
          >
            🚀 Your Interactive Document Comapanion
          </Badge>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Tranform Your PDFs into Interactive Conversations
          </h1>

          <p className="text-white font-bold mb-8">
            Introducing
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              Chat with PDF
            </span>
          </p>

          <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Upload your document, and our chatbot will help you find the
            information you need, summerize content, and answer all your
            questions. Ideal for everyone.{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              Chat with PDF{" "}
            </span>
            turns static documents into{" "}
            <span className="font-bold">dynamic conversations</span>, enhancing
            productivity 10x fold effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
            >
              <Link href={"/dashboard"} className="flex items-center">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 hover:bg-white/10 hover:text-white hover:shadow-purple-500/25 px-8 py-6 font-semibold shadow-2xl transition-all duration-300 text-lg"
            >
              <Link href={"/pricing"} className="flex items-center">
                <Search className="mr-2 w-5 h-5" />
                Find your Plan
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="text-white">
        I have to put the scrrenshot image of my website.
      </div>
    </section>
  );
}

export default HeroSection

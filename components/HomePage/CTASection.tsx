import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ArrowRight, Search } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <Badge
          variant="outline"
          className="mb-6 bg-white/20 text-white border-white/30"
        >
          Ready to Start?
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your PDFs?
        </h2>
        <p className="text-xl text-purple-100 mb-8 leading-relaxed max-w-2xl mx-auto">
          Join thousands of users who have revolutionized their document
          workflow with PDFChat. Start your journey today with our free tier.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl"
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
    </section>
  );
}

export default CTASection

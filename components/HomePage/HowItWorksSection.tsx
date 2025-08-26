import { CheckCircle, MessageCircle, Upload } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 bg-purple-500/10 text-purple-300 border-purple-500/30"
          >
            Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get started with PDFChat in just three simple steps and transform
            how you interact with your documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {[
            {
              icon: Upload,
              step: "1",
              title: "Upload Your PDF",
              description:
                "Simply drag and drop your PDF document or click to browse and upload from your device.",
            },
            {
              icon: MessageCircle,
              step: "2",
              title: "Start Asking Questions",
              description:
                "Type your questions about the document content and get instant, accurate responses powered by AI.",
            },
            {
              icon: CheckCircle,
              step: "3",
              title: "Get Instant Answers",
              description:
                "Receive detailed, contextual answers extracted directly from your PDF documents instantly.",
            },
          ].map((item, index) => (
            <Card
              key={index}
              className="group text-center bg-white/5 backdrop-blur-lg border-white/10 hover:border-purple-500/30 transition-all duration-300"
            >
              <CardHeader>
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-white text-purple-600 font-bold text-sm">
                    {item.step}
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-white mb-4">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 leading-relaxed text-base">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection

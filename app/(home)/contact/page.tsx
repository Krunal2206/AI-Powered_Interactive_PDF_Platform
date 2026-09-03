import { Mail, MessageCircle, Github, Twitter, Linkedin } from "lucide-react";
import ContactForm from "@/components/ContactPage/ContactForm";

const socialLinks = [
  {
    label: "Twitter",
    href: "/",
    icon: Twitter,
    color: "hover:text-sky-400 hover:border-sky-400/30 hover:bg-sky-400/10",
  },
  {
    label: "GitHub",
    href: "/",
    icon: Github,
    color:
      "hover:text-slate-200 hover:border-slate-400/30 hover:bg-slate-400/10",
  },
  {
    label: "LinkedIn",
    href: "/",
    icon: Linkedin,
    color: "hover:text-blue-400 hover:border-blue-400/30 hover:bg-blue-400/10",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <Mail className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">
              Contact Us
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Get in{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Have a question, suggestion, or just want to say hello? We&apos;d
            love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Send us a message
                </h2>
                <ContactForm />
              </div>
            </div>

            {/* Info Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Chat with PDF
                  </h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We&apos;re a small team passionate about making document
                  interaction smarter with AI. Your feedback helps us build
                  better tools.
                </p>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Connect with us
                </h3>
                <div className="space-y-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 text-slate-400 transition-all duration-300 ${social.color}`}
                    >
                      <social.icon className="w-5 h-5" />
                      <span className="font-medium">{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/10 p-8">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Response Time
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We typically respond within 24-48 hours. For urgent matters,
                  please reach out via social media.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

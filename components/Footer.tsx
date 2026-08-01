import Link from "next/link";
import { MessageCircle, Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/" },
      { label: "Careers", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/" },
    ],
  },
];

const socialLinks = [
  {
    label: "Twitter",
    href: "/",
    icon: Twitter,
  },
  {
    label: "GitHub",
    href: "/",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "/",
    icon: Linkedin,
  },
  {
    label: "Email",
    href: "/",
    icon: Mail,
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
      {/* Gradient top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 lg:py-16">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 transition-shadow duration-300 group-hover:shadow-purple-500/40">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Chat with PDF
              </span>
            </Link>

            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              Transform your PDFs into interactive conversations with
              AI-powered intelligence. Upload, ask, and get instant answers.
            </p>

            {/* Social links */}
            <div className="flex items-center space-x-3 mt-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/30 transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-purple-300 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} Chat with PDF. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Built with{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">
              ❤️ & AI
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

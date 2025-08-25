"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useState } from "react";

const NavigationItems = () => (
  <>
    <a
      href="#features"
      className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
    >
      Features
    </a>
    <a
      href="#how-it-works"
      className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
    >
      How it Works
    </a>
    <Link
      href="/pricing"
      className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
    >
      Pricing
    </Link>
  </>
);

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Chat to PDF</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <NavigationItems />
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              <Link href="/dashboard" className="flex items-center">
                Get Started
              </Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <NavigationItems />
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 w-full">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

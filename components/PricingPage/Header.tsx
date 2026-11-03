import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Logo from "@/components/Logo";

const Header = () => {
  return (
    <nav
      aria-label="Pricing navigation"
      className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Logo />
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/#features"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                How it Works
              </Link>
            </div>

            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              <Link href="/dashboard" className="flex items-center">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;

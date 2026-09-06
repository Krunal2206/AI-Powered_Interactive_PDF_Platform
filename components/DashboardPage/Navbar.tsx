"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import { Menu, MessageCircle, Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "My Documents", exact: true },
  { href: "/dashboard/profile", label: "Profile" },
];

interface NavigationItemsProps {
  onItemClick?: () => void;
  isMobile?: boolean;
}

const NavigationItems = ({ onItemClick, isMobile }: NavigationItemsProps) => {
  const pathname = usePathname();

  return (
    <>
      {NAV_LINKS.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onItemClick}
            aria-current={isActive ? "page" : undefined}
            className={`transition-colors text-sm font-medium ${
              isActive
                ? "text-purple-400 font-semibold"
                : "text-gray-300 hover:text-white"
            } ${isMobile ? "py-2 px-3 rounded-md hover:bg-white/5" : ""}`}
          >
            {label}
          </Link>
        );
      })}
      <Link
        href="/dashboard/upload"
        onClick={onItemClick}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-bold flex items-center space-x-1 justify-center shadow-md shadow-purple-500/20"
      >
        <Upload className="w-5 h-5 mr-2" /> Upload Document
      </Link>
    </>
  );
};

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Chat with PDF
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="items-center space-x-4 hidden md:flex">
              <NavigationItems />
            </div>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    userButtonPopoverActionButton: {
                      color: "#4CAF50",
                      fontWeight: "500",
                    },
                    userButtonPopoverActionButton__signOut: {
                      color: "#e53935",
                      fontWeight: "bold",
                    },
                  },
                }}
              />
            </SignedIn>

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
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <NavigationItems />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

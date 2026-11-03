import Logo from "@/components/Logo";
import { Button } from "../ui/button";
import Link from "next/link";
import HomeMobileNavbar from "./HomeMobileNavbar";

const NavigationItems = () => (
  <>
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
    <Link
      href="/pricing"
      className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
    >
      Pricing
    </Link>
  </>
);

const Navbar = () => (
  <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <HomeMobileNavbar
        header={
          <>
            <div className="flex items-center space-x-3">
              <Logo />
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
          </>
        }
      >
        <NavigationItems />
        <Button
          asChild
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full"
        >
          <Link href="/dashboard" className="flex items-center justify-center">
            Get Started
          </Link>
        </Button>
      </HomeMobileNavbar>
    </div>
  </nav>
);

export default Navbar;

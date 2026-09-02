"use client";

import { useState, type ReactNode } from "react";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";

type HomeMobileNavbarProps = {
  header: ReactNode;
  children: ReactNode;
};

const HomeMobileNavbar = ({ header, children }: HomeMobileNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center py-4">
        {header}
        <div className="md:hidden">
          <Button
            type="button"
            size="icon"
            onClick={() => setIsOpen((open) => !open)}
            className="text-white p-2 cursor-pointer"
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isOpen}
            aria-controls="mobile-navigation-menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>
      {isOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden py-4 border-t border-white/10"
        >
          <div className="flex flex-col space-y-4">{children}</div>
        </div>
      )}
    </>
  );
};

export default HomeMobileNavbar;

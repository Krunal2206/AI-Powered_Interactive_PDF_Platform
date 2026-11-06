"use client";

import { type ReactNode } from "react";
import { useMobileMenu } from "@/hooks/useMobileMenu";
import { MobileMenuButton } from "@/components/MobileMenuButton";

type HomeMobileNavbarProps = {
  header: ReactNode;
  children: ReactNode;
};

const HomeMobileNavbar = ({ header, children }: HomeMobileNavbarProps) => {
  const { isOpen, toggle } = useMobileMenu();

  return (
    <>
      <div className="flex justify-between items-center py-4">
        {header}
        <div className="md:hidden">
          <MobileMenuButton
            isOpen={isOpen}
            onToggle={toggle}
            ariaControls="mobile-navigation-menu"
          />
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

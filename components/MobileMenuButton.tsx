import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  ariaControls?: string;
  className?: string;
}

export function MobileMenuButton({
  isOpen,
  onToggle,
  ariaControls = "mobile-navigation-menu",
  className = "text-white p-2 cursor-pointer",
}: Readonly<MobileMenuButtonProps>) {
  return (
    <Button
      type="button"
      size="icon"
      onClick={onToggle}
      className={className}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
      aria-controls={ariaControls}
    >
      {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </Button>
  );
}


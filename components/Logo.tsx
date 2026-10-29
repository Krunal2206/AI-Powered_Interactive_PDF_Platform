import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface LogoProps {
  readonly href?: string;
  readonly className?: string;
  readonly textSize?: string;
  readonly iconSize?: string;
  readonly shadowClassName?: string;
}

export default function Logo({
  href = "/",
  className = "flex items-center space-x-3",
  textSize = "text-2xl",
  iconSize = "w-6 h-6",
  shadowClassName = "shadow-lg",
}: LogoProps) {
  return (
    <Link href={href} className={className}>
      <div
        className={`w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center ${shadowClassName}`}
      >
        <MessageCircle className={`${iconSize} text-white`} />
      </div>
      <span className={`${textSize} font-bold text-white`}>
        Chat with PDF
      </span>
    </Link>
  );
}

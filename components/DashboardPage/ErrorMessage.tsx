import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

interface ErrorMessageProps {
  title: string;
  message: string;
  onBackClick?: () => void;
  backButtonText?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  onBackClick,
  backButtonText = "Back to Dashboard",
}) => {
  return (
    <div className="p-8 min-h-screen">
      <div className="text-center py-12">
        <FileText size={64} className="text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-slate-300 mb-2">{title}</h2>
        <p className="text-slate-500 mb-6">{message}</p>
        {onBackClick && (
          <Button
            onClick={onBackClick}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ArrowLeft size={16} className="mr-2" />
            {backButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};

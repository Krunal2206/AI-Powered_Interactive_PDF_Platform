import { Plus } from "lucide-react";

interface AddDocumentCardProps {
  onClick: () => void;
}

export const AddDocumentCard: React.FC<AddDocumentCardProps> = ({
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative aspect-[3/4] bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10 hover:scale-105"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <div className="mb-4 p-4 rounded-full bg-slate-700/30 group-hover:bg-purple-600/20 transition-colors duration-300">
          <Plus
            size={32}
            className="text-slate-400 group-hover:text-purple-400 transition-colors duration-300"
          />
        </div>

        <p className="text-slate-400 group-hover:text-purple-300 text-sm font-medium transition-colors duration-300 text-center">
          Add a Document
        </p>

        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-purple-900/10 rounded-lg transition-all duration-300" />
      </div>
    </div>
  );
};

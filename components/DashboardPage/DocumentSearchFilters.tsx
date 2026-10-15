import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";

export type SortOption =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "size-desc"
  | "most-chats";

interface DocumentSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

export const DocumentSearchFilters: React.FC<DocumentSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4" role="search" aria-label="Document search and filters">
      <div className="relative flex-1">
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
        />
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search documents"
          className="pl-10 bg-slate-800/50 border-slate-700 text-slate-300 placeholder-slate-500 focus:border-purple-500"
        />
      </div>

      <Select value={sortOption} onValueChange={setSortOption}>
        <SelectTrigger className="w-full sm:w-52 bg-slate-800/50 border-slate-700 text-slate-300 cursor-pointer">
          <ArrowUpDown size={16} className="mr-2 shrink-0" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 text-slate-300">
          <SelectItem value="newest" className="cursor-pointer">Newest First</SelectItem>
          <SelectItem value="oldest" className="cursor-pointer">Oldest First</SelectItem>
          <SelectItem value="name-asc" className="cursor-pointer">Name A → Z</SelectItem>
          <SelectItem value="name-desc" className="cursor-pointer">Name Z → A</SelectItem>
          <SelectItem value="size-desc" className="cursor-pointer">Largest First</SelectItem>
          <SelectItem value="most-chats" className="cursor-pointer">Most Questions</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
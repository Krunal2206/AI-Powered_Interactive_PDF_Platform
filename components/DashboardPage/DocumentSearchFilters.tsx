import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface DocumentSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

export const DocumentSearchFilters: React.FC<DocumentSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
        />
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-700 text-slate-300 placeholder-slate-500 focus:border-purple-500"
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-48 bg-slate-800/50 border-slate-700 text-slate-300">
          <Filter size={16} className="mr-2" />
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800/50 border-slate-700 text-slate-300">
          <SelectItem value="all">All Documents</SelectItem>
          <SelectItem value="ready">Ready</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="uploading">Uploading</SelectItem>
          <SelectItem value="error">Error</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

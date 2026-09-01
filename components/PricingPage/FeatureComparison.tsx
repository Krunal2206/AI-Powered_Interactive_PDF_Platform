import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Check, Clock } from "lucide-react";
import { featureComparison } from "./PricingData";

const renderValue = (value: string) => {
  if (value === "✓") {
    return <Check className="w-5 h-5 text-green-400 mx-auto" />;
  }
  if (value === "Coming soon") {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 text-slate-500">
        <Clock className="w-4 h-4 shrink-0" />
        <span className="text-sm">Coming soon</span>
      </span>
    );
  }
  return <span className="text-white">{value}</span>;
};

const FeatureComparison = () => {
  return (
    <Table className="w-full rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700">
      <TableHeader>
        <TableRow className="border-b border-slate-700">
          <TableHead className="text-left p-6 font-medium text-white">
            Features
          </TableHead>
          <TableHead className="text-center p-6 font-medium text-white">
            Free
          </TableHead>
          <TableHead className="text-center p-6 font-medium text-white">
            Pro
          </TableHead>
          <TableHead className="text-center p-6 font-medium text-white">
            Team
          </TableHead>
          <TableHead className="text-center p-6 font-medium text-white">
            Enterprise
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {featureComparison.map((row) => (
          <TableRow key={row.feature} className="border-b border-slate-700/50">
            <TableCell className="p-6 font-medium">{row.feature}</TableCell>
            <TableCell className="p-6 text-center">
              {renderValue(row.free)}
            </TableCell>
            <TableCell className="p-6 text-center">
              {renderValue(row.pro)}
            </TableCell>
            <TableCell className="p-6 text-center">
              {renderValue(row.team)}
            </TableCell>
            <TableCell className="p-6 text-center">
              {renderValue(row.enterprise)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FeatureComparison;

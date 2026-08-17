import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { featureComparison } from "./PricingData";

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
            <td className="p-6 text-center text-slate-400">{row.free}</td>
            <TableCell className="p-6 text-center">{row.pro}</TableCell>
            <TableCell className="p-6 text-center">{row.team}</TableCell>
            <TableCell className="p-6 text-center">{row.enterprise}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FeatureComparison;

function DetailRow({
  label,
  value,
  valueColor,
}: Readonly<{
  label: string;
  value: string;
  valueColor?: string;
}>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-slate-400 mb-1 sm:mb-0">{label}</span>
      <span
        className={`text-sm font-medium ${valueColor || "text-slate-200"} break-all sm:text-right`}
      >
        {value}
      </span>
    </div>
  );
}

export default DetailRow;

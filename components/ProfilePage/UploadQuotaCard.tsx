import { ChevronDown, FileText, Upload } from "lucide-react";
import type { UploadRecord, UploadUsageSummary } from "@/types/upload";

interface UploadQuotaCardProps {
  usage: UploadUsageSummary | null;
  loading: boolean;
  limit: number;
  documentTitles: Record<string, string>; // documentId -> title, for existing documents
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// First day of the month after `period` (Date.UTC rolls December into January)
function formatResetDate(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatUploadTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function UploadList({
  uploads,
  documentTitles,
}: Readonly<{
  uploads: UploadRecord[];
  documentTitles: Record<string, string>;
}>) {
  return (
    <ul className="divide-y divide-white/5">
      {uploads.map((upload) => {
        const existingTitle = upload.documentId
          ? documentTitles[upload.documentId]
          : undefined;
        const inProgress = upload.status === "reserved";
        const deleted = !inProgress && !existingTitle;
        const label = inProgress
          ? "Upload in progress"
          : (existingTitle ?? "Deleted document");

        return (
          <li
            key={upload.id}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <span
                className={`text-sm truncate ${
                  deleted ? "text-slate-500 italic" : "text-slate-200"
                }`}
              >
                {label}
              </span>
            </div>
            <span className="text-xs text-slate-400 shrink-0">
              {formatUploadTime(upload.at)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function UnlistedNotice({ count }: Readonly<{ count: number }>) {
  if (count <= 0) return null;
  const isSingle = count === 1;
  return (
    <p className="text-xs text-slate-500 mt-2">
      {count} earlier {isSingle ? "upload" : "uploads"} this month{" "}
      {isSingle ? "was" : "were"} made before upload tracking started, so{" "}
      {isSingle ? "it isn't" : "they aren't"} listed.
    </p>
  );
}

function PastMonthsSection({
  history,
  documentTitles,
}: Readonly<{
  history: UploadUsageSummary["history"];
  documentTitles: Record<string, string>;
}>) {
  if (history.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-slate-300 mb-2">Past months</h4>
      <div className="space-y-2">
        {history.map((month) => (
          <details
            key={month.period}
            className="group rounded-lg border border-white/10 px-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm text-slate-200">
              <span>
                {formatPeriod(month.period)} · {month.count}{" "}
                {month.count === 1 ? "upload" : "uploads"}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            {month.uploads.length > 0 ? (
              <UploadList
                uploads={month.uploads}
                documentTitles={documentTitles}
              />
            ) : (
              <p className="pb-3 text-xs text-slate-500">
                No upload details were recorded for this month.
              </p>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}

function UsageDetails({
  usage,
  limit,
  documentTitles,
}: Readonly<{
  usage: UploadUsageSummary;
  limit: number;
  documentTitles: Record<string, string>;
}>) {
  const used = usage.used;
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const isFull = used >= limit;
  const unlisted = Math.max(0, used - usage.uploads.length);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <p className="text-2xl font-bold text-white">
          {used}
          <span className="text-base font-normal text-slate-400">
            {" "}
            of {limit} uploads used
          </span>
        </p>
        <p className="text-sm text-slate-400">
          Resets {formatResetDate(usage.period)} (00:00 UTC)
        </p>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-6">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFull
              ? "bg-rose-500"
              : "bg-gradient-to-r from-purple-500 to-pink-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <h4 className="text-sm font-semibold text-slate-300 mb-1">
        {formatPeriod(usage.period)}
      </h4>
      {usage.uploads.length > 0 ? (
        <UploadList
          uploads={usage.uploads}
          documentTitles={documentTitles}
        />
      ) : (
        <p className="text-sm text-slate-500 py-3">
          No tracked uploads yet this month.
        </p>
      )}

      <UnlistedNotice count={unlisted} />

      <PastMonthsSection
        history={usage.history}
        documentTitles={documentTitles}
      />

      <p className="text-xs text-slate-500 mt-6">
        Deleting a document does not free an upload slot. Months are counted
        in UTC, so an upload late on the last day of a month in your
        timezone may count towards the next month.
      </p>
    </>
  );
}

export default function UploadQuotaCard({
  usage,
  loading,
  limit,
  documentTitles,
}: Readonly<UploadQuotaCardProps>) {
  let content = (
    <p className="text-sm text-slate-400">
      Couldn&apos;t load your upload usage right now.
    </p>
  );

  if (loading) {
    content = <p className="text-sm text-slate-400">Loading upload usage…</p>;
  } else if (usage) {
    content = (
      <UsageDetails
        usage={usage}
        limit={limit}
        documentTitles={documentTitles}
      />
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 mb-8">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-purple-400" />
        Monthly Upload Quota
      </h3>
      {content}
    </div>
  );
}
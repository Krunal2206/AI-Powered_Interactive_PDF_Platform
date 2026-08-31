"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { getUserDocuments } from "@/lib/firebaseops";
import { Document } from "@/types/upload";
import ProfileSkeleton from "@/components/ProfilePage/ProfileSkeleton";
import DetailRow from "@/components/ProfilePage/DetailRow";
import {
  User,
  Mail,
  Calendar,
  FileText,
  HardDrive,
  MessageSquare,
  Shield,
  ExternalLink,
  BarChart3,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface UsageStats {
  totalDocuments: number;
  totalStorage: number;
  totalChats: number;
  recentUpload: Date | null;
  processedDocuments: number;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<UsageStats>({
    totalDocuments: 0,
    totalStorage: 0,
    totalChats: 0,
    recentUpload: null,
    processedDocuments: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const documents: Document[] = await getUserDocuments(user.id);

      const totalStorage = documents.reduce(
        (sum, doc) => sum + (doc.fileSize || 0),
        0,
      );
      const totalChats = documents.reduce(
        (sum, doc) => sum + (doc.totalChats || 0),
        0,
      );
      const processedDocuments = documents.filter(
        (doc) => doc.status === "ready",
      ).length;

      const sortedByDate = [...documents].sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      );

      setStats({
        totalDocuments: documents.length,
        totalStorage,
        totalChats,
        recentUpload: sortedByDate[0]?.uploadedAt
          ? new Date(sortedByDate[0].uploadedAt)
          : null,
        processedDocuments,
      });
    } catch (error) {
      console.error("Error loading profile stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  if (!isLoaded) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return null;
  }

  const statCards = [
    {
      icon: FileText,
      label: "Total Documents",
      value: loading ? "—" : stats.totalDocuments.toString(),
      gradient: "from-purple-500/20 to-blue-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: HardDrive,
      label: "Storage Used",
      value: loading ? "—" : formatBytes(stats.totalStorage),
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
    },
    {
      icon: MessageSquare,
      label: "Total Chats",
      value: loading ? "—" : stats.totalChats.toString(),
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
    {
      icon: BarChart3,
      label: "Processed",
      value: loading
        ? "—"
        : `${stats.processedDocuments}/${stats.totalDocuments}`,
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-400",
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-light text-gray-300 mb-2">
            Account Settings
          </h1>
          <p className="text-slate-400">
            Manage your profile and view usage statistics
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.fullName || "User avatar"}
                  width={96}
                  height={96}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-purple-500/30 shadow-lg shadow-purple-500/10"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/10">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                {user.fullName || "User"}
              </h2>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate">
                    {user.primaryEmailAddress?.emailAddress || "No email"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="text-sm">
                    Joined{" "}
                    {user.createdAt ? formatDate(user.createdAt) : "Unknown"}
                  </span>
                </div>
                {stats.recentUpload && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="text-sm">
                      Last upload: {formatDate(stats.recentUpload)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Manage Account Button */}
            <div className="shrink-0">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold cursor-pointer"
              >
                <Link
                  href={`${process.env.NEXT_PUBLIC_CLERK_MANAGE_PROFILE_URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Manage Account
                  <ExternalLink className="w-3.5 h-3.5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Usage Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="group bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/10 p-5 hover:border-purple-500/30 transition-all duration-300"
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-white mb-6">
            Account Details
          </h3>
          <div className="space-y-4">
            <DetailRow label="User ID" value={user.id} />
            <DetailRow
              label="Full Name"
              value={user.fullName || "Not provided"}
            />
            <DetailRow
              label="Email"
              value={user.primaryEmailAddress?.emailAddress || "Not provided"}
            />
            <DetailRow
              label="Email Verified"
              value={
                user.primaryEmailAddress?.verification?.status === "verified"
                  ? "Yes"
                  : "No"
              }
              valueColor={
                user.primaryEmailAddress?.verification?.status === "verified"
                  ? "text-emerald-400"
                  : "text-amber-400"
              }
            />
            <DetailRow
              label="Account Created"
              value={user.createdAt ? formatDate(user.createdAt) : "Unknown"}
            />
            <DetailRow
              label="Last Sign In"
              value={
                user.lastSignInAt ? formatDate(user.lastSignInAt) : "Unknown"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import Navbar from "@/components/DashboardPage/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Chat with PDF",
    default: "Dashboard | Chat with PDF",
  },
  description: "Manage and interact with your uploaded documents.",
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;

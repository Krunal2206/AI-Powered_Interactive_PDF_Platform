"use client";

import { Button } from "../ui/button";
import Link from "next/link";

const Banner = () => {
  return (
    <div className="text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-12 backdrop-blur-sm border border-purple-500/30">
      <h2 className="text-3xl font-bold mb-4">
        Ready to Transform Your PDF Experience?
      </h2>
      <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
        Join thousands of users who are already chatting with their documents.
        Start your free trial today.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          asChild
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg cursor-pointer"
        >
          <Link href="/dashboard" className="flex items-center">
            Start Free Trial
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Banner;

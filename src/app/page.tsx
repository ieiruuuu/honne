"use client";

import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { FeedList } from "@/features/feed/FeedList";
import { LABELS } from "@/lib/constants/ja";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Welcome Message */}
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 border border-blue-100">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {LABELS.WELCOME_TITLE}
          </h1>
          <p className="text-sm text-gray-600">
            {LABELS.WELCOME_DESC}
          </p>
        </div>

        {/* Posts Feed */}
        <FeedList />
      </main>

      <BottomNav />
    </div>
  );
}

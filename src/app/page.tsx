"use client";

import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { FeedList } from "@/features/feed/FeedList";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto max-w-2xl px-4 py-6">
        <FeedList />
      </main>

      <BottomNav />
    </div>
  );
}

"use client";

import { PostCard } from "@/features/posts/PostCard";
import { usePosts } from "./hooks/usePosts";
import { LABELS } from "@/lib/constants/ja";
import { Loader2 } from "lucide-react";

export function FeedList() {
  const { posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">{LABELS.LOADING}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-gray-500">{LABELS.NO_POSTS}</p>
          <p className="text-xs text-gray-400 mt-2">
            最初の投稿をしてみましょう！
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

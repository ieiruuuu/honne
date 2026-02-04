"use client";

import { PostCard } from "@/features/posts/PostCard";
import { usePosts } from "./hooks/usePosts";
import { LABELS } from "@/lib/constants/ja";
import { Loader2, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function FeedList() {
  const { posts, isLoading, error } = usePosts();
  const router = useRouter();

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
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          {/* アイコン */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <PenSquare className="w-10 h-10 text-gray-400" />
            </div>
          </div>

          {/* タイトル */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {LABELS.NO_POSTS}
          </h3>

          {/* サブタイトル */}
          <p className="text-sm text-gray-600 mb-8">
            {LABELS.NO_POSTS_SUBTITLE}
          </p>

          {/* CTAボタン */}
          <Button
            onClick={() => router.push("/write")}
            size="lg"
            className="gap-2"
          >
            <PenSquare className="w-4 h-4" />
            {LABELS.NO_POSTS_CTA}
          </Button>

          {/* 追加の説明 */}
          <p className="text-xs text-gray-500 mt-6">
            匿名で安心して本音を共有できます
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

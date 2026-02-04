"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { PostCard } from "@/features/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/features/feed/hooks/usePosts";
import { Category } from "@/types";
import { CATEGORY_COLORS, LABELS } from "@/lib/constants/ja";
import { getCategoryIcon } from "@/features/posts/PostCard";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryParam = decodeURIComponent(params.category as string);
  
  // カテゴリーでフィルタリング
  const { posts, isLoading, error } = usePosts(categoryParam as Category);
  
  const CategoryIcon = getCategoryIcon(categoryParam as Category);
  const colorClass = CATEGORY_COLORS[categoryParam as Category];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* カテゴリーヘッダー */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            すべてに戻る
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Badge className={`${colorClass} px-3 py-2 text-base`}>
              <CategoryIcon className="w-5 h-5 mr-2" />
              {categoryParam}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600">
            {posts.length}件の投稿
          </p>
        </div>

        {/* フィード */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-500">{LABELS.LOADING}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                {error}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                このカテゴリーにはまだ投稿がありません
              </p>
              <p className="text-xs text-gray-400 mt-2">
                最初の投稿をしてみましょう！
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

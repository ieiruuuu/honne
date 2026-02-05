"use client";

import { PostCard } from "@/features/posts/PostCard";
import { usePosts } from "./hooks/usePosts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LABELS } from "@/lib/constants/ja";
import { Loader2, PenSquare, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthModal } from "@/features/auth/components/AuthModal";

export function FeedList() {
  const { posts, isLoading, error } = usePosts();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration 에러 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration 완료까지 대기
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
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
      <>
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
            {!authLoading && (
              <>
                {isAuthenticated ? (
                  <Button
                    onClick={() => router.push("/write")}
                    size="lg"
                    className="gap-2"
                  >
                    <PenSquare className="w-4 h-4" />
                    {LABELS.NO_POSTS_CTA}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowAuthModal(true)}
                      size="lg"
                      className="gap-2 w-full"
                    >
                      <Lock className="w-4 h-4" />
                      ログインして投稿する
                    </Button>
                    <p className="text-xs text-gray-500">
                      ログインすると投稿・コメント・いいねができます
                    </p>
                  </div>
                )}
              </>
            )}

            {/* 追加の説明 */}
            <p className="text-xs text-gray-500 mt-6">
              匿名で安心して本音を共有できます
            </p>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Guest 사용자 안내 배너 (mounted 후에만 표시) */}
        {mounted && !authLoading && !isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 text-sm mb-1">
                  ゲストモードで閲覧中
                </h4>
                <p className="text-xs text-blue-700 mb-3">
                  投稿・コメント・いいねをするにはログインが必要です
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="gap-2"
                >
                  <Lock className="w-3 h-3" />
                  ログイン
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 게시물 목록 */}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}

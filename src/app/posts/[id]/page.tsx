"use client";

import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePost } from "@/features/posts/hooks/usePost";
import { useComments } from "@/features/posts/hooks/useComments";
import { POST_DETAIL_LABELS } from "@/features/posts/constants";
import { LABELS, CATEGORY_COLORS } from "@/lib/constants/ja";
import { 
  Heart, 
  MessageCircle, 
  ArrowLeft, 
  Send, 
  Loader2, 
  AlertCircle,
  Coins,
  Scale,
  Gift,
  Briefcase,
  Users,
  Shield,
  Clock,
  Brain,
  LucideIcon
} from "lucide-react";
import { useState } from "react";
import type { Category } from "@/types";

/**
 * カテゴリー別アイコン取得
 */
const getCategoryIcon = (category: Category): LucideIcon => {
  const iconMap: Record<Category, LucideIcon> = {
    "年収・手取り": Coins,
    "ホワイト・ブラック判定": Scale,
    "ボーナス報告": Gift,
    "転職のホンネ": Briefcase,
    "人間関係・上司": Users,
    "社内政治・派閥": Shield,
    "サービス残業・待遇": Clock,
    "福利厚生・環境": Heart,
    "メンタル・悩み": Brain,
    "つぶやき": MessageCircle,
  };
  return iconMap[category] || MessageCircle;
};

/**
 * カテゴリー別カラー取得
 */
const getCategoryColor = (category: Category): string => {
  return CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800 border-gray-200";
};

/**
 * 時間経過表示
 */
const timeAgo = (date: string) => {
  const now = new Date();
  const posted = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - posted.getTime()) / 60000);
  
  if (diffInMinutes < 1) return LABELS.JUST_NOW;
  if (diffInMinutes < 60) return `${diffInMinutes}${LABELS.MINUTES_AGO}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}${LABELS.HOURS_AGO}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}${LABELS.DAYS_AGO}`;
};

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const { post, isLoading: postLoading, error: postError } = usePost(postId);
  const { comments, count: commentCount, isLoading: commentsLoading } = useComments(postId);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  
  // 統合ローディング状態
  const isLoading = postLoading;
  const error = postError;

  const handleLike = () => {
    setLiked(!liked);
    // TODO: Supabase 連携
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    // TODO: Supabase 連携
    alert(`コメントを投稿しました: ${comment}`);
    setComment("");
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-sm text-gray-600">{POST_DETAIL_LABELS.LOADING}</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // エラー状態 - 投稿が見つからない
  if (error === "NOT_FOUND" || !post) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {POST_DETAIL_LABELS.NOT_FOUND_TITLE}
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              {POST_DETAIL_LABELS.NOT_FOUND_MESSAGE}
            </p>
            <Button onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {POST_DETAIL_LABELS.BACK_TO_HOME}
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // エラー状態 - その他のエラー
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {POST_DETAIL_LABELS.ERROR_TITLE}
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">{error}</p>
            <Button onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {POST_DETAIL_LABELS.BACK_TO_HOME}
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(post.category);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* 戻るボタン */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {POST_DETAIL_LABELS.BACK}
        </Button>

        {/* 投稿詳細 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-medium">
                  {post.nickname.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{post.nickname}</p>
                  <p className="text-xs text-gray-500">{timeAgo(post.created_at)}</p>
                </div>
              </div>
              <Badge className={`${getCategoryColor(post.category)} flex items-center gap-1`}>
                <CategoryIcon className="w-3 h-3" />
                <span className="text-xs">{post.category}</span>
              </Badge>
            </div>

            <p className="text-base leading-relaxed whitespace-pre-wrap mb-4">
              {post.content}
            </p>

            <div className="flex gap-4 pt-4 border-t">
              <Button
                variant={liked ? "default" : "ghost"}
                size="sm"
                onClick={handleLike}
                className="gap-2"
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{post.likes_count + (liked ? 1 : 0)}</span>
                <span className="text-xs">{LABELS.LIKES}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{commentCount}</span>
                <span className="text-xs">{LABELS.COMMENT}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* コメント一覧 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {POST_DETAIL_LABELS.COMMENTS_TITLE} ({commentCount})
          </h2>
          
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">まだコメントがありません</p>
                <p className="text-xs mt-1">最初のコメントを投稿しましょう</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <Card key={c.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {c.nickname.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">{c.nickname}</span>
                          <span className="text-xs text-gray-500">{timeAgo(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* コメント入力 */}
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={POST_DETAIL_LABELS.COMMENT_PLACEHOLDER}
                className="w-full min-h-[100px] p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{comment.length}/500</span>
                <Button type="submit" disabled={!comment.trim()} className="gap-2">
                  <Send className="w-4 h-4" />
                  {LABELS.POST}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

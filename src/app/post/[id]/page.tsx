"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LABELS } from "@/lib/constants/ja";
import { Heart, MessageCircle, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";

// 모크 게시글 데이터
const mockPost = {
  id: "1",
  content: "上司との関係に悩んでいます。毎日のように小さなことで怒られて、精神的に辛いです。転職を考えるべきでしょうか...",
  category: "인간관계",
  nickname: "匿名太郎",
  likes_count: 24,
  created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
};

// 모크 댓글 데이터
const mockComments = [
  {
    id: "1",
    post_id: "1",
    content: "私も同じような経験があります。まずは上司以外の人に相談してみてはいかがでしょうか。",
    nickname: "サラリーマン",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    post_id: "1",
    content: "転職する前に、人事部門に相談することをお勧めします。",
    nickname: "人事担当者",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    "인간관계": "bg-blue-100 text-blue-800 border-blue-200",
    "급여": "bg-green-100 text-green-800 border-green-200",
    "블랙기업": "bg-red-100 text-red-800 border-red-200",
    "커리어": "bg-purple-100 text-purple-800 border-purple-200",
    "직장생활": "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colorMap[category] || "bg-gray-100 text-gray-800 border-gray-200";
};

const timeAgo = (date: string) => {
  const now = new Date();
  const posted = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - posted.getTime()) / 60000);
  
  if (diffInMinutes < 1) return "たった今";
  if (diffInMinutes < 60) return `${diffInMinutes}分前`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}時間前`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}日前`;
};

export default function PostDetailPage() {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    // TODO: Supabase 연동
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    // TODO: Supabase 연동
    alert(`コメントを投稿しました: ${comment}`);
    setComment("");
  };

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
          戻る
        </Button>

        {/* 投稿詳細 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-medium">
                  {mockPost.nickname.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{mockPost.nickname}</p>
                  <p className="text-xs text-gray-500">{timeAgo(mockPost.created_at)}</p>
                </div>
              </div>
              <Badge className={getCategoryColor(mockPost.category)}>
                {mockPost.category}
              </Badge>
            </div>

            <p className="text-base leading-relaxed whitespace-pre-wrap mb-4">
              {mockPost.content}
            </p>

            <div className="flex gap-4 pt-4 border-t">
              <Button
                variant={liked ? "default" : "ghost"}
                size="sm"
                onClick={handleLike}
                className="gap-2"
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{mockPost.likes_count + (liked ? 1 : 0)}</span>
                <span className="text-xs">{LABELS.LIKES}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{mockComments.length}</span>
                <span className="text-xs">{LABELS.COMMENT}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* コメント一覧 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {LABELS.COMMENT} ({mockComments.length})
          </h2>
          <div className="space-y-3">
            {mockComments.map((c) => (
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
        </div>

        {/* コメント入力 */}
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="コメントを書く..."
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

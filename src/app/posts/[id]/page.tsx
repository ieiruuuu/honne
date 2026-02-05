"use client";

import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePost } from "@/features/posts/hooks/usePost";
import { useComments, Comment } from "@/features/posts/hooks/useComments";
import { useLike } from "@/features/posts/hooks/useLike";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { CommentItem } from "@/features/posts/components/CommentItem";
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
  ThumbsUp,
  Reply,
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
  const { comments, count: commentCount, isLoading: commentsLoading, createComment } = useComments(postId);
  const { user, isAuthenticated } = useAuth();
  const { likesCount, isLiked, toggleLike } = useLike(
    postId,
    post?.likes_count || 0,
    user?.id
  );
  const [comment, setComment] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // 返信対象コメントID
  const [replyContent, setReplyContent] = useState(""); // 返信内容
  
  // 統合ローディング状態
  const isLoading = postLoading;
  const error = postError;

  const handleLike = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    await toggleLike();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ログインチェック
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // ユーザーIDチェック
    if (!user?.id) {
      console.error('❌ User ID is missing');
      alert('ログイン情報が見つかりません。再度ログインしてください。');
      setShowAuthModal(true);
      return;
    }
    
    // コメント内容チェック
    if (!comment.trim()) {
      alert('コメントを入力してください');
      return;
    }

    // 投稿データチェック
    if (!post) {
      console.error('❌ Post data is missing');
      alert('投稿情報の取得に失敗しました');
      return;
    }

    // ニックネーム決定ロジック
    // 投稿者が自分の投稿にコメントする場合: 投稿時のニックネーム使用
    // 他のユーザーがコメントする場合: 各自の匿名ニックネーム使用
    const isPostAuthor = post.user_id === user.id;
    const commentNickname = isPostAuthor ? post.nickname : (user.nickname || '名無し');

    console.log('👤 Comment author info:', {
      isPostAuthor,
      postAuthorId: post.user_id,
      commenterId: user.id,
      postNickname: post.nickname,
      userNickname: user.nickname,
      finalNickname: commentNickname,
    });

    setIsSubmittingComment(true);

    try {
      console.log('📝 Submitting comment:', {
        post_id: postId,
        user_id: user.id,
        nickname: commentNickname,
        content: comment.trim().substring(0, 50) + '...',
      });

      const result = await createComment({
        post_id: postId,
        user_id: user.id,
        content: comment.trim(),
        nickname: commentNickname,
      });

      if (result.success) {
        console.log('✅ Comment submitted successfully');
        alert('コメントを投稿しました！');
        setComment("");
      } else {
        console.error('❌ Comment submission failed:', result.error);
        alert(`コメントの投稿に失敗しました: ${result.error}`);
      }
    } catch (err) {
      console.error('❌ Comment submission exception:', err);
      alert('コメントの投稿中にエラーが発生しました');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentInputClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  };

  /**
   * 返信送信
   */
  const handleReplySubmit = async (parentId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!user?.id || !post) {
      alert('ログイン情報が見つかりません');
      return;
    }

    if (!replyContent.trim()) {
      alert('返信内容を入力してください');
      return;
    }

    const isPostAuthor = post.user_id === user.id;
    const commentNickname = isPostAuthor ? post.nickname : (user.nickname || '名無し');

    setIsSubmittingComment(true);

    try {
      const result = await createComment({
        post_id: postId,
        user_id: user.id,
        content: replyContent.trim(),
        nickname: commentNickname,
        parent_id: parentId, // 親コメントIDを指定
      });

      if (result.success) {
        console.log('✅ Reply submitted successfully');
        alert('返信を投稿しました！');
        setReplyContent("");
        setReplyingTo(null); // 返信モードを閉じる
      } else {
        console.error('❌ Reply submission failed:', result.error);
        alert(`返信の投稿に失敗しました: ${result.error}`);
      }
    } catch (err) {
      console.error('❌ Reply submission exception:', err);
      alert('返信の投稿中にエラーが発生しました');
    } finally {
      setIsSubmittingComment(false);
    }
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

  // エラー状態 - Supabase未設定
  if (error === "SUPABASE_NOT_CONFIGURED") {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-16 h-16 text-orange-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Supabaseが設定されていません
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 max-w-md">
              <p className="text-sm text-gray-700 mb-3">
                <strong>手順:</strong>
              </p>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Supabase Dashboard → Settings → API</li>
                <li>Project URLとanon keyをコピー</li>
                <li>.env.localファイルを更新</li>
                <li>開発サーバーを再起動: npm run dev</li>
              </ol>
            </div>
            <Button onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              ホームに戻る
            </Button>
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

            {/* 画像表示 */}
            {post.image_url && (
              <div className="mb-4">
                <img
                  src={post.image_url}
                  alt="投稿画像"
                  className="w-full h-auto max-h-96 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="gap-2"
              >
                <Heart 
                  className={`w-4 h-4 transition-colors ${
                    isLiked 
                      ? "fill-red-500 text-red-500" 
                      : "text-gray-600"
                  }`}
                />
                <span className={`${isLiked ? "text-red-500 font-medium" : ""}`}>
                  {likesCount}
                </span>
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
                <CommentItem
                  key={c.id}
                  comment={c}
                  postAuthorId={post?.user_id}
                  postNickname={post?.nickname}
                  userId={user?.id}
                  isAuthenticated={isAuthenticated}
                  onReply={async (parentId, content) => {
                    // 返信処理
                    if (!user?.id || !post) return;
                    
                    const isPostAuthor = post.user_id === user.id;
                    const commentNickname = isPostAuthor ? post.nickname : (user.nickname || '名無し');
                    
                    setIsSubmittingComment(true);
                    try {
                      const result = await createComment({
                        post_id: postId,
                        user_id: user.id,
                        content: content,
                        nickname: commentNickname,
                        parent_id: parentId,
                      });

                      if (result.success) {
                        alert('返信を投稿しました！');
                      } else {
                        alert(`返信の投稿に失敗しました: ${result.error}`);
                      }
                    } finally {
                      setIsSubmittingComment(false);
                    }
                  }}
                  onAuthRequired={() => setShowAuthModal(true)}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>

        {/* コメント入力 */}
        <Card>
          <CardContent className="pt-4">
            {!isAuthenticated ? (
              <div 
                onClick={() => setShowAuthModal(true)}
                className="cursor-pointer"
              >
                <div className="relative">
                  <textarea
                    placeholder={POST_DETAIL_LABELS.LOGIN_PROMPT}
                    className="w-full min-h-[100px] p-3 text-sm border border-gray-300 rounded-lg resize-none bg-gray-50 cursor-pointer"
                    disabled
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="text-center">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {POST_DETAIL_LABELS.LOGIN_REQUIRED_COMMENT}
                      </p>
                      <Button size="sm" className="gap-2 mt-2">
                        <Send className="w-4 h-4" />
                        {POST_DETAIL_LABELS.LOGIN_TO_COMMENT}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onClick={handleCommentInputClick}
                  placeholder={POST_DETAIL_LABELS.COMMENT_PLACEHOLDER}
                  className="w-full min-h-[100px] p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{comment.length}/500</span>
                  <Button 
                    type="submit" 
                    disabled={!comment.trim() || isSubmittingComment} 
                    className="gap-2"
                  >
                    {isSubmittingComment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        投稿中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {LABELS.POST}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

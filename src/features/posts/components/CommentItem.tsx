"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Reply, Send, Loader2, CornerDownRight } from "lucide-react";
import { Comment } from "../hooks/useComments";
import { useCommentLike } from "../hooks/useCommentLike";
import { LABELS } from "@/lib/constants/ja";

interface CommentItemProps {
  comment: Comment;
  postAuthorId?: string;
  postNickname?: string;
  userId?: string;
  isAuthenticated: boolean;
  onReply: (commentId: string, content: string) => Promise<void>;
  onAuthRequired: () => void;
  depth?: number; // ネストの深さ (0 = トップレベル)
}

/**
 * 時間経過表示
 */
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

export function CommentItem({
  comment,
  postAuthorId,
  postNickname,
  userId,
  isAuthenticated,
  onReply,
  onAuthRequired,
  depth = 0,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 投稿者判定
  const isAuthor = postAuthorId === comment.user_id;
  const displayNickname = isAuthor ? postNickname : comment.nickname;

  // コメントいいね
  const { likesCount, isLiked, toggleLike } = useCommentLike(
    comment.id,
    comment.likes_count || 0,
    userId
  );

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    await toggleLike();
  };

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    setShowReplyInput(!showReplyInput);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      alert('返信内容を入力してください');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onReply(comment.id, replyContent.trim());
      setReplyContent("");
      setShowReplyInput(false);
    } catch (err) {
      console.error('❌ Reply submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 最大ネスト深度 (2階層まで: 親コメント + 返信のみ)
  const maxDepth = 0; // depth 0 (親コメント)のみ返信可能
  const canReply = depth <= maxDepth && !comment.parent_id; // 親コメントのみ返信ボタン表示

  // 返信かどうか判定
  const isReply = depth > 0 || !!comment.parent_id;

  return (
    <div className={`${isReply ? 'ml-4 mt-2' : ''}`}>
      {isReply ? (
        // 返信の場合: 矢印 + カード
        <div className="flex gap-2">
          {/* 矢印インジケーター */}
          <div className="flex-shrink-0 pt-4 text-gray-400">
            <CornerDownRight className="w-4 h-4" />
          </div>
          
          {/* カードコンテンツ */}
          <Card className="flex-1 bg-gray-50/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {displayNickname?.charAt(0) || '名'}
                </div>
                <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">{displayNickname}</span>
                {/* 投稿者タグ */}
                {isAuthor && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded border border-blue-200">
                    主
                  </span>
                )}
                <span className="text-xs text-gray-500">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {comment.content}
              </p>

              {/* アクションボタン */}
              <div className="flex items-center gap-3">
                {/* いいねボタン */}
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    isLiked 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <ThumbsUp 
                    className={`w-4 h-4 ${isLiked ? 'fill-blue-600' : ''}`} 
                  />
                  <span>{likesCount > 0 ? likesCount : 'いいね'}</span>
                </button>

                {/* 返信ボタン */}
                {canReply && (
                  <button
                    onClick={handleReplyClick}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span>返信</span>
                  </button>
                )}
              </div>

              {/* 返信入力フォーム */}
              {showReplyInput && (
                <form onSubmit={handleReplySubmit} className="mt-3 space-y-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`${displayNickname}さんへの返信...`}
                    className="w-full min-h-[80px] p-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={500}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{replyContent.length}/500</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowReplyInput(false);
                          setReplyContent("");
                        }}
                        disabled={isSubmitting}
                      >
                        キャンセル
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!replyContent.trim() || isSubmitting}
                        className="gap-1"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            投稿中...
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            返信
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      ) : (
        // トップレベルコメント: 通常のカード
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {displayNickname?.charAt(0) || '名'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">{displayNickname}</span>
                  {/* 投稿者タグ */}
                  {isAuthor && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded border border-blue-200">
                      主
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  {comment.content}
                </p>

                {/* アクションボタン */}
                <div className="flex items-center gap-3">
                  {/* いいねボタン */}
                  <button
                    onClick={handleLikeClick}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      isLiked 
                        ? 'text-blue-600 font-medium' 
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <ThumbsUp 
                      className={`w-4 h-4 ${isLiked ? 'fill-blue-600' : ''}`} 
                    />
                    <span>{likesCount > 0 ? likesCount : 'いいね'}</span>
                  </button>

                  {/* 返信ボタン */}
                  {canReply && (
                    <button
                      onClick={handleReplyClick}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      <span>返信</span>
                    </button>
                  )}
                </div>

                {/* 返信入力フォーム */}
                {showReplyInput && (
                  <form onSubmit={handleReplySubmit} className="mt-3 space-y-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`${displayNickname}さんへの返信...`}
                      className="w-full min-h-[80px] p-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={500}
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">{replyContent.length}/500</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowReplyInput(false);
                            setReplyContent("");
                          }}
                          disabled={isSubmitting}
                        >
                          キャンセル
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!replyContent.trim() || isSubmitting}
                          className="gap-1"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              投稿中...
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              返信
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ネストされた返信 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postAuthorId={postAuthorId}
              postNickname={postNickname}
              userId={userId}
              isAuthenticated={isAuthenticated}
              onReply={onReply}
              onAuthRequired={onAuthRequired}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

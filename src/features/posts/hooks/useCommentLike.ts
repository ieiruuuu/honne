"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// 環境変数チェック
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * コメントのいいね管理Hook
 * 
 * @param commentId - コメントID
 * @param initialLikesCount - 初期いいね数
 * @param userId - ユーザーID (null = 未ログイン)
 */
export function useCommentLike(
  commentId: string,
  initialLikesCount: number = 0,
  userId?: string
) {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 現在のユーザーがいいねしているか確認
   */
  const checkIfLiked = useCallback(async () => {
    if (!isSupabaseConfigured || !userId || !commentId) {
      setIsLiked(false);
      return;
    }

    try {
      // count 方式で 406 エラー回避
      const { count, error } = await supabase
        .from("comment_likes")
        .select("*", { count: "exact", head: true })
        .eq("comment_id", commentId)
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error checking comment like:", error);
        console.error("   Error code:", error.code);
        console.error("   Error message:", error.message);
        return;
      }

      const liked = (count || 0) > 0;
      console.log("✅ Comment like status:", liked, "(count:", count, ")");
      setIsLiked(liked);
    } catch (err) {
      console.error("❌ Exception checking comment like:", err);
    }
  }, [commentId, userId]);

  /**
   * いいねトグル
   */
  const toggleLike = useCallback(async () => {
    if (!isSupabaseConfigured) {
      console.warn("⚠️ Supabase is not configured");
      return { success: false, error: "Supabase設定が必要です" };
    }

    if (!userId) {
      console.warn("⚠️ User not authenticated");
      return { success: false, error: "ログインが必要です" };
    }

    if (isLoading) {
      return { success: false, error: "処理中です" };
    }

    setIsLoading(true);

    // Optimistic UI Update
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      if (isLiked) {
        // いいね解除
        console.log("💔 Removing comment like:", commentId);
        
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", userId);

        if (error) {
          console.error("❌ Error removing comment like:", error);
          throw error;
        }

        console.log("✅ Comment like removed");
        return { success: true };
      } else {
        // いいね追加
        console.log("💖 Adding comment like:", commentId);
        
        const { error } = await supabase
          .from("comment_likes")
          .insert([
            {
              comment_id: commentId,
              user_id: userId,
            },
          ]);

        if (error) {
          console.error("❌ Error adding comment like:", error);
          throw error;
        }

        console.log("✅ Comment like added");
        return { success: true };
      }
    } catch (err) {
      console.error("❌ Exception toggling comment like:", err);
      
      // Rollback Optimistic Update
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      
      const errorMessage = err instanceof Error ? err.message : "いいねの処理に失敗しました";
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [commentId, userId, isLiked, likesCount, isLoading]);

  // 初期化: いいね状態チェック
  useEffect(() => {
    checkIfLiked();
  }, [checkIfLiked]);

  // likes_count の初期値更新
  useEffect(() => {
    setLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  return {
    likesCount,
    isLiked,
    isLoading,
    toggleLike,
  };
}

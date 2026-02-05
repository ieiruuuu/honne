"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// 環境変数チェック
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * いいね機能Hook
 * 
 * @param postId - 投稿ID
 * @param initialLikesCount - 初期いいね数
 * @param userId - 現在のユーザーID（ログイン済みの場合）
 */
export function useLike(postId: string, initialLikesCount: number = 0, userId?: string) {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 現在のユーザーがこの投稿にいいねしているか確認
   */
  const checkLikeStatus = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("❤️ Checking like status for post:", postId, "user:", userId);

      if (!isSupabaseConfigured) {
        // モック: LocalStorageで管理
        const likedPosts = JSON.parse(localStorage.getItem("liked_posts") || "[]");
        const liked = likedPosts.includes(postId);
        console.log("📦 Mock like status:", liked);
        setIsLiked(liked);
        setIsLoading(false);
        return;
      }

      // Supabase でチェック (count 方式で 406 エラー回避)
      const { count, error } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error checking like status:", error);
        console.error("   Error code:", error.code);
        console.error("   Error message:", error.message);
      }

      const liked = (count || 0) > 0;
      console.log("✅ Like status from Supabase:", liked, "(count:", count, ")");
      setIsLiked(liked);
    } catch (err) {
      console.error("❌ Error in checkLikeStatus:", err);
    } finally {
      setIsLoading(false);
    }
  }, [postId, userId]);

  useEffect(() => {
    checkLikeStatus();
  }, [checkLikeStatus]);

  /**
   * いいねをトグル（追加/削除）
   */
  const toggleLike = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      console.log("⚠️ User not logged in, like action blocked");
      return false;
    }

    try {
      // Optimistic Update
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
      
      console.log(`❤️ Toggling like: ${isLiked ? "Unlike" : "Like"}`);
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      if (!isSupabaseConfigured) {
        // モック: LocalStorage更新
        const likedPosts = JSON.parse(localStorage.getItem("liked_posts") || "[]");
        
        if (newIsLiked) {
          likedPosts.push(postId);
        } else {
          const index = likedPosts.indexOf(postId);
          if (index > -1) {
            likedPosts.splice(index, 1);
          }
        }
        
        localStorage.setItem("liked_posts", JSON.stringify(likedPosts));
        console.log("✅ Mock like toggled successfully");
        return true;
      }

      // Supabase でいいね追加/削除
      if (newIsLiked) {
        // いいね追加
        const { error: insertError } = await supabase
          .from("post_likes")
          .insert({
            post_id: postId,
            user_id: userId,
          });

        if (insertError) {
          console.error("❌ Error adding like:", insertError);
          // Rollback
          setIsLiked(isLiked);
          setLikesCount(likesCount);
          return false;
        }

        // 投稿のいいね数を増加
        const { error: updateError } = await supabase
          .from("posts")
          .update({ likes_count: newLikesCount })
          .eq("id", postId);

        if (updateError) {
          console.error("❌ Error updating likes count:", updateError);
        }

        console.log("✅ Like added successfully");
      } else {
        // いいね削除
        const { error: deleteError } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        if (deleteError) {
          console.error("❌ Error removing like:", deleteError);
          // Rollback
          setIsLiked(isLiked);
          setLikesCount(likesCount);
          return false;
        }

        // 投稿のいいね数を減少
        const { error: updateError } = await supabase
          .from("posts")
          .update({ likes_count: newLikesCount })
          .eq("id", postId);

        if (updateError) {
          console.error("❌ Error updating likes count:", updateError);
        }

        console.log("✅ Like removed successfully");
      }

      return true;
    } catch (err) {
      console.error("❌ Error toggling like:", err);
      // Rollback
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      return false;
    }
  }, [postId, userId, isLiked, likesCount]);

  return {
    likesCount,
    isLiked,
    isLoading,
    toggleLike,
    refetch: checkLikeStatus,
  };
}

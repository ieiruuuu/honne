import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// Supabase 設定確認
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * ユーザーの統計情報を取得するHook
 * 
 * @param userId - ユーザーID (Supabase auth.users.id)
 * @param nickname - ニックネーム（投稿フィルタリング用）
 * @returns stats - 統計情報 { postsCount, likesReceived, commentsReceived, likedPostsCount }
 * @returns isLoading - 読み込み中フラグ
 * @returns refetch - 手動再読み込み関数
 */
export function useUserStats(userId?: string, nickname?: string) {
  const [stats, setStats] = useState({
    postsCount: 0,
    likesReceived: 0,
    commentsReceived: 0,
    likedPostsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!userId && !nickname) {
      setStats({ postsCount: 0, likesReceived: 0, commentsReceived: 0, likedPostsCount: 0 });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        console.warn("⚠️ Supabase is not configured");
        setStats({ postsCount: 0, likesReceived: 0, commentsReceived: 0, likedPostsCount: 0 });
        setIsLoading(false);
        return;
      }

      console.log("📊 Fetching user stats...", { userId, nickname });

      // ✅ Promise.all で並列実行（パフォーマンス最適化）
      const [
        { count: postsCount },
        { data: userPosts },
        likedPostsResult,
      ] = await Promise.all([
        // 1. 投稿数を取得（user_id または nickname で検索）
        userId
          ? supabase
              .from("posts")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId)
          : supabase
              .from("posts")
              .select("*", { count: "exact", head: true })
              .eq("nickname", nickname || ""),
        
        // 2. 自分の投稿を取得（いいね数・コメント数集計用）
        userId
          ? supabase
              .from("posts")
              .select("id, likes_count")
              .eq("user_id", userId)
          : supabase
              .from("posts")
              .select("id, likes_count")
              .eq("nickname", nickname || ""),
        
        // 3. 自分がいいねした投稿数（user_id で検索）
        userId
          ? supabase
              .from("post_likes")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId)
          : Promise.resolve({ count: 0 }),
      ]);

      const postIds = userPosts?.map((p) => p.id) || [];

      // 4. 受け取ったいいね数（自分の投稿の likes_count 合計）
      const likesReceived = userPosts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;

      // 5. 受け取ったコメント数（自分の投稿へのコメント数）
      let commentsReceived = 0;
      if (postIds.length > 0) {
        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .in("post_id", postIds);
        commentsReceived = commentsCount || 0;
      }

      const likedPostsCount = likedPostsResult.count || 0;

      console.log("✅ User stats loaded:", {
        postsCount: postsCount || 0,
        likesReceived,
        commentsReceived,
        likedPostsCount,
      });

      setStats({
        postsCount: postsCount || 0,
        likesReceived,
        commentsReceived,
        likedPostsCount,
      });
    } catch (err) {
      console.error("❌ Error fetching user stats:", err);
      setStats({ postsCount: 0, likesReceived: 0, commentsReceived: 0, likedPostsCount: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [userId, nickname]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}

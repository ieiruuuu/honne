import { useState, useEffect } from "react";
import { Post } from "@/types";
import { supabase } from "@/lib/supabase";

// Supabase 設定確認
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * 自分がいいねした投稿を取得するHook
 * 
 * @param userId - ユーザーID
 * @returns likedPosts - いいねした投稿リスト
 * @returns isLoading - 読み込み中フラグ
 */
export function useLikedPosts(userId?: string) {
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLikedPosts = async () => {
      if (!isMounted) return;
      setIsLoading(true);

      try {
        if (!isSupabaseConfigured) {
          console.warn("⚠️ Supabase not configured. Skipping liked posts fetch.");
          if (isMounted) {
            setLikedPosts([]);
            setIsLoading(false);
          }
          return;
        }

        if (!userId) {
          // ログインしていない場合は空配列
          if (isMounted) {
            setLikedPosts([]);
            setIsLoading(false);
          }
          return;
        }

        console.log("💖 Fetching liked posts for user:", userId);

        // post_likes テーブルから自分がいいねした投稿のIDを取得
        const { data: likes, error: likesError } = await supabase
          .from("post_likes")
          .select("post_id, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (likesError) {
          console.error("❌ Error fetching likes:", likesError);
          throw likesError;
        }

        if (!likes || likes.length === 0) {
          console.log("✅ No liked posts found");
          if (isMounted) {
            setLikedPosts([]);
            setIsLoading(false);
          }
          return;
        }

        const postIds = likes.map((like) => like.post_id);

        // 投稿の詳細情報を取得
        const { data: posts, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .in("id", postIds);

        if (postsError) {
          console.error("❌ Error fetching posts:", postsError);
          throw postsError;
        }

        if (!isMounted) return;

        // いいね順にソート（最新のいいねが上）
        const sortedPosts = (posts || []).sort((a, b) => {
          const aLike = likes.find((like) => like.post_id === a.id);
          const bLike = likes.find((like) => like.post_id === b.id);
          
          if (!aLike || !bLike) return 0;
          
          return new Date(bLike.created_at).getTime() - new Date(aLike.created_at).getTime();
        });

        console.log("✅ Liked posts loaded:", sortedPosts.length);
        setLikedPosts(sortedPosts);
      } catch (err) {
        if (!isMounted) return;
        console.error("❌ Failed to fetch liked posts:", err);
        setLikedPosts([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLikedPosts();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return {
    likedPosts,
    isLoading,
  };
}

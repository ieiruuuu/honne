import { useState, useEffect } from "react";
import { Post } from "@/types";
import { supabase } from "@/lib/supabase";

interface MyPostsFilter {
  category?: string;
  sortBy: "latest" | "popular";
}

// Supabase 設定確認
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * 自分の投稿管理カスタムフック
 * 
 * 機能:
 * - カテゴリー別フィルタリング
 * - 並び替え（新しい順・人気順）
 * - リアルタイム更新
 * 
 * @param userId - ユーザーID (優先)
 * @param nickname - ユーザーのニックネーム (フォールバック)
 * @returns myPosts - 自分の投稿リスト
 * @returns isLoading - 読み込み中フラグ
 * @returns filter - 現在のフィルター
 * @returns setFilter - フィルター更新関数
 */
export function useMyPosts(userId?: string, nickname?: string) {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<MyPostsFilter>({
    sortBy: "latest",
  });

  /**
   * 投稿取得
   */
  useEffect(() => {
    let isMounted = true;

    const fetchMyPosts = async () => {
      if (!isMounted) return;
      setIsLoading(true);

      try {
        if (!isSupabaseConfigured) {
          console.warn("⚠️ Supabase not configured. Skipping my posts fetch.");
          if (isMounted) {
            setMyPosts([]);
            setIsLoading(false);
          }
          return;
        }

        if (!userId && !nickname) {
          // Guest モード: IDもニックネームもない場合は空配列を返す
          if (isMounted) {
            setMyPosts([]);
            setIsLoading(false);
          }
          return;
        }

        // Supabase から取得（user_id優先、なければnicknameで検索）
        let query = supabase
          .from("posts")
          .select("*");

        if (userId) {
          query = query.eq("user_id", userId);
        } else if (nickname) {
          query = query.eq("nickname", nickname);
        }

        // カテゴリーフィルター
        if (filter.category) {
          query = query.eq("category", filter.category);
        }

        // 並び替え
        if (filter.sortBy === "latest") {
          query = query.order("created_at", { ascending: false });
        } else if (filter.sortBy === "popular") {
          query = query.order("likes_count", { ascending: false });
        }

        const { data, error } = await query;

        if (!isMounted) return;

        if (error) throw error;

        console.log("✅ My posts loaded:", data?.length);
        setMyPosts(data || []);
      } catch (err) {
        if (!isMounted) return;
        console.error("❌ Failed to fetch my posts:", err);
        setMyPosts([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMyPosts();

    return () => {
      isMounted = false;
    };
  }, [userId, nickname, filter]);

  return {
    myPosts,
    isLoading,
    filter,
    setFilter,
  };
}

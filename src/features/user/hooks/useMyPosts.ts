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
 * @param nickname - ユーザーのニックネーム
 * @returns myPosts - 自分の投稿リスト
 * @returns isLoading - 読み込み中フラグ
 * @returns filter - 現在のフィルター
 * @returns setFilter - フィルター更新関数
 */
export function useMyPosts(nickname: string) {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<MyPostsFilter>({
    sortBy: "latest",
  });

  /**
   * 投稿取得
   */
  useEffect(() => {
    const fetchMyPosts = async () => {
      setIsLoading(true);

      try {
        if (!isSupabaseConfigured || !nickname) {
          console.warn("⚠️ Supabase not configured or no nickname provided");
          setMyPosts([]);
          setIsLoading(false);
          return;
        }

        // Supabase から取得
        let query = supabase
          .from("posts")
          .select("*")
          .eq("nickname", nickname);

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

        if (error) throw error;

        console.log("✅ My posts loaded:", data?.length);
        setMyPosts(data || []);
      } catch (err) {
        console.error("❌ Failed to fetch my posts:", err);
        setMyPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPosts();
  }, [nickname, filter]);

  return {
    myPosts,
    isLoading,
    filter,
    setFilter,
  };
}

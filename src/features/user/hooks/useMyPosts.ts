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
    const mockPosts: Post[] = [
      {
        id: "1",
        content: "上司との関係に悩んでいます。毎日のように小さなことで怒られて、精神的に辛いです。",
        category: "人間関係・上司",
        nickname: nickname || "匿名太郎",
        likes_count: 24,
        comments_count: 8,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "2",
        content: "今年の昇給、たったの3000円でした...物価上昇を考えると実質減給ですよね。",
        category: "年収・手取り",
        nickname: nickname || "匿名太郎",
        likes_count: 42,
        comments_count: 15,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "3",
        content: "残業が月80時間を超えました。転職を本気で考えています。",
        category: "サービス残業・待遇",
        nickname: nickname || "匿名太郎",
        likes_count: 67,
        comments_count: 23,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];

    const fetchMyPosts = async () => {
      setIsLoading(true);

      try {
        if (!isSupabaseConfigured || !nickname) {
          // モックデータを使用
          let filtered = [...mockPosts];

          // カテゴリーフィルター
          if (filter.category) {
            filtered = filtered.filter((post) => post.category === filter.category);
          }

          // 並び替え
          if (filter.sortBy === "latest") {
            filtered.sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          } else if (filter.sortBy === "popular") {
            filtered.sort((a, b) => b.likes_count - a.likes_count);
          }

          setMyPosts(filtered);
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

        setMyPosts(data || []);
      } catch (err) {
        console.error("Failed to fetch my posts:", err);
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

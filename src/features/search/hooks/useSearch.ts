import { useState, useCallback, useEffect } from "react";
import { Post, SearchResult } from "@/types";
import { supabase } from "@/lib/supabase";

/**
 * 検索機能を管理するカスタムフック
 * 
 * Supabase の ilike 演算子を使用してリアルタイム検索を実装
 * 
 * @returns searchQuery - 現在の検索クエリ
 * @returns results - 検索結果
 * @returns isSearching - 検索中フラグ
 * @returns error - エラーメッセージ
 * @returns handleSearch - 検索実行関数
 * @returns clearSearch - 検索クリア関数
 */
export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ posts: [], total: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase 設定チェック
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

  /**
   * 検索実行
   */
  const executeSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults({ posts: [], total: 0 });
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        // モックデータを使用
        const mockPosts: Post[] = [
          {
            id: "1",
            content: `3年目、システムエンジニア、年収450万円です。同じ経験年数の方、どれくらいもらってますか？`,
            category: "年収・手取り",
            nickname: "匿名太郎",
            likes_count: 42,
            comments_count: 15,
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: "2",
            content: "残業月80時間、休日出勤あり...これってブラック企業ですよね？",
            category: "ホワイト・ブラック判定",
            nickname: "サラリーマン",
            likes_count: 78,
            comments_count: 23,
            created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          },
          {
            id: "3",
            content: "夏のボーナス、業績好調で4.5ヶ月分出ました！",
            category: "ボーナス報告",
            nickname: "嬉しい社員",
            likes_count: 56,
            comments_count: 18,
            created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
          },
        ];

        // 簡単なフィルタリング
        const filtered = mockPosts.filter(
          (post) =>
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.category.toLowerCase().includes(query.toLowerCase())
        );

        setResults({ posts: filtered, total: filtered.length });
      } else {
        // Supabase で検索
        const { data, error: searchError, count } = await supabase
          .from("posts")
          .select("*", { count: "exact" })
          .or(`content.ilike.%${query}%,category.ilike.%${query}%`)
          .order("created_at", { ascending: false })
          .limit(50);

        if (searchError) throw searchError;

        setResults({
          posts: data || [],
          total: count || 0,
        });
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("検索中にエラーが発生しました");
      setResults({ posts: [], total: 0 });
    } finally {
      setIsSearching(false);
    }
  }, [isSupabaseConfigured]);

  /**
   * デバウンス付き検索
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        executeSearch(searchQuery);
      }
    }, 300); // 300ms デバウンス

    return () => clearTimeout(timer);
  }, [searchQuery, executeSearch]);

  /**
   * 検索クエリ更新
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * 検索クリア
   */
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setResults({ posts: [], total: 0 });
    setError(null);
  }, []);

  return {
    searchQuery,
    results,
    isSearching,
    error,
    handleSearch,
    clearSearch,
  };
}

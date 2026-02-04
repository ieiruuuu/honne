import { useState, useCallback, useEffect } from "react";
import { SearchResult } from "@/types";
import { supabase } from "@/lib/supabase";

// Supabase 設定チェック
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

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
        console.warn("⚠️ Supabase is not configured");
        setResults({ posts: [], total: 0 });
        setIsSearching(false);
        return;
      }

      // Supabase で検索
      const { data, error: searchError, count } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .or(`content.ilike.%${query}%,category.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (searchError) throw searchError;

      console.log(`🔍 Search results for "${query}":`, data?.length);
      setResults({
        posts: data || [],
        total: count || 0,
      });
    } catch (err) {
      console.error("❌ Search error:", err);
      setError("検索中にエラーが発生しました");
      setResults({ posts: [], total: 0 });
    } finally {
      setIsSearching(false);
    }
  }, []);

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

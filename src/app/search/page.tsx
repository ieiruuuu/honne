"use client";

import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { SearchBar } from "@/features/search/components/SearchBar";
import { SearchResults } from "@/features/search/components/SearchResults";
import { PopularKeywords } from "@/features/search/components/PopularKeywords";
import { useSearch } from "@/features/search/hooks/useSearch";
import { SEARCH_LABELS } from "@/features/search/constants";

/**
 * 検索ページ
 * 
 * 機能:
 * - キーワード検索（本文・カテゴリー）
 * - 人気キーワード表示
 * - リアルタイム検索結果（デバウンス付き）
 * - Supabase ilike 演算子による部分一致検索
 */
export default function SearchPage() {
  const { searchQuery, results, isSearching, handleSearch, clearSearch } =
    useSearch();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {SEARCH_LABELS.TITLE}
          </h1>

          {/* 検索バー */}
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            onClear={clearSearch}
          />
        </div>

        {/* 人気キーワード（検索前） */}
        {!searchQuery && (
          <div className="mb-6">
            <PopularKeywords onKeywordClick={handleSearch} />
          </div>
        )}

        {/* 検索結果 */}
        <SearchResults
          results={results}
          isSearching={isSearching}
          query={searchQuery}
        />
      </main>

      <BottomNav />
    </div>
  );
}

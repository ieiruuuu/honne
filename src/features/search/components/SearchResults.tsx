"use client";

import { PostCard } from "@/features/posts/PostCard";
import { SearchResult } from "@/types";
import { SEARCH_LABELS } from "../constants";
import { Loader2 } from "lucide-react";

interface SearchResultsProps {
  results: SearchResult;
  isSearching: boolean;
  query: string;
}

/**
 * 検索結果表示コンポーネント
 * 
 * @param results - 検索結果
 * @param isSearching - 検索中フラグ
 * @param query - 検索クエリ
 */
export function SearchResults({
  results,
  isSearching,
  query,
}: SearchResultsProps) {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
        <p className="text-sm text-gray-500">{SEARCH_LABELS.SEARCHING}</p>
      </div>
    );
  }

  if (!query) {
    return null;
  }

  if (results.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-gray-500">{SEARCH_LABELS.NO_RESULTS}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {results.total}
        {SEARCH_LABELS.RESULTS}
      </div>
      <div className="space-y-3">
        {results.posts.map((post) => (
          <PostCard key={post.id} post={post} commentCount={post.comments_count || 0} />
        ))}
      </div>
    </div>
  );
}

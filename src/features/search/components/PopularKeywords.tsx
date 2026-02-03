"use client";

import { Badge } from "@/components/ui/badge";
import { SEARCH_LABELS, POPULAR_KEYWORDS } from "../constants";

interface PopularKeywordsProps {
  onKeywordClick: (keyword: string) => void;
}

/**
 * 人気キーワード表示コンポーネント
 * 
 * @param onKeywordClick - キーワードクリックハンドラ
 */
export function PopularKeywords({ onKeywordClick }: PopularKeywordsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">
        {SEARCH_LABELS.POPULAR_KEYWORDS}
      </h3>
      <div className="flex flex-wrap gap-2">
        {POPULAR_KEYWORDS.map((keyword) => (
          <Badge
            key={keyword}
            variant="outline"
            className="cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onKeywordClick(keyword)}
          >
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
}

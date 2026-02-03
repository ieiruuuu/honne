"use client";

import { Search, X } from "lucide-react";
import { SEARCH_LABELS } from "../constants";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

/**
 * 検索バーコンポーネント
 * 
 * @param value - 現在の検索値
 * @param onChange - 値変更ハンドラ
 * @param onClear - クリアハンドラ
 * @param placeholder - プレースホルダー
 */
export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = SEARCH_LABELS.PLACEHOLDER,
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}

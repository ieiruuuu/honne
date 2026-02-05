"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreatePost } from "./hooks/useCreatePost";
import { LABELS, PLACEHOLDERS, CATEGORIES } from "@/lib/constants/ja";
import { Send, Info } from "lucide-react";
import type { Category } from "@/types";

export function PostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const { createPost, isCreating, error } = useCreatePost();

  /**
   * カテゴリー別動的プレースホルダー
   * 比較・共感を促進するための戦略的ヒント表示
   */
  const dynamicPlaceholder = useMemo(() => {
    if (category === CATEGORIES.SALARY) {
      return PLACEHOLDERS.SALARY_HINT;
    }
    if (category === CATEGORIES.BONUS) {
      return PLACEHOLDERS.BONUS_HINT;
    }
    if (category === CATEGORIES.WHITE_BLACK) {
      return PLACEHOLDERS.WHITE_BLACK_HINT;
    }
    return PLACEHOLDERS.POST_CONTENT;
  }, [category]);

  /**
   * カテゴリー選択でヒントを表示するか
   */
  const showHint = useMemo(() => {
    return (
      category === CATEGORIES.SALARY ||
      category === CATEGORIES.BONUS ||
      category === CATEGORIES.WHITE_BLACK
    );
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !nickname.trim() || !category) {
      return;
    }

    const result = await createPost({
      title: title.trim(),
      content: content.trim(),
      nickname: nickname.trim(),
      category: category as Category,
    });

    if (result) {
      // 成功したらフォームをリセット
      setTitle("");
      setContent("");
      setNickname("");
      setCategory("");
    }
  };

  return (
    <Card className="border-gray-200 shadow-none">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* カテゴリー選択（上部に移動） */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              {LABELS.CATEGORY_LABEL}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | "")}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent bg-white"
              disabled={isCreating}
            >
              <option value="">{LABELS.SELECT_CATEGORY}</option>
              <option value={CATEGORIES.SALARY}>💰 {CATEGORIES.SALARY}</option>
              <option value={CATEGORIES.WHITE_BLACK}>⚖️ {CATEGORIES.WHITE_BLACK}</option>
              <option value={CATEGORIES.BONUS}>🎁 {CATEGORIES.BONUS}</option>
              <option value={CATEGORIES.CAREER}>💼 {CATEGORIES.CAREER}</option>
              <option value={CATEGORIES.RELATIONSHIPS}>👥 {CATEGORIES.RELATIONSHIPS}</option>
              <option value={CATEGORIES.POLITICS}>🛡️ {CATEGORIES.POLITICS}</option>
              <option value={CATEGORIES.OVERTIME}>⏰ {CATEGORIES.OVERTIME}</option>
              <option value={CATEGORIES.BENEFITS}>❤️ {CATEGORIES.BENEFITS}</option>
              <option value={CATEGORIES.MENTAL}>🧠 {CATEGORIES.MENTAL}</option>
              <option value={CATEGORIES.VENTING}>💬 {CATEGORIES.VENTING}</option>
            </select>
          </div>

          {/* バイラルヒント表示 */}
          {showHint && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed">
                {dynamicPlaceholder}
              </p>
            </div>
          )}

          {/* タイトル */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトルを入力してください（2文字以上）"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              disabled={isCreating}
              maxLength={100}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400">
                {title.length}/100
              </span>
            </div>
          </div>

          {/* 投稿内容 */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={dynamicPlaceholder}
              className="w-full min-h-[120px] p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              disabled={isCreating}
              maxLength={500}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400">
                {content.length}/500
              </span>
            </div>
          </div>

          {/* ニックネーム */}
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={PLACEHOLDERS.POST_NICKNAME}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              disabled={isCreating}
              maxLength={20}
            />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* 投稿ボタン */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isCreating || !title.trim() || !content.trim() || !nickname.trim() || !category
              }
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {isCreating ? LABELS.POSTING : LABELS.POST}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

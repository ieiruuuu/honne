"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreatePost } from "@/features/feed/hooks/useCreatePost";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { LABELS, PLACEHOLDERS, CATEGORIES, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants/ja";
import { POST_DETAIL_LABELS } from "@/features/posts/constants";
import { Send, X, Save, Info, Lock, Loader2 } from "lucide-react";
import type { Category } from "@/types";

const DRAFT_KEY = "post_draft";

export default function WritePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [hasChanges, setHasChanges] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { createPost, isCreating, error, validationErrors } = useCreatePost();

  // ログイン確認
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [authLoading, isAuthenticated]);

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

  // 下書き読み込み
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (confirm("保存された下書きがあります。読み込みますか？")) {
          setContent(parsed.content || "");
          setNickname(parsed.nickname || "");
          setCategory(parsed.category || "");
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  // 変更検知
  useEffect(() => {
    setHasChanges(
      content.trim().length > 0 || 
      nickname.trim().length > 0 || 
      category.length > 0
    );
  }, [content, nickname, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !nickname.trim() || !category) {
      return;
    }

    const result = await createPost({
      content: content.trim(),
      nickname: nickname.trim(),
      category: category as Category,
    });

    if (result) {
      // 下書き削除
      localStorage.removeItem(DRAFT_KEY);
      // 홈으로 이동
      alert(SUCCESS_MESSAGES.POST_CREATED);
      router.push("/");
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      content,
      nickname,
      category,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    alert("下書きを保存しました");
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm(ERROR_MESSAGES.UNSAVED_CHANGES)) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  // ローディング中
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-sm text-gray-600">読み込み中...</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // 未ログイン
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <Card className="mt-10">
            <CardContent className="pt-12 pb-12 text-center">
              <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {POST_DETAIL_LABELS.LOGIN_REQUIRED_TITLE}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {POST_DETAIL_LABELS.LOGIN_REQUIRED_POST}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowAuthModal(true)} className="gap-2">
                  <Lock className="w-4 h-4" />
                  {POST_DETAIL_LABELS.LOGIN_TO_POST}
                </Button>
                <Button variant="outline" onClick={() => router.push("/")}>
                  ホームに戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => {
            setShowAuthModal(false);
            router.push("/");
          }} 
        />
      </div>
    );
  }

  // ログイン済み - 通常の投稿フォーム
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {LABELS.POST}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* カテゴリー選択（上部に移動 - UX改善） */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {LABELS.CATEGORY_LABEL} <span className="text-red-500">*</span>
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
            <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 leading-relaxed">
                {dynamicPlaceholder}
              </p>
            </div>
          )}

          {/* 内容 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {LABELS.CONTENT_LABEL} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={dynamicPlaceholder}
              className="w-full min-h-[200px] p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              disabled={isCreating}
              maxLength={500}
            />
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-400">
                {content.length}/500
              </span>
            </div>
          </div>

          {/* ニックネーム */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {LABELS.NICKNAME_LABEL} <span className="text-red-500">*</span>
            </label>
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
              {validationErrors && validationErrors.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx} className="text-xs text-red-500">
                      • {err.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ボタン */}
          <div className="space-y-3">
            {/* 下書き保存 */}
            {hasChanges && (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleSaveDraft}
                disabled={isCreating}
              >
                <Save className="w-4 h-4" />
                {LABELS.TEMPORARY_SAVE}
              </Button>
            )}

            {/* 投稿・キャンセル */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={isCreating}
              >
                {LABELS.CANCEL}
              </Button>
              <Button
                type="submit"
                disabled={
                  isCreating || !content.trim() || !nickname.trim() || !category
                }
                className="flex-1 gap-2"
              >
                <Send className="w-4 h-4" />
                {isCreating ? LABELS.POSTING : LABELS.POST}
              </Button>
            </div>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}

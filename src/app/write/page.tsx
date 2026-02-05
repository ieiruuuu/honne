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
import { Send, X, Save, Info, Lock, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import type { Category } from "@/types";
import { uploadPostImage, validateImageFile, getImagePreviewUrl } from "@/lib/imageUpload";

const DRAFT_KEY = "post_draft";

export default function WritePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [hasChanges, setHasChanges] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCheckTimeout, setAuthCheckTimeout] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const { createPost, isCreating, error, validationErrors } = useCreatePost();

  // Hydration 에러 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  // ログイン確認（タイムアウト付き）
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // 3秒後にタイムアウト (ネットワーク遅延を考慮)
    timeoutId = setTimeout(() => {
      if (authLoading) {
        console.warn("⚠️ Auth loading timeout (3s). Assuming guest mode.");
        setAuthCheckTimeout(true);
      }
    }, 3000);

    if (!authLoading) {
      clearTimeout(timeoutId);
      if (!isAuthenticated) {
        setShowAuthModal(true);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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
          setTitle(parsed.title || "");
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
      title.trim().length > 0 ||
      content.trim().length > 0 || 
      nickname.trim().length > 0 || 
      category.length > 0 ||
      selectedImage !== null
    );
  }, [title, content, nickname, category, selectedImage]);

  /**
   * 画像選択ハンドラー
   */
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("🖼️ Image selected:", file.name);
    
    // バリデーション
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || "画像の選択に失敗しました");
      return;
    }

    setImageError(null);
    setSelectedImage(file);

    // プレビュー生成
    try {
      const previewUrl = await getImagePreviewUrl(file);
      setImagePreview(previewUrl);
      console.log("✅ Image preview generated");
    } catch (err) {
      console.error("❌ Failed to generate preview:", err);
      setImageError("プレビューの生成に失敗しました");
    }
  };

  /**
   * 画像削除ハンドラー
   */
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageUrl(null);
    setImageError(null);
    
    // input要素のリセット
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📝 Submit button clicked");
    console.log("Form data:", {
      title: title.trim(),
      content: content.trim().substring(0, 50) + "...",
      nickname: nickname.trim(),
      category: category,
      hasImage: !!selectedImage,
    });

    if (!title.trim() || !content.trim() || !nickname.trim() || !category) {
      console.warn("⚠️ Validation failed: missing required fields");
      return;
    }

    // タイトルの長さチェック
    if (title.trim().length < 2) {
      alert("タイトルは2文字以上入力してください");
      return;
    }

    // 画像アップロード (選択されている場合)
    let uploadedImageUrl: string | undefined = undefined;
    
    if (selectedImage) {
      setIsUploadingImage(true);
      setImageError(null);
      
      console.log("📤 Uploading image...");
      
      // ✅ 実際のユーザーIDを使用
      if (!user?.id) {
        console.error("❌ User ID not found for image upload");
        setImageError("ユーザー情報が見つかりません");
        setIsUploadingImage(false);
        return;
      }
      
      const uploadResult = await uploadPostImage(selectedImage, user.id);
      
      setIsUploadingImage(false);
      
      if (!uploadResult.success) {
        console.error("❌ Image upload failed:", uploadResult.error);
        setImageError(uploadResult.error || "画像のアップロードに失敗しました");
        return;
      }
      
      uploadedImageUrl = uploadResult.url;
      console.log("✅ Image uploaded:", uploadedImageUrl);
    }

    console.log("✅ Validation passed, calling createPost...");

    const result = await createPost({
      title: title.trim(),
      content: content.trim(),
      nickname: nickname.trim(),
      category: category as Category,
      image_url: uploadedImageUrl,
    });

    console.log("📊 createPost result:", result);

    if (result) {
      // 下書き削除
      localStorage.removeItem(DRAFT_KEY);
      
      console.log("✅ Post created successfully:", result);
      console.log("🔄 Navigating to home page...");
      
      // 홈으로 이동
      alert(SUCCESS_MESSAGES.POST_CREATED);
      router.push("/");
      
      // 강제 새로고침 (실시간 업데이트가 안 될 경우를 대비)
      router.refresh();
    } else {
      console.error("❌ Post creation failed - result is null");
      console.error("Check error state:", error);
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      title,
      content,
      nickname,
      category,
      imagePreview,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    alert("下書きを保存しました（画像はプレビューのみ保存されます）");
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

  // Hydration 完了 & ローディング中
  if (!mounted || (authLoading && !authCheckTimeout)) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // タイムアウト後は未ログインとして処理
  const isUserAuthenticated = authCheckTimeout ? false : isAuthenticated;

  // 未ログイン
  if (!isUserAuthenticated) {
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

          {/* タイトル */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトルを入力してください（2文字以上）"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              disabled={isCreating}
              maxLength={100}
            />
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-400">
                {title.length}/100
              </span>
            </div>
          </div>

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

          {/* 画像アップロード */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像を添付 (任意)
            </label>
            
            {!imagePreview ? (
              <div>
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">画像を選択</span>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isCreating || isUploadingImage}
                />
                <p className="text-xs text-gray-500 mt-2">
                  JPG、PNG、WEBP形式、最大5MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={isCreating || isUploadingImage}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">アップロード中...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {imageError && (
              <p className="text-xs text-red-500 mt-2">{imageError}</p>
            )}
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
          {(error || (validationErrors && validationErrors.length > 0)) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
              )}
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
                  isCreating || isUploadingImage || !title.trim() || !content.trim() || !nickname.trim() || !category
                }
                className="flex-1 gap-2"
              >
                {isCreating || isUploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isUploadingImage ? "アップロード中..." : LABELS.POSTING}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {LABELS.POST}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}

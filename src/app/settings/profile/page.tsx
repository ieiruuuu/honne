"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useProfile } from "@/features/user/hooks/useProfile";
import { uploadAvatar, getAvatarPreviewUrl, validateAvatarFile } from "@/lib/avatarUpload";
import { generateRandomNickname, validateNickname, sanitizeNickname, DEFAULT_NICKNAME } from "@/lib/nicknameGenerator";
import { LABELS, SUCCESS_MESSAGES } from "@/lib/constants/ja";
import { ArrowLeft, Camera, Loader2, X, User, RotateCw } from "lucide-react";

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile(user?.id);
  
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // プロフィールデータの初期化
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || user?.nickname || DEFAULT_NICKNAME);
      setImagePreview(profile.avatar_url || null);
    } else if (user) {
      setNickname(user.nickname || DEFAULT_NICKNAME);
    }
  }, [profile, user]);

  /**
   * 画像選択ハンドラー
   */
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("🖼️ Image selected:", file.name);
    
    // バリデーション
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setImageError(validation.error || "画像の選択に失敗しました");
      return;
    }

    setImageError(null);
    setSelectedImage(file);

    // プレビュー生成
    try {
      const previewUrl = await getAvatarPreviewUrl(file);
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
    setImagePreview(profile?.avatar_url || null);
    setImageError(null);
    
    // input要素のリセット
    const fileInput = document.getElementById("avatar-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  /**
   * ランダムニックネーム生成
   */
  const handleGenerateNickname = () => {
    const newNickname = generateRandomNickname();
    setNickname(newNickname);
    setNicknameError(null);
    console.log("🎲 Generated random nickname:", newNickname);
  };

  /**
   * ニックネーム変更ハンドラー
   */
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    
    // リアルタイムバリデーション
    if (value.trim().length > 0) {
      const validation = validateNickname(value);
      setNicknameError(validation.valid ? null : validation.error || null);
    } else {
      setNicknameError(null);
    }
  };

  /**
   * 保存ハンドラー
   */
  const handleSave = async () => {
    if (!user?.id) {
      alert("ログインが必要です");
      return;
    }

    // ニックネームバリデーション
    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.valid) {
      setNicknameError(nicknameValidation.error || "無効なニックネームです");
      return;
    }

    setIsSaving(true);
    setImageError(null);
    setNicknameError(null);

    try {
      let avatarUrl = profile?.avatar_url;

      // 画像がアップロードされている場合
      if (selectedImage) {
        setIsUploading(true);
        console.log("📤 Uploading avatar...");
        
        const uploadResult = await uploadAvatar(selectedImage, user.id);
        
        setIsUploading(false);
        
        if (!uploadResult.success) {
          console.error("❌ Avatar upload failed:", uploadResult.error);
          setImageError(uploadResult.error || "画像のアップロードに失敗しました");
          setIsSaving(false);
          return;
        }
        
        avatarUrl = uploadResult.url;
        console.log("✅ Avatar uploaded:", avatarUrl);
      }

      // プロフィール更新
      console.log("📝 Updating profile...");
      const result = await updateProfile({
        nickname: sanitizeNickname(nickname),
        avatar_url: avatarUrl,
      });

      if (!result.success) {
        console.error("❌ Profile update failed:", result.error);
        alert(`プロフィールの更新に失敗しました: ${result.error}`);
        setIsSaving(false);
        return;
      }

      console.log("✅ Profile updated successfully");
      alert("プロフィールを更新しました");
      
      // ページをリロードしてキャッシュをクリア
      router.push("/mypage");
      router.refresh();
    } catch (err) {
      console.error("❌ Save exception:", err);
      alert("プロフィールの更新中にエラーが発生しました");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  // ローディング状態
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
        <BottomNav />
      </div>
    );
  }

  // 未ログイン
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-500 mb-4">ログインが必要です</p>
          <Button onClick={() => router.push("/mypage")}>戻る</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            プロフィール編集
          </h1>
        </div>

        <div className="space-y-4">
          {/* アバター */}
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                  
                  {/* 削除ボタン */}
                  {imagePreview && selectedImage && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      disabled={isUploading || isSaving}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* カメラボタン */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 cursor-pointer transition-colors shadow-lg"
                  >
                    <Camera className="w-5 h-5" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isUploading || isSaving}
                  />
                  
                  {/* アップロード中 */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  JPG、PNG、WEBP形式、最大2MB
                </p>
                
                {imageError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600">{imageError}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ニックネーム編集 */}
          <Card>
            <CardContent className="pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ニックネーム <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={handleNicknameChange}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={10}
                  disabled={isUploading || isSaving}
                  placeholder="ニックネームを入力..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateNickname}
                  disabled={isUploading || isSaving}
                  title="ランダム生成"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {nickname.length}/10
                </p>
                {nicknameError && (
                  <p className="text-xs text-red-500">{nicknameError}</p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                ※ 投稿時に異なるニックネームを使用できます
              </p>
            </CardContent>
          </Card>

          {/* 保存ボタン */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isUploading || isSaving}
            >
              {LABELS.CANCEL}
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={isUploading || isSaving}
            >
              {isUploading || isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isUploading ? "アップロード中..." : "保存中..."}
                </>
              ) : (
                LABELS.SAVE
              )}
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

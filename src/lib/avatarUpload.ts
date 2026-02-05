"use client";

import { supabase } from "@/lib/supabase";

/**
 * 画像ファイルのバリデーション
 */
export interface AvatarValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 許可する画像フォーマット
 */
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * 最大ファイルサイズ (2MB)
 */
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

/**
 * アバター画像のバリデーション
 */
export function validateAvatarFile(file: File): AvatarValidationResult {
  // ファイルタイプチェック
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "JPG、PNG、WEBP形式の画像のみアップロードできます",
    };
  }

  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "画像サイズは2MB以下にしてください",
    };
  }

  return { valid: true };
}

/**
 * アバター画像をSupabase Storageにアップロード
 * 
 * @param file - アップロードする画像ファイル
 * @param userId - ユーザーID
 * @returns アップロードされた画像のpublic URL
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("📤 Uploading avatar:", file.name, "size:", file.size, "type:", file.type);

    // バリデーション
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      console.error("❌ Avatar validation failed:", validation.error);
      return { success: false, error: validation.error };
    }

    // ファイル名生成
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    console.log("📝 Generated file name:", fileName);

    // 既存のアバターを削除 (同じファイル名で上書き)
    const { data: existingFiles } = await supabase.storage
      .from("avatars")
      .list(userId);

    if (existingFiles && existingFiles.length > 0) {
      console.log("🗑️ Deleting existing avatars...");
      const filesToDelete = existingFiles.map((file) => `${userId}/${file.name}`);
      await supabase.storage.from("avatars").remove(filesToDelete);
    }

    // Supabase Storage にアップロード
    const { data, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true, // 上書き
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return {
        success: false,
        error: `画像のアップロードに失敗しました: ${uploadError.message}`,
      };
    }

    console.log("✅ Avatar uploaded successfully:", data.path);

    // Public URL を取得
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error("❌ Failed to get public URL");
      return {
        success: false,
        error: "画像URLの取得に失敗しました",
      };
    }

    console.log("✅ Public URL:", publicUrlData.publicUrl);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err) {
    console.error("❌ Exception during avatar upload:", err);
    const errorMessage = err instanceof Error ? err.message : "画像のアップロードに失敗しました";
    return { success: false, error: errorMessage };
  }
}

/**
 * アバター画像を削除
 * 
 * @param userId - ユーザーID
 */
export async function deleteAvatar(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🗑️ Deleting avatar for user:", userId);

    // ユーザーのフォルダ内のすべてのファイルを削除
    const { data: files } = await supabase.storage
      .from("avatars")
      .list(userId);

    if (!files || files.length === 0) {
      console.log("✅ No avatar to delete");
      return { success: true };
    }

    const filesToDelete = files.map((file) => `${userId}/${file.name}`);
    
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove(filesToDelete);

    if (deleteError) {
      console.error("❌ Delete error:", deleteError);
      return {
        success: false,
        error: `画像の削除に失敗しました: ${deleteError.message}`,
      };
    }

    console.log("✅ Avatar deleted successfully");
    return { success: true };
  } catch (err) {
    console.error("❌ Exception during avatar deletion:", err);
    const errorMessage = err instanceof Error ? err.message : "画像の削除に失敗しました";
    return { success: false, error: errorMessage };
  }
}

/**
 * 画像ファイルをプレビュー用のData URLに変換
 * 
 * @param file - プレビューする画像ファイル
 * @returns Data URL
 */
export function getAvatarPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
}

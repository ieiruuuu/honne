"use client";

import { supabase } from "@/lib/supabase";

/**
 * 画像ファイルのバリデーション
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 許可する画像フォーマット
 */
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * 最大ファイルサイズ (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * 画像ファイルのバリデーション
 */
export function validateImageFile(file: File): ImageValidationResult {
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
      error: "画像サイズは5MB以下にしてください",
    };
  }

  return { valid: true };
}

/**
 * 画像ファイルをSupabase Storageにアップロード
 * 
 * @param file - アップロードする画像ファイル
 * @param userId - ユーザーID (フォルダ名として使用)
 * @returns アップロードされた画像のpublic URL
 */
export async function uploadPostImage(
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log("📤 Uploading image:", file.name, "size:", file.size, "type:", file.type);

    // バリデーション
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.error("❌ Image validation failed:", validation.error);
      return { success: false, error: validation.error };
    }

    // ファイル名生成 (重複を避けるためタイムスタンプ + ランダム文字列)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${timestamp}-${randomString}.${fileExt}`;

    console.log("📝 Generated file name:", fileName);

    // Supabase Storage にアップロード
    const { data, error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return {
        success: false,
        error: `画像のアップロードに失敗しました: ${uploadError.message}`,
      };
    }

    console.log("✅ Image uploaded successfully:", data.path);

    // Public URL を取得
    const { data: publicUrlData } = supabase.storage
      .from("post-images")
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
    console.error("❌ Exception during image upload:", err);
    const errorMessage = err instanceof Error ? err.message : "画像のアップロードに失敗しました";
    return { success: false, error: errorMessage };
  }
}

/**
 * 画像URLからファイルパスを抽出して削除
 * 
 * @param imageUrl - 削除する画像のURL
 */
export async function deletePostImage(
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🗑️ Deleting image:", imageUrl);

    // URL からファイルパスを抽出
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/post-images\/(.+)/);
    
    if (!pathMatch || !pathMatch[1]) {
      console.error("❌ Invalid image URL format");
      return { success: false, error: "無効な画像URLです" };
    }

    const filePath = pathMatch[1];
    console.log("📝 Extracted file path:", filePath);

    // Supabase Storage から削除
    const { error: deleteError } = await supabase.storage
      .from("post-images")
      .remove([filePath]);

    if (deleteError) {
      console.error("❌ Delete error:", deleteError);
      return {
        success: false,
        error: `画像の削除に失敗しました: ${deleteError.message}`,
      };
    }

    console.log("✅ Image deleted successfully");
    return { success: true };
  } catch (err) {
    console.error("❌ Exception during image deletion:", err);
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
export function getImagePreviewUrl(file: File): Promise<string> {
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

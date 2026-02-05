import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Post, Category } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import {
  FEED_LABELS,
  FEED_ERROR_MESSAGES,
} from "../constants";

interface CreatePostData {
  content: string;
  category: Category;
  nickname: string;
  image_url?: string; // 画像URL (オプション)
}

interface ValidationError {
  field: "content" | "nickname" | "category";
  message: string;
}

// Supabase 設定確認
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * 投稿作成カスタムフック（高度化版）
 * 
 * 機能:
 * - 入力値バリデーション
 * - カテゴリー必須化
 * - 文字数制限チェック
 * - エラーハンドリング
 * 
 * @returns createPost - 投稿作成関数
 * @returns isCreating - 作成中フラグ
 * @returns error - エラーメッセージ
 * @returns validationErrors - バリデーションエラーリスト
 */
export function useCreatePost() {
  const { user } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  /**
   * 入力値バリデーション
   */
  const validateInput = (data: CreatePostData): ValidationError[] => {
    const errors: ValidationError[] = [];

    // 内容チェック
    if (data.content.trim().length < FEED_LABELS.CONTENT_MIN_LENGTH) {
      errors.push({
        field: "content",
        message: FEED_ERROR_MESSAGES.CONTENT_TOO_SHORT,
      });
    }
    if (data.content.trim().length > FEED_LABELS.CONTENT_MAX_LENGTH) {
      errors.push({
        field: "content",
        message: FEED_ERROR_MESSAGES.CONTENT_TOO_LONG,
      });
    }

    // ニックネームチェック
    if (data.nickname.trim().length < FEED_LABELS.NICKNAME_MIN_LENGTH) {
      errors.push({
        field: "nickname",
        message: FEED_ERROR_MESSAGES.NICKNAME_TOO_SHORT,
      });
    }
    if (data.nickname.trim().length > FEED_LABELS.NICKNAME_MAX_LENGTH) {
      errors.push({
        field: "nickname",
        message: FEED_ERROR_MESSAGES.NICKNAME_TOO_LONG,
      });
    }

    // カテゴリーチェック（必須）
    if (!data.category || data.category.trim().length === 0) {
      errors.push({
        field: "category",
        message: FEED_ERROR_MESSAGES.CATEGORY_REQUIRED,
      });
    }

    return errors;
  };

  /**
   * 投稿作成
   */
  const createPost = async (data: CreatePostData): Promise<Post | null> => {
    // バリデーション
    const errors = validateInput(data);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setError(errors[0].message);
      return null;
    }

    setIsCreating(true);
    setError(null);
    setValidationErrors([]);

    try {
      // ✅ 로그인 체크
      if (!user?.id) {
        const authError = "ログインが必要です。再度ログインしてください。";
        console.error("❌ User not authenticated. user:", user);
        setError(authError);
        return null;
      }

      // Supabase 설정 확인
      if (!isSupabaseConfigured) {
        const configError = "Supabase設定が完了していません。.env.localファイルを確認してください。";
        console.error("❌", configError);
        console.error("📝 詳細: URGENT_FIX_ENV.md ファイルを参照してください");
        setError(configError);
        return null;
      }

      console.log("📝 Creating post with payload:", {
        content: data.content.trim().substring(0, 50) + "...",
        category: data.category,
        nickname: data.nickname.trim(),
        user_id: user.id,
        likes_count: 0,
        image_url: data.image_url || null,
      });

      // ✅ user_id と image_url 追加
      const insertPayload: any = {
        content: data.content.trim(),
        category: data.category,
        nickname: data.nickname.trim(),
        user_id: user.id,  // ✅ 現在ログイン中のユーザーID
        likes_count: 0,
      };

      // 画像URLがあれば追加
      if (data.image_url) {
        insertPayload.image_url = data.image_url;
      }

      const { data: newPost, error: insertError } = await supabase
        .from("posts")
        .insert([insertPayload])
        .select()
        .single();

      if (insertError) {
        console.error("❌ Supabase insert error:", insertError);
        console.error("Error details:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        });
        throw insertError;
      }

      console.log("✅ Post created successfully in database:", newPost);
      return newPost;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : FEED_ERROR_MESSAGES.POST_FAILED;
      setError(errorMessage);
      console.error("❌ Error creating post:", err);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createPost,
    isCreating,
    error,
    validationErrors,
  };
}

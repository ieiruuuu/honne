"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types";

// 環境変数チェック
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * 単一投稿データ取得Hook
 * 
 * @param postId - 投稿ID
 * @returns post - 投稿データ
 * @returns isLoading - 読み込み中フラグ
 * @returns error - エラーメッセージ ("NOT_FOUND" または一般エラー)
 */
export function usePost(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    try {
      console.log("🔍 Fetching post with ID:", postId);
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.warn("⚠️ Supabase is not configured");
        setError("NOT_FOUND");
        setIsLoading(false);
        return;
      }

      console.log("🗄️ Fetching from Supabase...");
      // Supabase から取得
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (fetchError) {
        console.error("❌ Supabase error:", fetchError);
        if (fetchError.code === "PGRST116") {
          // 投稿が見つからない
          setError("NOT_FOUND");
        } else {
          throw fetchError;
        }
        setIsLoading(false);
        return;
      }

      console.log("✅ Post loaded from Supabase:", data);
      setPost(data as Post);
    } catch (err) {
      console.error("❌ Error fetching post:", err);
      setError(err instanceof Error ? err.message : "投稿の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { post, isLoading, error };
}

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
 * @returns error - エラーメッセージ ("NOT_FOUND", "SUPABASE_NOT_CONFIGURED", または一般エラー)
 */
export function usePost(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async (signal?: AbortSignal) => {
    try {
      console.log("🔍 Fetching post with ID:", postId);
      setIsLoading(true);
      setError(null);

      // Supabase環境変数チェック
      if (!isSupabaseConfigured) {
        console.error("❌ Supabase is not configured!");
        console.error("📌 Check your .env.local file:");
        console.error("   NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.error("   NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set (Hidden)" : "❌ NOT SET");
        console.error("💡 Solution: Update .env.local with your actual Supabase credentials");
        console.error("   1. Go to https://supabase.com/dashboard");
        console.error("   2. Select your project → Settings → API");
        console.error("   3. Copy 'Project URL' and 'anon public key'");
        console.error("   4. Update .env.local file");
        console.error("   5. Restart dev server: npm run dev");
        
        setError("SUPABASE_NOT_CONFIGURED");
        setIsLoading(false);
        return;
      }

      // コンポーネントがアンマウントされた場合は中止
      if (signal?.aborted) {
        console.log("⚠️ Request aborted (component unmounted)");
        return;
      }

      console.log("🗄️ Fetching from Supabase...");
      console.log("📡 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      // Supabase から取得
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (fetchError) {
        console.error("❌ Supabase error:", fetchError);
        console.error("   Error code:", fetchError.code);
        console.error("   Error message:", fetchError.message);
        console.error("   Error details:", fetchError.details);
        
        if (fetchError.code === "PGRST116") {
          // 投稿が見つからない
          console.warn("⚠️ Post not found with ID:", postId);
          setError("NOT_FOUND");
        } else if (fetchError.code === "42P01") {
          // テーブルが存在しない
          console.error("❌ Table 'posts' does not exist!");
          console.error("💡 Solution: Create the 'posts' table in Supabase");
          setError("TABLE_NOT_FOUND");
        } else if (fetchError.message.includes("JWT")) {
          // 認証エラー
          console.error("❌ Authentication error - Invalid API key");
          console.error("💡 Solution: Check your NEXT_PUBLIC_SUPABASE_ANON_KEY");
          setError("AUTH_ERROR");
        } else {
          throw fetchError;
        }
        setIsLoading(false);
        return;
      }

      // コンポーネントがアンマウントされた場合は中止
      if (signal?.aborted) {
        console.log("⚠️ Request aborted before setting state");
        return;
      }

      console.log("✅ Post loaded from Supabase:", data);
      console.log("   Post ID:", data?.id);
      console.log("   Category:", data?.category);
      console.log("   Content preview:", data?.content?.substring(0, 50) + "...");
      
      setPost(data as Post);
    } catch (err) {
      // AbortError は無視
      if (err instanceof Error && err.name === 'AbortError') {
        console.log("⚠️ Fetch aborted (component unmounted)");
        return;
      }

      // コンポーネントがアンマウントされた場合は状態を更新しない
      if (signal?.aborted) {
        return;
      }

      console.error("❌ Error fetching post:", err);
      console.error("   Error type:", err instanceof Error ? err.constructor.name : typeof err);
      console.error("   Error message:", err instanceof Error ? err.message : String(err));
      
      setError(err instanceof Error ? err.message : "投稿の取得に失敗しました");
    } finally {
      // コンポーネントがマウントされている場合のみ更新
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [postId]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchPost(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchPost]);

  return { post, isLoading, error };
}

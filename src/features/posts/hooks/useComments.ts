"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// 環境変数チェック
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * コメントの型定義
 */
export interface Comment {
  id: string;
  post_id: string;
  content: string;
  nickname: string;
  created_at: string;
}

/**
 * 特定投稿のコメント取得Hook
 */
export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      console.log("💬 Fetching comments for post ID:", postId);
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.warn("⚠️ Supabase is not configured");
        setComments([]);
        setCount(0);
        setIsLoading(false);
        return;
      }

      console.log("🗄️ Fetching comments from Supabase...");
      // Supabase からコメント取得
      const { data, error: fetchError, count: totalCount } = await supabase
        .from("comments")
        .select("*", { count: "exact" })
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (fetchError) {
        console.error("❌ Supabase comments error:", fetchError);
        throw fetchError;
      }

      console.log(`✅ Loaded ${data?.length || 0} comments from Supabase`);
      setComments(data || []);
      setCount(totalCount || 0);
    } catch (err) {
      console.error("❌ Error fetching comments:", err);
      setError(err instanceof Error ? err.message : "コメントの取得に失敗しました");
      setComments([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, count, isLoading, error, refetch: fetchComments };
}

/**
 * 投稿のコメント数のみ取得するHook（軽量版）
 * PostCardで使用
 */
export function useCommentCount(postId: string) {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        console.warn("⚠️ Supabase is not configured");
        setCount(0);
        setIsLoading(false);
        return;
      }

      // Supabase から個数のみ取得（head: true でデータは取得せず、カウントのみ）
      const { count: totalCount, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (error) {
        console.error("❌ Error fetching comment count:", error);
        throw error;
      }

      console.log(`✅ Comment count for post ${postId}: ${totalCount || 0}`);
      setCount(totalCount || 0);
    } catch (err) {
      console.error("❌ Error fetching comment count:", err);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return { count, isLoading, refetch: fetchCount };
}

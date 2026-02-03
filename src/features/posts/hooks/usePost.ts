"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types";

// 環境変数チェック
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * モックデータ生成（テスト用）
 * メインフィードのモックデータと完全一致
 */
const generateMockPost = (postId: string): Post | null => {
  const mockPosts: Record<string, Post> = {
    "1": {
      id: "1",
      content: "今年のボーナス、手取りで50万円でした。\n\n業界：IT\n勤続年数：5年目\n会社規模：300人\n\n皆さんはどうでしたか？",
      category: "ボーナス報告",
      nickname: "匿名のエンジニア",
      likes_count: 42,
      comments_count: 8,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    "2": {
      id: "2",
      content: "年収600万円ですが、実際の手取りは月35万円程度..。税金高すぎませんか？\n\n独身・東京勤務です。",
      category: "年収・手取り",
      nickname: "匿名の会社員",
      likes_count: 67,
      comments_count: 15,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    "3": {
      id: "3",
      content: "残業月80時間、休日出勤あり、パワハラ日常茶飯事...これってブラック企業ですよね？判定お願いします。",
      category: "ホワイト・ブラック判定",
      nickname: "疲れた社員",
      likes_count: 89,
      comments_count: 23,
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    "4": {
      id: "4",
      content: "上司との人間関係に本当に悩んでいます。毎日のように小さなことで怒られて、精神的に限界です...",
      category: "人間関係・上司",
      nickname: "悩める社員",
      likes_count: 34,
      comments_count: 12,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    "5": {
      id: "5",
      content: "30代で未経験の業界に転職しました。給与は下がったけど、人間関係が良くて毎日が楽しいです。",
      category: "転職のホンネ",
      nickname: "転職成功者",
      likes_count: 56,
      comments_count: 9,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  };

  return mockPosts[postId] || null;
};

/**
 * 単一投稿データ取得Hook
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
        console.log("📦 Using mock data (Supabase not configured)");
        // モックデータ
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const mockPost = generateMockPost(postId);
        
        if (!mockPost) {
          console.error("❌ Mock post not found for ID:", postId);
          setError("NOT_FOUND");
          setIsLoading(false);
          return;
        }

        console.log("✅ Mock post loaded:", mockPost);
        setPost(mockPost);
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

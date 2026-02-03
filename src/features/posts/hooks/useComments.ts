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
 * モックコメントデータ
 */
const generateMockComments = (postId: string): Comment[] => {
  const allMockComments: Record<string, Comment[]> = {
    "1": [
      {
        id: "c1-1",
        post_id: "1",
        content: "私も同じくらいのボーナスでした！業界によって差がありますよね。",
        nickname: "匿名の営業マン",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "c1-2",
        post_id: "1",
        content: "IT業界は比較的ボーナスが高めですね。羨ましいです。",
        nickname: "匿名の事務員",
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    "2": [
      {
        id: "c2-1",
        post_id: "2",
        content: "税金本当に高いですよね...。特に住民税が痛いです。",
        nickname: "匿名の会社員A",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "c2-2",
        post_id: "2",
        content: "ふるさと納税を活用すると少し節税できますよ！",
        nickname: "匿名の経理担当",
        created_at: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: "c2-3",
        post_id: "2",
        content: "同じく600万円台ですが、手取りは似たような感じです。",
        nickname: "匿名のエンジニアB",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    "3": [
      {
        id: "c3-1",
        post_id: "3",
        content: "それは完全にブラックです。早めに転職を検討した方が良いと思います。",
        nickname: "元ブラック企業社員",
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: "c3-2",
        post_id: "3",
        content: "労働基準監督署に相談することをお勧めします。",
        nickname: "匿名の労務担当",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    "4": [
      {
        id: "c4-1",
        post_id: "4",
        content: "私も同じような経験があります。まずは上司以外の人に相談してみてはいかがでしょうか。",
        nickname: "匿名のエンジニア4567",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "c4-2",
        post_id: "4",
        content: "転職する前に、人事部門に相談することをお勧めします。社内で解決できる可能性もあります。",
        nickname: "匿名の人事担当8901",
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    "5": [
      {
        id: "c5-1",
        post_id: "5",
        content: "素晴らしい決断だと思います！給与より人間関係の方が大切ですよね。",
        nickname: "匿名の転職経験者",
        created_at: new Date(Date.now() - 86400000 + 3600000).toISOString(),
      },
    ],
  };

  return allMockComments[postId] || [];
};

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
        console.log("📦 Using mock comments data");
        await new Promise((resolve) => setTimeout(resolve, 300));

        const mockComments = generateMockComments(postId);
        console.log(`✅ Loaded ${mockComments.length} mock comments`);
        
        setComments(mockComments);
        setCount(mockComments.length);
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
 */
export function useCommentCount(postId: string) {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        const mockComments = generateMockComments(postId);
        setCount(mockComments.length);
        setIsLoading(false);
        return;
      }

      // Supabase から個数のみ取得
      const { count: totalCount, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (error) throw error;

      setCount(totalCount || 0);
    } catch (err) {
      console.error("Error fetching comment count:", err);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return { count, isLoading };
}

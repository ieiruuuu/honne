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
  user_id?: string; // 投稿者判定用
  parent_id?: string | null; // 親コメントID (null = トップレベル)
  content: string;
  nickname: string;
  likes_count?: number; // いいね数
  created_at: string;
  replies?: Comment[]; // ネストされた返信 (クライアント側で構築)
}

/**
 * 特定投稿のコメント取得Hook
 */
export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async (signal?: AbortSignal) => {
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

      if (signal?.aborted) {
        console.log("⚠️ Request aborted (component unmounted)");
        return;
      }

      console.log("🗄️ Fetching comments from Supabase...");
      // Supabase からコメント取得 (parent_id, likes_count 含む)
      const { data, error: fetchError, count: totalCount } = await supabase
        .from("comments")
        .select("*", { count: "exact" })
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (fetchError) {
        console.error("❌ Supabase comments error:", fetchError);
        throw fetchError;
      }

      if (signal?.aborted) {
        console.log("⚠️ Request aborted before setting state");
        return;
      }

      console.log(`✅ Loaded ${data?.length || 0} comments from Supabase`);
      
      // ネスト構造の構築 (parent_id を使用)
      const commentsData = data || [];
      const topLevelComments = commentsData.filter((c) => !c.parent_id);
      const nestedComments = topLevelComments.map((topComment) => {
        const replies = commentsData.filter((c) => c.parent_id === topComment.id);
        return {
          ...topComment,
          replies: replies.length > 0 ? replies : undefined,
        };
      });

      console.log(`📊 Nested structure: ${topLevelComments.length} top-level, ${commentsData.length - topLevelComments.length} replies`);
      
      setComments(nestedComments);
      setCount(totalCount || 0);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log("⚠️ Fetch aborted (component unmounted)");
        return;
      }

      if (signal?.aborted) {
        return;
      }

      console.error("❌ Error fetching comments:", err);
      setError(err instanceof Error ? err.message : "コメントの取得に失敗しました");
      setComments([]);
      setCount(0);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [postId]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchComments(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchComments]);

  /**
   * コメント作成 (トップレベル & 返信)
   */
  const createComment = useCallback(async (data: {
    post_id: string;
    user_id: string;
    content: string;
    nickname: string;
    parent_id?: string; // 返信の場合は親コメントID
  }) => {
    try {
      console.log('💬 Creating comment with data:', {
        post_id: data.post_id,
        user_id: data.user_id,
        content: data.content.substring(0, 50) + '...',
        nickname: data.nickname,
      });

      if (!isSupabaseConfigured) {
        console.error('❌ Supabase is not configured');
        throw new Error('Supabase設定が必要です');
      }

      // バリデーション
      if (!data.user_id) {
        console.error('❌ User ID is missing');
        throw new Error('ログインが必要です');
      }

      if (!data.content.trim()) {
        console.error('❌ Comment content is empty');
        throw new Error('コメント内容を入力してください');
      }

      if (!data.nickname.trim()) {
        console.error('❌ Nickname is missing');
        throw new Error('ニックネームが必要です');
      }

      // 返信の返信を防ぐ (最大2階層まで)
      if (data.parent_id) {
        console.log('🔍 Checking if parent comment is already a reply...');
        const { data: parentComment, error: parentError } = await supabase
          .from('comments')
          .select('parent_id')
          .eq('id', data.parent_id)
          .single();

        if (parentError) {
          console.error('❌ Error checking parent comment:', parentError);
          throw new Error('親コメントの確認に失敗しました');
        }

        if (parentComment && parentComment.parent_id) {
          console.error('❌ Cannot reply to a reply (max 2 levels)');
          throw new Error('返信への返信はできません。親コメントにのみ返信できます。');
        }
      }

      // Supabase に挿入 (parent_id を含む)
      const insertData: Record<string, unknown> = {
        post_id: data.post_id,
        user_id: data.user_id,
        content: data.content.trim(),
        nickname: data.nickname.trim(),
      };

      // 返信の場合は parent_id を追加
      if (data.parent_id) {
        insertData.parent_id = data.parent_id;
        console.log('💬 Creating reply to comment:', data.parent_id);
      }

      const { data: newComment, error: insertError } = await supabase
        .from('comments')
        .insert([insertData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Supabase insert error:', insertError);
        console.error('   Error code:', insertError.code);
        console.error('   Error message:', insertError.message);
        console.error('   Error details:', insertError.details);
        console.error('   Error hint:', insertError.hint);
        throw insertError;
      }

      console.log('✅ Comment created successfully:', newComment);

      // コメント一覧を再取得
      await fetchComments();

      return { success: true, comment: newComment };
    } catch (err) {
      console.error('❌ Error creating comment:', err);
      const errorMessage = err instanceof Error ? err.message : 'コメントの投稿に失敗しました';
      return { success: false, error: errorMessage };
    }
  }, [fetchComments]);

  return { comments, count, isLoading, error, refetch: fetchComments, createComment };
}

/**
 * 投稿のコメント数のみ取得するHook（軽量版）
 * PostCardで使用
 */
export function useCommentCount(postId: string) {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        setCount(0);
        setIsLoading(false);
        return;
      }

      if (signal?.aborted) {
        return;
      }

      // Supabase から個数のみ取得（head: true でデータは取得せず、カウントのみ）
      const { count: totalCount, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (signal?.aborted) {
        return;
      }

      if (error) {
        console.error("❌ Error fetching comment count:", error);
        throw error;
      }

      console.log(`✅ Comment count for post ${postId}: ${totalCount || 0}`);
      setCount(totalCount || 0);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      if (signal?.aborted) {
        return;
      }

      console.error("❌ Error fetching comment count:", err);
      setCount(0);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [postId]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchCount(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchCount]);

  return { count, isLoading, refetch: fetchCount };
}

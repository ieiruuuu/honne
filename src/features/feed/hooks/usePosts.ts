import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Post, Category } from "@/types";

// 환경 변수 체크
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * 게시글 목록을 가져오고 실시간 업데이트를 구독하는 Hook
 * 
 * @param category - 필터링할 카테고리 (옵션)
 * @returns posts - 게시글 배열
 * @returns isLoading - 로딩 상태
 * @returns error - 에러 메시지
 * @returns refetch - 수동 새로고침 함수
 */
export function usePosts(category?: Category) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 수동 refetch 함수
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Supabase가 설정되지 않은 경우
      if (!isSupabaseConfigured) {
        console.warn("⚠️ Supabase is not configured. Please check environment variables.");
        setPosts([]);
        return;
      }

      // Supabase 쿼리
      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      // 카테고리 필터링 추가
      if (category) {
        query = query.eq("category", category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      console.log(`✅ Refetched ${data?.length || 0} posts from Supabase`);
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "投稿の取得に失敗しました");
      console.error("❌ Error refetching posts:", err);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    // 초기 데이터 로드
    const loadData = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Supabase가 설정되지 않은 경우
        if (!isSupabaseConfigured) {
          console.warn("⚠️ Supabase is not configured. Please check environment variables.");
          setPosts([]);
          return;
        }

        // Supabase 쿼리
        let query = supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        // 카테고리 필터링 추가
        if (category) {
          query = query.eq("category", category);
        }

        const { data, error: fetchError } = await query;

        if (!isMounted) return;

        if (fetchError) throw fetchError;

        console.log(`✅ Fetched ${data?.length || 0} posts from Supabase`);
        console.log("📊 Posts data:", data);

        setPosts(data || []);
      } catch (err) {
        if (!isMounted) return;
        
        // AbortError는 무시 (정상적인 cleanup)
        if (err instanceof Error && err.name === 'AbortError') {
          console.log("⚠️ Request aborted (component unmounted)");
          return;
        }
        
        setError(err instanceof Error ? err.message : "投稿の取得に失敗しました");
        console.error("❌ Error fetching posts:", err);
        setPosts([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    // Supabase가 설정되지 않은 경우 구독 스킵
    if (!isSupabaseConfigured) {
      console.log("⚠️ Realtime subscription skipped (Supabase not configured)");
      return () => {
        isMounted = false;
        abortController.abort();
      };
    }

    // 실시간 구독 설정
    console.log("🔄 Setting up realtime subscription for posts...");
    const channel = supabase
      .channel("posts_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          if (!isMounted) return;
          
          console.log("📡 Realtime update received:", payload.eventType);
          const newPost = payload.new as Post;
          const oldPost = payload.old as { id: string };

          // 카테고리 필터링이 있는 경우 해당 카테고리만 업데이트
          if (payload.eventType === "INSERT") {
            if (!category || newPost.category === category) {
              setPosts((current) => [newPost, ...current]);
            }
          } else if (payload.eventType === "UPDATE") {
            setPosts((current) =>
              current.map((post) =>
                post.id === newPost.id ? newPost : post
              )
            );
          } else if (payload.eventType === "DELETE") {
            setPosts((current) =>
              current.filter((post) => post.id !== oldPost.id)
            );
          }
        }
      )
      .subscribe();

    // 클린업
    return () => {
      console.log("🧹 Cleaning up realtime subscription...");
      isMounted = false;
      abortController.abort();
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]); // category 변경 시 재구독

  return {
    posts,
    isLoading,
    error,
    refetch: fetchPosts,
  };
}

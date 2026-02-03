import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Post } from "@/types";

// 환경 변수 체크
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

// 모크 데이터 (Supabase 미設정 시 사용)
const mockPosts: Post[] = [
  {
    id: "1",
    content: "3年目、システムエンジニア、年収450万円、手取り月28万円くらいです。同じ経験年数の方、どれくらいもらってますか？",
    category: "年収・手取り",
    nickname: "匿名太郎",
    likes_count: 42,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "2",
    content: "夏のボーナス、業績好調で4.5ヶ月分出ました！久々に嬉しい報告です。みなさんの会社はどうでしたか？",
    category: "ボーナス報告",
    nickname: "サラリーマン",
    likes_count: 67,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "3",
    content: "残業月80時間、休日出勤あり、パワハラ日常茶飯事...これってブラック企業ですよね？判定お願いします。",
    category: "ホワイト・ブラック判定",
    nickname: "疲れた社員",
    likes_count: 89,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "4",
    content: "上司との人間関係に本当に悩んでいます。毎日のように小さなことで怒られて、精神的に限界です...",
    category: "人間関係・上司",
    nickname: "悩める社員",
    likes_count: 34,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "5",
    content: "30代で未経験の業界に転職しました。給与は下がったけど、人間関係が良くて毎日が楽しいです。",
    category: "転職のホンネ",
    nickname: "転職成功者",
    likes_count: 56,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

/**
 * 게시글 목록을 가져오고 실시간 업데이트를 구독하는 Hook
 * Supabase가 설정되지 않은 경우 모크 데이터를 반환합니다.
 * 
 * @returns posts - 게시글 배열
 * @returns isLoading - 로딩 상태
 * @returns error - 에러 메시지
 * @returns refetch - 수동 새로고침 함수
 */
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Supabase가 설정되지 않은 경우 모크 데이터 사용
      if (!isSupabaseConfigured) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션
        setPosts(mockPosts);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "投稿の取得に失敗しました");
      console.error("Error fetching posts:", err);
      // 에러 시에도 모크 데이터 표시
      setPosts(mockPosts);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 초기 데이터 로드
    fetchPosts();

    // Supabase가 설정되지 않은 경우 구독 스킵
    if (!isSupabaseConfigured) {
      return;
    }

    // 실시간 구독 설정
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
          if (payload.eventType === "INSERT") {
            setPosts((current) => [payload.new as Post, ...current]);
          } else if (payload.eventType === "UPDATE") {
            setPosts((current) =>
              current.map((post) =>
                post.id === payload.new.id ? (payload.new as Post) : post
              )
            );
          } else if (payload.eventType === "DELETE") {
            setPosts((current) =>
              current.filter((post) => post.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // 클린업
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    posts,
    isLoading,
    error,
    refetch: fetchPosts,
  };
}

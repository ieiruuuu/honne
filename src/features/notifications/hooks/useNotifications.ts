import { useState, useEffect } from "react";
import { Notification, Post } from "@/types";
import { supabase } from "@/lib/supabase";
import { HOT_POST_THRESHOLD } from "../constants";

// Supabase 設定チェック
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

// モック通知データ
const mockNotifications: Notification[] = [
  {
    id: "hot-1",
    type: "HOT_POST",
    post_id: "1",
    content: "「上司との人間関係」についての投稿が話題になっています",
    is_read: false,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "2",
    type: "LIKE",
    post_id: "2",
    content: "「サラリーマン」さんがあなたの投稿にいいねしました",
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "3",
    type: "COMMENT",
    post_id: "3",
    content: "「匿名太郎」さんがあなたの投稿にコメントしました",
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "4",
    type: "LIKE",
    post_id: "1",
    content: "「転職希望」さんがあなたの投稿にいいねしました",
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

/**
 * 通知管理カスタムフック
 * 
 * 機能:
 * - 個人通知（コメント・いいね）
 * - 人気投稿通知（likes_count >= 20）
 * - リアルタイム更新
 * - 既読/未読管理
 * 
 * @returns notifications - 通知リスト（人気投稿が最上部）
 * @returns hotPosts - 人気投稿リスト
 * @returns markAsRead - 既読にする
 * @returns markAllAsRead - すべて既読にする
 * @returns deleteNotification - 通知削除
 * @returns unreadCount - 未読数
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);

  /**
   * 人気投稿を取得
   */
  useEffect(() => {
    const fetchHotPosts = async () => {
      if (!isSupabaseConfigured) {
        // モックデータ
        const mockHotPosts: Post[] = [
          {
            id: "hot-1",
            content: "3年目、システムエンジニア、年収450万円、手取り月28万円くらいです。みなさんはどうですか？",
            category: "年収・手取り",
            nickname: "匿名太郎",
            likes_count: 87,
            comments_count: 34,
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: "hot-2",
            content: "残業月80時間、休日出勤あり、パワハラ日常茶飯事...これってブラック企業ですよね？",
            category: "ホワイト・ブラック判定",
            nickname: "疲れた社員",
            likes_count: 65,
            comments_count: 28,
            created_at: new Date(Date.now() - 10800000).toISOString(),
          },
        ];
        setHotPosts(mockHotPosts);
        return;
      }

      try {
        // likes_count が閾値以上の投稿を取得
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .gte("likes_count", HOT_POST_THRESHOLD)
          .order("likes_count", { ascending: false })
          .limit(5);

        if (error) throw error;
        setHotPosts(data || []);
      } catch (err) {
        console.error("Failed to fetch hot posts:", err);
      }
    };

    fetchHotPosts();

    // 定期的に更新（5分ごと）
    const interval = setInterval(fetchHotPosts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * 既読にする
   */
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
  };

  /**
   * すべて既読にする
   */
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, is_read: true }))
    );
  };

  /**
   * 通知削除
   */
  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  };

  /**
   * 未読数
   */
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  /**
   * 人気投稿通知を最上部に配置
   */
  const sortedNotifications = [...notifications].sort((a, b) => {
    // HOT_POST を最上部に
    if (a.type === "HOT_POST" && b.type !== "HOT_POST") return -1;
    if (a.type !== "HOT_POST" && b.type === "HOT_POST") return 1;
    
    // 未読を優先
    if (!a.is_read && b.is_read) return -1;
    if (a.is_read && !b.is_read) return 1;
    
    // 作成日時で降順
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return {
    notifications: sortedNotifications,
    hotPosts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
  };
}

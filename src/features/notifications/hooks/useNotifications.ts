import { useState, useEffect, useCallback } from "react";
import { Notification, Post } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { HOT_POST_THRESHOLD, HOT_POST_HOURS } from "../constants";
import { useAuthStore } from "@/store/useAuthStore";

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
  const { isAuthenticated, user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [hotPostsCount, setHotPostsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 個人通知を取得（Supabase）
   */
  const fetchPersonalNotifications = useCallback(async () => {
    if (!isSupabaseConfigured || !isAuthenticated || !user?.id) {
      setNotifications([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
        return;
      }

      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
    }
  }, [isAuthenticated, user?.id]);

  /**
   * 人気投稿を取得（最近24時間以内、likes_count >= 閾値）
   */
  const fetchHotPosts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      // ログ削減: 初回のみ警告
      if (!sessionStorage.getItem('supabase-config-warned')) {
        console.warn("⚠️ Supabase is not configured");
        sessionStorage.setItem('supabase-config-warned', 'true');
      }
      setHotPosts([]);
      setHotPostsCount(0);
      return;
    }

    try {
      // 最近24時間以内 & likes_count が閾値以上の投稿を取得
      const twentyFourHoursAgo = new Date(Date.now() - HOT_POST_HOURS * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .gte("likes_count", HOT_POST_THRESHOLD)
        .gte("created_at", twentyFourHoursAgo)
        .order("likes_count", { ascending: false })
        .limit(10);

      if (error) throw error;
      setHotPosts(data || []);
      setHotPostsCount(data?.length || 0);
    } catch (err) {
      console.error("Failed to fetch hot posts:", err);
      setHotPosts([]);
      setHotPostsCount(0);
    }
  }, []);

  /**
   * データ取得
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // 個人通知取得（ログインユーザーのみ）
      if (isAuthenticated) {
        await fetchPersonalNotifications();
      }
      
      // 人気投稿取得（全ユーザー）
      await fetchHotPosts();
      
      setIsLoading(false);
    };

    loadData();

    // 定期的に更新（5分ごと）
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchPersonalNotifications();
      }
      fetchHotPosts();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchPersonalNotifications, fetchHotPosts]);

  /**
   * 既読にする（Supabase更新）
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    // 楽観的UI更新
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );

    // Supabase更新
    if (isSupabaseConfigured && isAuthenticated) {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId);

        if (error) {
          console.error("Failed to mark notification as read:", error);
          // ロールバック
          await fetchPersonalNotifications();
        }
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  }, [isAuthenticated, fetchPersonalNotifications]);

  /**
   * すべて既読にする（Supabase更新）
   */
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    // 楽観的UI更新
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, is_read: true }))
    );

    // Supabase更新
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id)
          .eq("is_read", false);

        if (error) {
          console.error("Failed to mark all notifications as read:", error);
          // ロールバック
          await fetchPersonalNotifications();
        }
      } catch (err) {
        console.error("Failed to mark all notifications as read:", err);
      }
    }
  }, [isAuthenticated, user?.id, fetchPersonalNotifications]);

  /**
   * 通知削除（Supabase削除）
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    // 楽観的UI更新
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );

    // Supabase削除
    if (isSupabaseConfigured && isAuthenticated) {
      try {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notificationId);

        if (error) {
          console.error("Failed to delete notification:", error);
          // ロールバック
          await fetchPersonalNotifications();
        }
      } catch (err) {
        console.error("Failed to delete notification:", err);
      }
    }
  }, [isAuthenticated, fetchPersonalNotifications]);

  /**
   * 未読数（個人通知のみ）
   */
  const personalUnreadCount = notifications.filter((n) => !n.is_read && n.type !== "HOT_POST").length;

  /**
   * バッジ表示数
   * - ログインユーザー: 個人通知の未読数
   * - ゲストユーザー: 最近24時間の人気投稿数
   */
  const badgeCount = isAuthenticated ? personalUnreadCount : hotPostsCount;

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
    unreadCount: personalUnreadCount, // 個人通知の未読数
    badgeCount, // バッジ表示数（ログイン/ゲストで異なる）
    isGuest: !isAuthenticated, // ゲストユーザーかどうか
    hotPostsCount, // 人気投稿数
    isLoading, // ローディング状態
  };
}

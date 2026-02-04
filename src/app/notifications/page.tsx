"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { NOTIFICATION_LABELS } from "@/features/notifications/constants";
import { Bell, Heart, MessageCircle, Trash2, CheckCheck, TrendingUp, LogIn, Flame } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/features/auth/components/AuthModal";

export default function NotificationsPage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const {
    notifications,
    hotPosts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
    isGuest,
    hotPostsCount,
  } = useNotifications();

  const handleNotificationClick = (notificationId: string, postId: string) => {
    markAsRead(notificationId);
    router.push(`/post/${postId}`);
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (confirm(NOTIFICATION_LABELS.DELETE_CONFIRM)) {
      deleteNotification(notificationId);
    }
  };

  /**
   * 通知アイコンを取得
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case "COMMENT":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "HOT_POST":
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  /**
   * 相対時間を取得
   */
  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - posted.getTime()) / 60000);

    if (diffInMinutes < 1) return "たった今";
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}時間前`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}日前`;
  };

  // 人気投稿と個人通知を分離
  const hotPostNotifications = notifications.filter((n) => n.type === "HOT_POST");
  const personalNotifications = notifications.filter((n) => n.type !== "HOT_POST");

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* ゲストユーザー向けログインプロンプト */}
        {isGuest && (
          <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <LogIn className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {NOTIFICATION_LABELS.GUEST_LOGIN_PROMPT}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {NOTIFICATION_LABELS.GUEST_HOT_POSTS_SUBTITLE}
                  </p>
                  <Button 
                    onClick={() => setShowAuthModal(true)}
                    className="gap-2 bg-orange-500 hover:bg-orange-600"
                  >
                    <LogIn className="w-4 h-4" />
                    {NOTIFICATION_LABELS.GUEST_LOGIN_BUTTON}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {NOTIFICATION_LABELS.TITLE}
            </h1>
            {isGuest ? (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                {hotPostsCount}
                {NOTIFICATION_LABELS.NEW_HOT_POSTS}
              </p>
            ) : (
              unreadCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {unreadCount}
                  {NOTIFICATION_LABELS.UNREAD_COUNT}
                </p>
              )
            )}
          </div>
          {!isGuest && notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              {NOTIFICATION_LABELS.MARK_ALL_READ}
            </Button>
          )}
        </div>

        {/* ゲストユーザー: 人気投稿リストのみ表示 */}
        {isGuest ? (
          hotPosts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Flame className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  今は話題の投稿がありません
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {hotPosts.map((post) => (
                <Card
                  key={post.id}
                  className="cursor-pointer hover:shadow-md transition-all border-orange-200 hover:border-orange-300"
                  onClick={() => router.push(`/posts/${post.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-100" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {post.nickname}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                            {post.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {post.comments_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {NOTIFICATION_LABELS.NO_NOTIFICATIONS}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 話題の投稿セクション */}
            {hotPostNotifications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{NOTIFICATION_LABELS.HOT_POST_ICON}</span>
                  <h2 className="text-lg font-bold text-orange-600">
                    {NOTIFICATION_LABELS.HOT_POSTS}
                  </h2>
                </div>
                <div className="space-y-2">
                  {hotPostNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        !notification.is_read
                          ? "border-orange-200 bg-orange-50"
                          : "border-gray-200"
                      }`}
                      onClick={() =>
                        handleNotificationClick(notification.id, notification.post_id)
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {timeAgo(notification.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 個人通知セクション */}
            {personalNotifications.length > 0 && (
              <div>
                {hotPostNotifications.length > 0 && (
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    {NOTIFICATION_LABELS.PERSONAL_NOTIFICATIONS}
                  </h2>
                )}
                <div className="space-y-2">
                  {personalNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        !notification.is_read
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      onClick={() =>
                        handleNotificationClick(notification.id, notification.post_id)
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {timeAgo(notification.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
      
      {/* 認証モーダル */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

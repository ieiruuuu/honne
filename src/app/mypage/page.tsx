"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/features/posts/PostCard";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { OnboardingModal } from "@/features/auth/components/OnboardingModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNickname } from "@/features/user/hooks/useNickname";
import { useMyPosts } from "@/features/user/hooks/useMyPosts";
import { useUserStats } from "@/features/user/hooks/useUserStats";
import { USER_LABELS } from "@/features/user/constants";
import { AUTH_LABELS } from "@/features/auth/constants";
import { ONBOARDING_LABELS } from "@/features/auth/components/onboarding-constants";
import { CATEGORIES } from "@/lib/constants/ja";
import { Heart, MessageSquare, Settings, RefreshCw, Loader2, Lock, LogOut } from "lucide-react";

/**
 * マイページ
 * ログイン状態に応じて動的に表示を切り替え
 */
export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, updateUserProfile, skipOnboarding } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");

  const { nickname, regenerateNickname } = useNickname();
  const { myPosts, isLoading, filter, setFilter } = useMyPosts(
    isAuthenticated ? (user?.nickname || nickname) : nickname
  );
  
  // 実際のDB統計情報を取得
  const { stats } = useUserStats(
    user?.id,
    isAuthenticated ? (user?.nickname || nickname) : nickname
  );

  // 統計情報（実際のDBカウント）
  const postsCount = stats.postsCount;
  const likesReceived = stats.likesReceived;
  const commentsReceived = stats.commentsReceived;

  const handleRegenerateNickname = () => {
    if (confirm("ニックネームを変更しますか？")) {
      regenerateNickname();
      alert(USER_LABELS.NICKNAME_REGENERATED);
    }
  };

  // オンボーディングチェック
  useEffect(() => {
    if (isAuthenticated && user) {
      const hasOnboarded = localStorage.getItem('user_has_onboarded') === 'true' || user.has_onboarded;
      
      if (!hasOnboarded) {
        setShowOnboardingModal(true);
      }
    }
  }, [isAuthenticated, user]);

  const handleOnboardingComplete = async (data: { company_name?: string; salary?: number }) => {
    await updateUserProfile(data);
    setShowOnboardingModal(false);
    alert(ONBOARDING_LABELS.SAVE_SUCCESS);
  };

  const handleOnboardingSkip = () => {
    skipOnboarding();
    setShowOnboardingModal(false);
  };

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await logout();
      alert(AUTH_LABELS.LOGOUT_SUCCESS);
    }
  };

  // 認証チェック中のローディング
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
        <BottomNav />
      </div>
    );
  }

  // 未ログイン時: ログイン促進画面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {AUTH_LABELS.LOGIN_REQUIRED}
            </h2>
            
            <p className="text-gray-600 mb-8">
              ログインするとプロフィールの管理や<br />
              投稿の保存ができます
            </p>

            {/* ログインのメリット */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg text-left">
              <p className="text-sm font-medium text-gray-700 mb-4">
                {AUTH_LABELS.WHY_LOGIN}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  {AUTH_LABELS.BENEFIT_1}
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  {AUTH_LABELS.BENEFIT_2}
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  {AUTH_LABELS.BENEFIT_3}
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  {AUTH_LABELS.BENEFIT_4}
                </li>
              </ul>
            </div>

            <Button
              onClick={() => setShowAuthModal(true)}
              size="lg"
              className="w-full max-w-xs mx-auto"
            >
              ログインする
            </Button>
          </div>
        </main>

        <BottomNav />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        <OnboardingModal
          isOpen={showOnboardingModal}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </div>
    );
  }

  // ログイン済み: プロフィール画面
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* プロフィールセクション */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-medium">
                {user?.nickname ? user.nickname.charAt(0) : "匿"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.nickname || nickname}
                  </h2>
                  <button
                    onClick={handleRegenerateNickname}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title={USER_LABELS.REGENERATE_NICKNAME}
                  >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {user?.email || "匿名ユーザー"}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{postsCount}</p>
              <p className="text-xs text-gray-600">{USER_LABELS.POSTS_COUNT}</p>
            </div>
            <div className="text-center border-l border-gray-200">
              <div className="flex items-center justify-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <p className="text-2xl font-bold text-gray-900">
                  {likesReceived}
                </p>
              </div>
              <p className="text-xs text-gray-600">{USER_LABELS.LIKES_RECEIVED}</p>
            </div>
            <div className="text-center border-l border-gray-200">
              <div className="flex items-center justify-center gap-1">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <p className="text-2xl font-bold text-gray-900">
                  {commentsReceived}
                </p>
              </div>
              <p className="text-xs text-gray-600">
                {USER_LABELS.COMMENTS_RECEIVED}
              </p>
            </div>
          </div>

          {/* ログアウトボタン */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full mt-4 gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            {AUTH_LABELS.LOGOUT}
          </Button>
        </div>

        {/* タブ切り替え */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "posts" ? "default" : "outline"}
            onClick={() => setActiveTab("posts")}
            className="flex-1"
          >
            {USER_LABELS.MY_POSTS}
          </Button>
          <Button
            variant={activeTab === "liked" ? "default" : "outline"}
            onClick={() => setActiveTab("liked")}
            className="flex-1"
          >
            {USER_LABELS.MY_LIKED_POSTS}
          </Button>
        </div>

        {/* フィルター・ソートコントロール */}
        {activeTab === "posts" && (
          <div className="flex gap-2 mb-6">
            <select
              value={filter.category || ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  category: e.target.value || undefined,
                })
              }
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
            >
              <option value="">{USER_LABELS.FILTER_ALL}</option>
              <option value={CATEGORIES.SALARY}>💰 {CATEGORIES.SALARY}</option>
              <option value={CATEGORIES.WHITE_BLACK}>⚖️ {CATEGORIES.WHITE_BLACK}</option>
              <option value={CATEGORIES.BONUS}>🎁 {CATEGORIES.BONUS}</option>
              <option value={CATEGORIES.CAREER}>💼 {CATEGORIES.CAREER}</option>
              <option value={CATEGORIES.RELATIONSHIPS}>👥 {CATEGORIES.RELATIONSHIPS}</option>
              <option value={CATEGORIES.POLITICS}>🛡️ {CATEGORIES.POLITICS}</option>
              <option value={CATEGORIES.OVERTIME}>⏰ {CATEGORIES.OVERTIME}</option>
              <option value={CATEGORIES.BENEFITS}>❤️ {CATEGORIES.BENEFITS}</option>
              <option value={CATEGORIES.MENTAL}>🧠 {CATEGORIES.MENTAL}</option>
              <option value={CATEGORIES.VENTING}>💬 {CATEGORIES.VENTING}</option>
            </select>

            <select
              value={filter.sortBy}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  sortBy: e.target.value as "latest" | "popular",
                })
              }
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
            >
              <option value="latest">{USER_LABELS.SORT_LATEST}</option>
              <option value="popular">{USER_LABELS.SORT_POPULAR}</option>
            </select>
          </div>
        )}

        {/* 投稿一覧 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : myPosts.length > 0 ? (
          <div className="space-y-4">
            {myPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {activeTab === "posts"
                ? "まだ投稿がありません"
                : "まだいいねした投稿がありません"}
            </p>
            <Button onClick={() => router.push("/write")}>投稿する</Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

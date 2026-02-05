"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

// Hydration エラー防止のためのハードコーディングされたラベル
// カスタム手描きPNGアイコンを使用
const navItems = [
  {
    id: "home",
    label: "ホーム",
    iconPath: "/home.png",
    path: "/",
  },
  {
    id: "category",
    label: "カテゴリー",
    iconPath: "/category.png",
    path: "/categories",
  },
  {
    id: "write",
    label: "投稿",
    iconPath: "/write.png",
    path: "/write",
  },
  {
    id: "notifications",
    label: "お知らせ",
    iconPath: "/bell.png",
    path: "/notifications",
    showBadge: true,
  },
  {
    id: "mypage",
    label: "マイページ",
    iconPath: "/mypage.png",
    path: "/mypage",
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { badgeCount, isGuest } = useNotifications();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const showBadge = item.showBadge && badgeCount > 0;
            
            // カテゴリー関連ページで活性化
            const isCategoryActive = 
              item.id === "category" && 
              (pathname === "/categories" || pathname.startsWith("/category/"));

            // バッジ色：ログインユーザーは赤、ゲストは橙
            const badgeColorClass = isGuest 
              ? "bg-orange-500" 
              : "bg-red-500";

            // アイコンサイズ：投稿ボタンは28px、他は24px（統一感を保ちつつ中央を軽く強調）
            const iconSize = item.id === "write" ? 28 : 24;

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-all relative",
                  // Active状態の色（全メニュー統一）
                  (isActive || isCategoryActive)
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {/* アイコンコンテナ：全メニュー同一スタイル */}
                <div className="relative flex flex-col items-center">
                  {/* カスタム手描きPNGアイコン */}
                  <div className={cn(
                    "mb-1 transition-all relative",
                    // Active状態のみdrop-shadow適用
                    (isActive || isCategoryActive) && "drop-shadow-md"
                  )}>
                    <Image
                      src={item.iconPath}
                      alt={item.label}
                      width={iconSize}
                      height={iconSize}
                      className={cn(
                        "transition-all",
                        "object-contain",
                        // Active状態：完全な不透明度、非Active：60%
                        (isActive || isCategoryActive)
                          ? "opacity-100"
                          : "opacity-60 hover:opacity-80"
                      )}
                      priority={item.id === "home"} // ホームアイコンは優先読み込み
                    />
                  </div>
                  {showBadge && (
                    <span className={cn(
                      "absolute -top-1 -right-1 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                      badgeColorClass
                    )}>
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                </div>
                {/* 텍스트 라벨：전체 통일 */}
                <span className={cn(
                  "text-xs transition-all mt-0.5", 
                  // Active状態のみfont-medium
                  (isActive || isCategoryActive) && "font-medium"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

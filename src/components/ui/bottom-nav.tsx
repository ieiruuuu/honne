"use client";

import { Home, Bell, PenSquare, User, Grid3x3 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { LABELS } from "@/lib/constants/ja";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

const navItems = [
  {
    id: "home",
    label: LABELS.HOME,
    icon: Home,
    path: "/",
  },
  {
    id: "notifications",
    label: LABELS.NOTIFICATIONS,
    icon: Bell,
    path: "/notifications",
    showBadge: true,
  },
  {
    id: "write",
    label: LABELS.WRITE,
    icon: PenSquare,
    path: "/write",
  },
  {
    id: "category",
    label: "カテゴリー",
    icon: Grid3x3,
    path: "/categories", // 독립 페이지로 변경
  },
  {
    id: "mypage",
    label: LABELS.MY_PAGE,
    icon: User,
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
            const Icon = item.icon;
            const isActive = pathname === item.path;
            const showBadge = item.showBadge && badgeCount > 0;
            
            // カテゴリー関連ページで活性化
            const isCategoryActive = 
              item.id === "category" && 
              (pathname === "/categories" || pathname.startsWith("/category/"));

            // バッジ色：ログインユーザーは赤、ゲストは主橙
            const badgeColorClass = isGuest 
              ? "bg-orange-500" 
              : "bg-red-500";

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors relative",
                  isActive || isCategoryActive
                    ? "text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    "w-6 h-6 mb-1", 
                    (isActive || isCategoryActive) && "stroke-[2.5]"
                  )} />
                  {showBadge && (
                    <span className={cn(
                      "absolute -top-1 -right-1 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                      badgeColorClass
                    )}>
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-xs", 
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

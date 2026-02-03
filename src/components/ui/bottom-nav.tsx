"use client";

import { Home, Bell, PenSquare, User } from "lucide-react";
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
    id: "mypage",
    label: LABELS.MY_PAGE,
    icon: User,
    path: "/mypage",
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            const showBadge = item.showBadge && unreadCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-colors relative",
                  isActive
                    ? "text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div className="relative">
                  <Icon className={cn("w-6 h-6 mb-1", isActive && "stroke-[2.5]")} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className={cn("text-xs", isActive && "font-medium")}>
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

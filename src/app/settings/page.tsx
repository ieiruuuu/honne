"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LABELS } from "@/lib/constants/ja";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight 
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await logout();
      alert("ログアウトしました");
      router.push("/");
    }
  };

  const settingsItems = [
    {
      icon: User,
      title: "プロフィール編集",
      description: "ニックネームやアバターを変更",
      onClick: () => router.push("/settings/profile"),
    },
    {
      icon: Bell,
      title: "通知設定",
      description: "通知の受信設定を管理",
      onClick: () => alert("通知設定（開発予定）"),
    },
    {
      icon: Shield,
      title: "プライバシー",
      description: "プライバシー設定を管理",
      onClick: () => alert("プライバシー設定（開発予定）"),
    },
    {
      icon: HelpCircle,
      title: "ヘルプ・サポート",
      description: "よくある質問とサポート",
      onClick: () => alert("ヘルプ（開発予定）"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {LABELS.SETTINGS}
          </h1>
        </div>

        <div className="space-y-2">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4" onClick={item.onClick}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* ログアウト */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-red-200">
            <CardContent className="p-4" onClick={handleLogout}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-600">
                    {LABELS.LOGOUT}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* アプリ情報 */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>本音 (Honne) v1.0.0</p>
          <p className="mt-1">© 2026 All rights reserved.</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

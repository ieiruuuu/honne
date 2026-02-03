"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LABELS, SUCCESS_MESSAGES } from "@/lib/constants/ja";
import { ArrowLeft, Camera } from "lucide-react";

export default function ProfileEditPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("匿名太郎");
  const [bio, setBio] = useState("");

  const handleSave = () => {
    // TODO: Supabase 연동
    alert(SUCCESS_MESSAGES.POST_UPDATED);
    router.back();
  };

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
            プロフィール編集
          </h1>
        </div>

        <div className="space-y-4">
          {/* アバター */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-3xl font-medium">
                    匿
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  アバターをタップして変更
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ニックネーム */}
          <Card>
            <CardContent className="pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ニックネーム
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                {nickname.length}/20
              </p>
            </CardContent>
          </Card>

          {/* 自己紹介 */}
          <Card>
            <CardContent className="pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自己紹介（任意）
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full min-h-[100px] p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                maxLength={200}
                placeholder="自己紹介を入力..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {bio.length}/200
              </p>
            </CardContent>
          </Card>

          {/* 保存ボタン */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              {LABELS.CANCEL}
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
            >
              {LABELS.SAVE}
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

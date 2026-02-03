"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { verifyLineState } from "@/lib/line-auth";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/types";

/**
 * LINE OAuth Callback ページ
 * LINE から返された Authorization Code を処理
 */
function LineCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    handleLineCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleLineCallback = async () => {
    try {
      // 1. URL パラメータから code と state を取得
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // エラーチェック
      if (error) {
        throw new Error(errorDescription || `LINE login error: ${error}`);
      }

      if (!code || !state) {
        throw new Error("Invalid callback: missing code or state");
      }

      // 2. State を検証 (CSRF 対策)
      const isValidState = verifyLineState(state);
      if (!isValidState) {
        throw new Error("Invalid state: possible CSRF attack");
      }

      // 3. Authorization Code を Access Token に交換
      setStatus("loading");
      const response = await fetch("/api/auth/line/exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to exchange LINE token");
      }

      const data = await response.json();

      if (!data.success || !data.user) {
        throw new Error("Invalid response from server");
      }

      // 4. ユーザー情報を保存
      const user: User = data.user;
      setUser(user);

      // 5. 成功
      setStatus("success");
      
      // 6. マイページにリダイレクト (2秒後)
      setTimeout(() => {
        router.push("/mypage");
      }, 2000);

    } catch (error) {
      console.error("LINE callback error:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "ログインに失敗しました"
      );

      // エラー時は 5 秒後にホームへ
      setTimeout(() => {
        router.push("/");
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-green-600 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              LINE ログイン処理中...
            </h2>
            <p className="text-sm text-gray-600">
              しばらくお待ちください
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              ログイン成功！
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              マイページに移動します...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              ログインに失敗しました
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {errorMessage}
            </p>
            <p className="text-xs text-gray-500">
              5秒後にホームに戻ります...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function LineCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <LineCallbackContent />
    </Suspense>
  );
}

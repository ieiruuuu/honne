"use client";

import { useState } from "react";
import { X, Mail, Loader2, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { AUTH_LABELS, AUTH_PROVIDERS } from "../constants";
import type { AuthProvider } from "@/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithProvider, loginWithEmail, error } = useAuth();
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: AuthProvider) => {
    setIsLoading(true);
    try {
      const result = await loginWithProvider(provider);
      if (result.success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const result = await loginWithEmail(email);
      if (result.success) {
        setEmailSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={isLoading}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {AUTH_LABELS.WELCOME}
          </h2>
          <p className="text-sm text-gray-600">
            {AUTH_LABELS.ANONYMOUS_GUARANTEE}
          </p>
        </div>

        {/* 匿名性保証バッジ */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Shield className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-800 font-medium">
            {AUTH_LABELS.REAL_NAME_NOT_EXPOSED}
          </p>
        </div>

        {emailSent ? (
          /* メール送信完了画面 */
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              メールを送信しました
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {AUTH_LABELS.MAGIC_LINK_SENT}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="w-full"
            >
              戻る
            </Button>
          </div>
        ) : showEmailForm ? (
          /* メールログインフォーム */
          <div>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={AUTH_LABELS.EMAIL_PLACEHOLDER}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-3 gap-2"
                style={{ backgroundColor: AUTH_PROVIDERS.email.color }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    {AUTH_LABELS.SEND_MAGIC_LINK}
                  </>
                )}
              </Button>
            </form>

            <Button
              variant="ghost"
              onClick={() => setShowEmailForm(false)}
              className="w-full mt-4"
              disabled={isLoading}
            >
              他の方法でログイン
            </Button>
          </div>
        ) : (
          /* ソーシャルログインボタン */
          <div className="space-y-3">
            {/* LINE */}
            <button
              onClick={() => handleSocialLogin("line")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: AUTH_PROVIDERS.line.color }}
            >
              <span className="text-xl">{AUTH_PROVIDERS.line.icon}</span>
              {AUTH_LABELS.LOGIN_WITH_LINE}
            </button>

            {/* X (Twitter) */}
            <button
              onClick={() => handleSocialLogin("twitter")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: AUTH_PROVIDERS.twitter.color }}
            >
              <span className="text-xl">{AUTH_PROVIDERS.twitter.icon}</span>
              {AUTH_LABELS.LOGIN_WITH_X}
            </button>

            {/* Apple */}
            <button
              onClick={() => handleSocialLogin("apple")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: AUTH_PROVIDERS.apple.color }}
            >
              <span className="text-xl">{AUTH_PROVIDERS.apple.icon}</span>
              {AUTH_LABELS.LOGIN_WITH_APPLE}
            </button>

            {/* 区切り線 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">または</span>
              </div>
            </div>

            {/* Email */}
            <button
              onClick={() => setShowEmailForm(true)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: AUTH_PROVIDERS.email.color }}
            >
              <Mail className="w-5 h-5" />
              {AUTH_LABELS.LOGIN_WITH_EMAIL}
            </button>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && !emailSent && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* ログインのメリット */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-3">
            {AUTH_LABELS.WHY_LOGIN}
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              {AUTH_LABELS.BENEFIT_1}
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              {AUTH_LABELS.BENEFIT_2}
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              {AUTH_LABELS.BENEFIT_3}
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <Check className="w-4 h-4 text-green-600" />
              {AUTH_LABELS.BENEFIT_4}
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

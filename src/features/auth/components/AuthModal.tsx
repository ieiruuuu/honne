"use client";

import { useState } from "react";
import { X, Loader2, Shield, Check, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { AUTH_LABELS, AUTH_PROVIDERS } from "../constants";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithLine, signUpWithEmail, signInWithEmail, error } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
    setLocalError(null);
    setSuccessMessage(null);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLineLogin = () => {
    setIsLoading(true);
    loginWithLine();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    // バリデーション
    if (!validateEmail(email)) {
      setLocalError(AUTH_LABELS.INVALID_EMAIL);
      return;
    }

    if (password.length < 6) {
      setLocalError(AUTH_LABELS.PASSWORD_TOO_SHORT);
      return;
    }

    if (mode === 'signup' && password !== passwordConfirm) {
      setLocalError(AUTH_LABELS.PASSWORD_MISMATCH);
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const result = await signUpWithEmail(email, password);
        if (result.success) {
          if (result.needsEmailConfirmation) {
            setSuccessMessage(AUTH_LABELS.EMAIL_CONFIRMATION_REQUIRED);
            resetForm();
          } else {
            setSuccessMessage(AUTH_LABELS.SIGNUP_SUCCESS);
            setTimeout(() => onClose(), 1500);
          }
        } else {
          setLocalError(result.error || AUTH_LABELS.SIGNUP_ERROR);
        }
      } else {
        const result = await signInWithEmail(email, password);
        if (result.success) {
          setSuccessMessage(AUTH_LABELS.LOGIN_SUCCESS);
          setTimeout(() => onClose(), 1500);
        } else {
          setLocalError(result.error || AUTH_LABELS.LOGIN_ERROR);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="relative w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
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
            {mode === 'login' ? AUTH_LABELS.LOGIN_TITLE : AUTH_LABELS.SIGNUP_TITLE}
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

        {/* メール/パスワードフォーム */}
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {AUTH_LABELS.EMAIL_LABEL}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={AUTH_LABELS.EMAIL_PLACEHOLDER}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {AUTH_LABELS.PASSWORD_LABEL}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={AUTH_LABELS.PASSWORD_PLACEHOLDER}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* パスワード確認（新規登録時のみ） */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {AUTH_LABELS.PASSWORD_CONFIRM_LABEL}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder={AUTH_LABELS.PASSWORD_CONFIRM_PLACEHOLDER}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                処理中...
              </>
            ) : (
              mode === 'login' ? AUTH_LABELS.LOGIN_BUTTON : AUTH_LABELS.SIGNUP_BUTTON
            )}
          </button>
        </form>

        {/* トグルリンク */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? AUTH_LABELS.NO_ACCOUNT : AUTH_LABELS.HAVE_ACCOUNT}
            {' '}
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              {mode === 'login' ? AUTH_LABELS.GOTO_SIGNUP : AUTH_LABELS.GOTO_LOGIN}
            </button>
          </p>
        </div>

        {/* 区切り線 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">{AUTH_LABELS.OR_DIVIDER}</span>
          </div>
        </div>

        {/* LINE ログインボタン */}
        <button
          onClick={handleLineLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-lg font-medium text-white text-lg transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
          style={{ backgroundColor: AUTH_PROVIDERS.line.color }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              認証中...
            </>
          ) : (
            <>
              <span className="text-2xl">{AUTH_PROVIDERS.line.icon}</span>
              {AUTH_LABELS.LOGIN_WITH_LINE}
            </>
          )}
        </button>

        {/* 成功メッセージ */}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* エラーメッセージ */}
        {(localError || error) && !successMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{localError || error}</p>
          </div>
        )}

        {/* ログインのメリット */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-3">
            {AUTH_LABELS.WHY_LOGIN}
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              {AUTH_LABELS.BENEFIT_1}
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              {AUTH_LABELS.BENEFIT_2}
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              {AUTH_LABELS.BENEFIT_3}
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              {AUTH_LABELS.BENEFIT_4}
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

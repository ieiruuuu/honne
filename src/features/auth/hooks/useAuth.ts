import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { AuthProvider, User } from '@/types';
import { NICKNAME_PREFIXES, NICKNAME_SUFFIXES } from '../constants';

// 環境変数チェック
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * ランダムニックネーム生成
 */
const generateRandomNickname = (): string => {
  const prefix = NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)];
  const suffix = NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)];
  const number = Math.floor(Math.random() * 9999);
  return `${prefix}${suffix}${number}`;
};

/**
 * 認証カスタムフック
 * 
 * 機能:
 * - ソーシャルログイン (LINE, X, Apple)
 * - メールマジックリンク
 * - 自動ニックネーム生成
 * - セッション管理
 */
export function useAuth() {
  const { user, isAuthenticated, setUser, setLoading, logout: storeLogout } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  /**
   * 初期セッションチェック
   */
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * セッション確認
   */
  const checkSession = async () => {
    if (!isSupabaseConfigured) {
      console.warn('⚠️ Supabase is not configured. Using mock auth.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Supabase ユーザーから User オブジェクトを構築
        const userData: User = {
          id: session.user.id,
          email: session.user.email,
          nickname: session.user.user_metadata?.nickname || generateRandomNickname(),
          avatar_url: session.user.user_metadata?.avatar_url,
          provider: (session.user.app_metadata?.provider as AuthProvider) || 'email',
          created_at: session.user.created_at,
        };

        // ニックネームが未設定の場合、生成して更新
        if (!session.user.user_metadata?.nickname) {
          await updateNickname(userData.nickname);
        }

        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setError(err instanceof Error ? err.message : 'セッション確認に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ニックネーム更新
   */
  const updateNickname = async (nickname: string) => {
    if (!isSupabaseConfigured) return;

    try {
      await supabase.auth.updateUser({
        data: { nickname },
      });
    } catch (err) {
      console.error('Nickname update error:', err);
    }
  };

  /**
   * ソーシャルログイン
   */
  const loginWithProvider = async (provider: AuthProvider) => {
    if (!isSupabaseConfigured) {
      // モック認証（開発用）
      const mockUser: User = {
        id: 'mock-' + Date.now(),
        email: `mock@${provider}.com`,
        nickname: generateRandomNickname(),
        provider,
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      return { success: true };
    }

    try {
      setError(null);
      
      // プロバイダーマッピング (Supabase仕様)
      const providerMap: Record<AuthProvider, string> = {
        line: 'line',
        twitter: 'twitter',
        apple: 'apple',
        email: 'email',
      };

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        // @ts-expect-error - Supabase provider type mismatch
        provider: providerMap[provider],
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * メールマジックリンクログイン
   */
  const loginWithEmail = async (email: string) => {
    if (!isSupabaseConfigured) {
      // モック認証
      const mockUser: User = {
        id: 'mock-' + Date.now(),
        email,
        nickname: generateRandomNickname(),
        provider: 'email',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      return { success: true };
    }

    try {
      setError(null);

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'メール送信に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * ログアウト
   */
  const logout = async () => {
    if (!isSupabaseConfigured) {
      storeLogout();
      return { success: true };
    }

    try {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;

      storeLogout();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログアウトに失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: useAuthStore.getState().isLoading,
    error,
    loginWithProvider,
    loginWithEmail,
    logout,
    checkSession,
  };
}

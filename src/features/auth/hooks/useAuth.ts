import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { generateLineAuthUrl } from '@/lib/line-auth';
import type { User } from '@/types';
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
 * - LINE ログイン（直接 OAuth 2.0 連携）
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
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email,
          nickname: session.user.user_metadata?.nickname || generateRandomNickname(),
          avatar_url: session.user.user_metadata?.avatar_url,
          provider: (session.user.app_metadata?.provider as 'line' | 'email') || 'email',
          created_at: session.user.created_at,
        };

        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * LINE ログイン
   */
  const loginWithLine = () => {
    try {
      setError(null);
      const { url } = generateLineAuthUrl();
      
      // LINE 認証ページにリダイレクト
      window.location.href = url;
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'LINE ログインに失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * メール/パスワードで新規登録
   */
  const signUpWithEmail = async (email: string, password: string) => {
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
      return { success: true, needsEmailConfirmation: false };
    }

    try {
      setError(null);

      const nickname = generateRandomNickname();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // メール確認が必要かチェック
        const needsEmailConfirmation = !data.session;

        if (data.session) {
          const userData: User = {
            id: data.user.id,
            email: data.user.email,
            nickname,
            provider: 'email',
            created_at: data.user.created_at,
          };
          setUser(userData);
        }

        return { success: true, needsEmailConfirmation };
      }

      return { success: false, error: '登録に失敗しました' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登録に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * メール/パスワードでログイン
   */
  const signInWithEmail = async (email: string, password: string) => {
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

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.session && data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email,
          nickname: data.user.user_metadata?.nickname || generateRandomNickname(),
          avatar_url: data.user.user_metadata?.avatar_url,
          provider: 'email',
          created_at: data.user.created_at,
        };

        setUser(userData);
        return { success: true };
      }

      return { success: false, error: 'ログインに失敗しました' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました';
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
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      storeLogout();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログアウトに失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * ユーザープロフィール更新（オンボーディング情報）
   */
  const updateUserProfile = async (data: { company_name?: string; salary?: number }) => {
    if (!isSupabaseConfigured) {
      // モック: LocalStorage に保存
      const currentUser = user;
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          company_name: data.company_name,
          salary: data.salary,
          has_onboarded: true,
        };
        setUser(updatedUser);
        localStorage.setItem('user_has_onboarded', 'true');
      }
      return { success: true };
    }

    try {
      if (!user) {
        return { success: false, error: 'ログインしてください' };
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          company_name: data.company_name,
          salary: data.salary,
          has_onboarded: true,
        },
      });

      if (updateError) throw updateError;

      // ローカル状態を更新
      const updatedUser: User = {
        ...user,
        company_name: data.company_name,
        salary: data.salary,
        has_onboarded: true,
      };
      setUser(updatedUser);
      localStorage.setItem('user_has_onboarded', 'true');

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新に失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * オンボーディングをスキップ
   */
  const skipOnboarding = () => {
    if (user) {
      const updatedUser: User = {
        ...user,
        has_onboarded: true,
      };
      setUser(updatedUser);
    }
    localStorage.setItem('user_has_onboarded', 'true');
  };

  return {
    user,
    isAuthenticated,
    isLoading: useAuthStore.getState().isLoading,
    error,
    loginWithLine,
    signUpWithEmail,
    signInWithEmail,
    logout,
    updateUserProfile,
    skipOnboarding,
  };
}

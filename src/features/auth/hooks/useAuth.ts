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
  const { user, isAuthenticated, sessionChecked, setUser, setLoading, setSessionChecked, logout: storeLogout } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  /**
   * 初期セッションチェック（全体で1回のみ実行）
   */
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      // 既にチェック済みの場合はスキップ
      if (sessionChecked) {
        return;
      }

      if (!isMounted) return;
      
      await checkSession();
    };

    initSession();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionChecked]); // sessionChecked を依存配列に追加

  /**
   * セッション確認
   */
  const checkSession = async () => {
    const abortController = new AbortController();
    
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured) {
        console.warn("⚠️ Supabase is not configured. Skipping session check.");
        setUser(null);
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // AbortController でキャンセルされた場合は処理を中断
      if (abortController.signal.aborted) {
        return;
      }

      if (sessionError) {
        console.error('❌ Session check error:', sessionError);
        setUser(null);
        return;
      }

      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email,
          nickname: session.user.user_metadata?.nickname || generateRandomNickname(),
          avatar_url: session.user.user_metadata?.avatar_url,
          provider: (session.user.app_metadata?.provider as 'line' | 'email') || 'email',
          created_at: session.user.created_at,
        };

        console.log("✅ Session found. User ID:", userData.id);
        setUser(userData);
      } else {
        // Guest モード (ログ削減のため一度だけ表示)
        if (!sessionStorage.getItem('guest-mode-logged')) {
          console.log("ℹ️ No active session found. Guest mode enabled.");
          sessionStorage.setItem('guest-mode-logged', 'true');
        }
        setUser(null);
      }
    } catch (err) {
      // AbortError は無視
      if (err instanceof Error && err.name === 'AbortError') {
        console.log("⚠️ Session check aborted");
        return;
      }

      // signal が中断された場合は状態を更新しない
      if (abortController.signal.aborted) {
        return;
      }

      console.error('❌ Session check exception:', err);
      setUser(null);
    } finally {
      // signal が中断されていない場合のみローディング解除
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
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
      const error = "Supabase設定が必要です。.env.localファイルを確認してください。";
      console.error("❌", error);
      setError(error);
      return { success: false, error };
    }

    try {
      setError(null);

      // クライアント側バリデーション
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        const error = 'メールアドレスとパスワードを入力してください';
        console.error('❌ Validation failed:', error);
        setError(error);
        return { success: false, error };
      }

      if (trimmedPassword.length < 6) {
        const error = 'パスワードは6文字以上で入力してください';
        console.error('❌ Password too short:', trimmedPassword.length);
        setError(error);
        return { success: false, error };
      }

      const nickname = generateRandomNickname();

      console.log('📝 Attempting signup with:', {
        email: trimmedEmail,
        passwordLength: trimmedPassword.length,
        nickname,
      });

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          data: {
            nickname,
          },
        },
      });

      if (signUpError) {
        console.error('❌ Supabase signup error:', signUpError);
        console.error('   Error code:', signUpError.status);
        console.error('   Error message:', signUpError.message);
        throw signUpError;
      }

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
      const error = "Supabase設定が必要です。.env.localファイルを確認してください。";
      console.error("❌", error);
      setError(error);
      return { success: false, error };
    }

    try {
      setError(null);

      // クライアント側バリデーション
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        const error = 'メールアドレスとパスワードを入力してください';
        console.error('❌ Validation failed:', error);
        setError(error);
        return { success: false, error };
      }

      if (trimmedPassword.length < 6) {
        const error = 'パスワードは6文字以上で入力してください';
        console.error('❌ Password too short:', trimmedPassword.length);
        setError(error);
        return { success: false, error };
      }

      console.log('🔑 Attempting login with:', {
        email: trimmedEmail,
        passwordLength: trimmedPassword.length,
      });

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (signInError) {
        console.error('❌ Supabase auth error:', signInError);
        console.error('   Error code:', signInError.status);
        console.error('   Error message:', signInError.message);
        
        // エラーメッセージの改善
        let userFriendlyError = signInError.message;
        
        if (signInError.message.includes('Invalid login credentials')) {
          userFriendlyError = 'メールアドレスまたはパスワードが正しくありません';
        } else if (signInError.message.includes('Email not confirmed')) {
          userFriendlyError = 'メールアドレスの確認が必要です。受信トレイをご確認ください';
        } else if (signInError.message.includes('User not found')) {
          userFriendlyError = 'このメールアドレスは登録されていません';
        }
        
        throw new Error(userFriendlyError);
      }

      if (data.session && data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email,
          nickname: data.user.user_metadata?.nickname || generateRandomNickname(),
          avatar_url: data.user.user_metadata?.avatar_url,
          provider: 'email',
          created_at: data.user.created_at,
        };

        console.log('✅ Login successful. User ID:', userData.id);
        setUser(userData);
        return { success: true };
      }

      return { success: false, error: 'ログインに失敗しました' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました';
      console.error('❌ Login exception:', errorMessage);
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

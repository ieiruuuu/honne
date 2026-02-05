import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  nickname?: string;
  avatar_url?: string;
  bio?: string;
  company_name?: string;
  salary?: number;
  has_onboarded?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Supabase 設定確認
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

/**
 * プロフィール管理Hook
 * 
 * @param userId - ユーザーID
 * @returns profile - プロフィール情報
 * @returns isLoading - 読み込み中フラグ
 * @returns updateProfile - プロフィール更新関数
 * @returns refetch - 手動再読み込み関数
 */
export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * プロフィール取得
   */
  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.warn("⚠️ Supabase is not configured");
        setProfile(null);
        setIsLoading(false);
        return;
      }

      console.log("📊 Fetching profile for user:", userId);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError) {
        // プロフィールが存在しない場合は作成
        if (fetchError.code === "PGRST116") {
          console.log("📝 Profile not found, creating...");
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([{ id: userId }])
            .select()
            .single();

          if (insertError) {
            console.error("❌ Error creating profile:", insertError);
            throw insertError;
          }

          console.log("✅ Profile created:", newProfile);
          setProfile(newProfile);
        } else {
          console.error("❌ Error fetching profile:", fetchError);
          throw fetchError;
        }
      } else {
        console.log("✅ Profile loaded:", data);
        setProfile(data);
      }
    } catch (err) {
      console.error("❌ Exception in fetchProfile:", err);
      const errorMessage = err instanceof Error ? err.message : "プロフィールの取得に失敗しました";
      setError(errorMessage);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * プロフィール更新
   */
  const updateProfile = useCallback(
    async (updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
      if (!userId) {
        return { success: false, error: "ユーザーIDが必要です" };
      }

      try {
        if (!isSupabaseConfigured) {
          return { success: false, error: "Supabase設定が必要です" };
        }

        console.log("📝 Updating profile:", updates);

        const { data, error: updateError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: userId,
              ...updates,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          )
          .select()
          .single();

        if (updateError) {
          console.error("❌ Error updating profile:", updateError);
          return { success: false, error: updateError.message };
        }

        console.log("✅ Profile updated:", data);
        setProfile(data);
        return { success: true };
      } catch (err) {
        console.error("❌ Exception in updateProfile:", err);
        const errorMessage = err instanceof Error ? err.message : "プロフィールの更新に失敗しました";
        return { success: false, error: errorMessage };
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}

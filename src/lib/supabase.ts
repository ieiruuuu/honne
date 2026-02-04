import { createClient } from "@supabase/supabase-js";

/**
 * 環境変数の無結性検証
 * Placeholder値やundefinedをチェック
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Placeholder値の検証
const isPlaceholder = (value: string) => {
  return (
    !value ||
    value === "https://placeholder.supabase.co" ||
    value === "your_supabase_anon_key_here" ||
    value === "placeholder-key"
  );
};

// 設定の有効性チェック
export const isSupabaseConfigured = 
  !isPlaceholder(supabaseUrl) && 
  !isPlaceholder(supabaseAnonKey);

// 開発環境での警告表示
if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn("⚠️ Supabase configuration not properly set.");
  console.warn("Please update the following in .env.local:");
  console.warn("- NEXT_PUBLIC_SUPABASE_URL");
  console.warn("- NEXT_PUBLIC_SUPABASE_ANON_KEY");
  console.warn("\nCurrent values:");
  console.warn("URL:", supabaseUrl || "(empty)");
  console.warn("Key:", supabaseAnonKey ? "(set but may be placeholder)" : "(empty)");
}

// Supabaseクライアント作成
// Placeholder値でも作成（エラー防止のため）
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

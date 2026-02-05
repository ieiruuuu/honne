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

// 🔧 デバッグログ（開発環境・サーバーサイドのみ）
if (typeof window === "undefined") {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔧 Supabase環境変数チェック");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 URL:", supabaseUrl ? supabaseUrl.substring(0, 35) + "..." : "❌ 未設定");
  console.log("🔑 Key:", supabaseAnonKey ? supabaseAnonKey.substring(0, 25) + "..." : "❌ 未設定");
  console.log("✅ 設定状態:", isSupabaseConfigured ? "✓ 正常" : "❌ Placeholder値（要更新）");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// 開発環境での警告表示
if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.error("🚨 Supabase設定エラー / Supabase Configuration Error");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("❌ .env.localファイルがまだ更新されていません！");
  console.error("❌ .env.local file is not updated yet!");
  console.error("");
  console.error("📝 以下の手順に従ってください:");
  console.error("1. https://supabase.com にアクセス");
  console.error("2. プロジェクトを開く → Settings → API");
  console.error("3. Project URLとanon public keyをコピー");
  console.error("4. .env.localファイルの2行を実際の値に置き換える");
  console.error("5. サーバーを再起動: rm -rf .next && npm run dev");
  console.error("");
  console.error("現在の値 / Current values:");
  console.error("  URL:", supabaseUrl || "(empty)");
  console.error("  Key:", supabaseAnonKey ? "(placeholder)" : "(empty)");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // ブラウザアラート（1回のみ）
  if (!sessionStorage.getItem("supabase-config-alert-shown")) {
    sessionStorage.setItem("supabase-config-alert-shown", "true");
    setTimeout(() => {
      alert(
        "🚨 Supabase設定エラー\n\n" +
        ".env.localファイルにSupabaseのAPIキーを設定してください。\n\n" +
        "詳細はコンソール(F12)をご確認ください。"
      );
    }, 1000);
  }
}

// Supabaseクライアント作成
// Placeholder値でも作成（エラー防止のため）
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);
